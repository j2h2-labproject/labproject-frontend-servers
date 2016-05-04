var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var vm_server_client = null;


var uuid = require('uuid');

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');
var common_crypto = require(LABPROJECT_LIB + '/common/crypto');
var database = require(LABPROJECT_LIB + '/util/database');
var hypervisor_string = require(LABPROJECT_LIB + '/common/hypervisor_string');
var string_util = require(LABPROJECT_LIB + '/common/string');

module.exports = {
	initialize: function(new_client) {
		vm_server_client = new_client;
	},
	new_vswitch: function(vm_server, name, callback) {
		if (vm_server_client === null) {
			callback(new Error("initialize function must be run first"), null);
		} else {
			create_new_vm(vm_server, name, callback);
		}
	},
	get_vswitch: function(uuid, callback) {
		if (vm_server_client === null) {
			callback(new Error("initialize function must be run first"), null);
		} else {
			var return_vm = new virtual_machine(uuid, vm_server_client);
			return_vm.load(function(error, result) {
				if (error) {
					callback(error, null);
				} else {
					callback(null, return_vm);
				}
			});
		}
	},
	delete_vswitch: function(uuid, callback) {
		if (vm_server_client === null) {
			callback(new Error("initialize function must be run first"), null);
		} else {
			var delete_vm = new virtual_machine(uuid, vm_server_client);
			delete_vm.delete(function(error, result) {
				callback(error, result);
			});
		}
	}
};

function generate_vm_id() {
	return "sw-" + uuid.v1();
}

function create_new_vm(vm_server, name, callback) {
	var vm_id = generate_vm_id();
	var new_vm_obj = new virtual_machine(vm_id, vm_server_client);

	new_vm_obj.init(function(i_error, status) {
		if (!i_error && status === true) {
			new_vm_obj.set_vm_server(vm_server);
			new_vm_obj.set_name(name);

			new_vm_obj.save(function(s_error, result) {
				if (!s_error) {
						callback(null, new_vm_obj);
				} else {
						callback(s_error, null);
				}

			});
		} else {
			if (i_error.name === "MongoError" && i_error.code === 11000) {
				create_new_vm(username, callback);
			} else {
				callback(i_error, null);
			}
		}
	});
}


function vswitch(uuid, server_client) {
	var self = this;

	var Private = {
		uuid: uuid,
		name: null,
		owner: null,
		tags: [],
		vm_server: null,
		users_use: [],
		users_edit: [],
		groups_use: [],
		groups_edit: [],
		started: false,
		// Switch config
    prefix: "eth",
	  ports: [],
    stp_on: true,
    vlan_list: []
	};


	self.init = function(callback) {
		database.insert('switches', {"uuid": Private.uuid}, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {
				callback(new Error("Switch insert failed"), null);
			}
		});
	};

	self.load = function(callback) {
		database.findOne('switches', {"uuid": Private.uuid}, function(d_error, result) {
			if (result) {

				Private = result;

				callback(null, true);

			} else if (d_error) {
				callback(d_error, null);
			} else {
				callback(new Error("Switch does not exist"), null);
			}
		});
	};

	self.save = function(callback) {
		database.update('switches', {"uuid": Private.uuid}, Private, false, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {
				callback(new Error("Switch update failed"), null);
			}
		});
	};

	self.delete = function(callback) {
		database.remove('registered_devices', {"uuid": Private.uuid}, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {
				callback(new Error("Switch delete failed"), null);
			}
		});
	};

	self.get_uuid = function() {
		return Private.uuid;
	};

	self.get_name = function() {
		return Private.name;
	};

	self.set_name = function(name) {
		name = sanitize.simple_text(name);
		Private.name = name;
	};

	self.get_vm_server = function() {
		return Private.vm_server;
	};

	self.set_vm_server = function(vm_server) {
		vm_server = sanitize.simple_string(vm_server);
		Private.vm_server = vm_server;
	};

	self.get_owner = function() {
		return Private.owner;
	};

	self.set_owner = function(username) {
		username = sanitize.simple_string(username);
		Private.owner = username;
	};

	self.state = {
		is_defined: function() {
			return Private.defined;
		},
		start: function(callback) {


			server_client.call(Private.vm_server, "create_switch", {switch_id: self.uuid.replace("sw-", "")}, function(s_error, result) {
				if (!s_error) {
					Private.defined = true;

					self.save(function(s_error, result) {
						callback(null, result);
					});

				} else {
					callback(s_error, null);
				}
			});

		},
		stop: function(callback) {
			server_client.call(Private.vm_server, "delete_vm", {uuid: Private.uuid.replace("sw-", "")}, function(s_error, result) {
				if (!s_error) {
					Private.defined = false;

          self.save(function(s_error, result) {
            callback(null, true);
          });

				} else {
					callback(s_error, null);
				}
			});
		},
		is_running: function(callback) {
			server_client.call(Private.vm_server, "vm_is_running", {uuid: Private.uuid.replace("sw-", "")}, function(s_error, result) {
				if (!s_error) {
					callback(null, result);
				} else {
					callback(s_error, null);
				}
			});
		},
	  connect_port: function(location, host_interface) {

    },
    disconnect_port: function(location) {

    },
    set_port_mode: function(location, mode) {

    }

	};

	self.config = {

	};


}
