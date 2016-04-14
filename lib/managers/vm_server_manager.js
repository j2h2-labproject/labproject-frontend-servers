var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var config = require(LABPROJECT_BASE + "/config");

var vm_server_client = null;

module.exports = {
	initialize: function(new_client) {
		vm_server_client = new_client;
	},
	list_servers: function(callback) {
		var server_list = [];
		for (var i = 0; i < config.vm_servers.hosts.length; i++) {
			var current = config.vm_servers.hosts[i];

			server_list.push(new vm_server(current.name, current.host));

		}

		callback(null, server_list);

	},
	get_server: function(callback) {

	},
	get_transport: function(callback) {
		var transport_name = config.vm_servers.name;
	}
}

function vm_server(name, address) {
	if (!name || !address) {
		return;
	}

	var self = this;
	var Private = {
		name: name
	};

	self.name = function() {
		return Private.name;
	}

	self.is_connected

}
