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
		template: false
	}


	self.init = function(callback) {
		database.insert('', {"username": username}, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {
				callback(new Error("User insert failed"), null);
			}
	}

	self.load = function(callback) {

	}

	self.save = function(callback) {

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

}

vm_server_util.call(server_name, "function", params, function (error, data) {

});
