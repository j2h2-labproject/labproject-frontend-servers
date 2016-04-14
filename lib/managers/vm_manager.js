var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var vm_server_client = null;

module.exports = {
	initialize: function(new_client) {
		vm_server_client = new_client;
	},
	new_vm: function(config, callback) {

	},
	get_vm: function(uuid, callback) {

	},
	delete_vm: function(uuid, callback) {

	}
}

function virtual_machine(uuid, name) {
	var self = this;

	var Private = {
		uuid: uuid,
		name: name,
		mem_size: null,
		hd_list: [],
		cdrom_list: [],
		tags: [],
		template: false,
		owner: null,
		users_use: [],
		users_edit: [],
		groups_use: [],
		groups_edit: []
	}


	self.init = function(callback) {
		database.insert('registered_devices', {"uuid": Private.uuid, "name": Private.name}, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {
				callback(new Error("Device insert failed"), null);
			}
		});
	}

	self.load = function(callback) {
		database.findOne('registered_devices', {"uuid": Private.uuid, "name": Private.name}, function(d_error, result) {
			if (result) {

				Private = result;

				callback(null, true);

			} else if (d_error) {
				callback(d_error, null);
			} else {
				callback(new Error("User does not exist"), null);
			}
		});
	}

	self.save = function(callback) {
		database.update('registered_devices', {"uuid": Private.uuid, "name": Private.name}, Private, false, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {
				callback(new Error("Device update failed"), null);
			}
		});
	}

	self.delete = function(callback) {
		database.remove('users', {"uuid": Private.uuid, "name": Private.name}, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {
				callback(new Error("Device delete failed"), null);
			}
		});
	}

	self.state = {
		start: function(callback) {

		},
		stop: function(callback) {

		},
		force_stop: function(callback) {

		}
	}

	self.config = {
		get_name: function() {

		},

	}

	function generate_xml() {

	}


}
