var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var config = require(LABPROJECT_BASE + "/config");

var vm_server_client = null;

module.exports = {
	// Initilize the vm server client, must be called before any other method here
	initialize: function(new_client) {
		vm_server_client = new_client;
	},
	// List all vm servers
	list_servers: function(callback) {
		var server_list = [];
		for (var i = 0; i < config.vm_servers.hosts.length; i++) {
			var current = config.vm_servers.hosts[i];
			server_list.push(current.name);
		}

		callback(null, server_list);

	},
	// Get a server object
	get_server: function(name, callback) {
		var return_server = new vm_server(name, vm_server_client);
		return_server.load(function(error, status) {
			if (error) {
				callback(error, null);
			} else {
				callback(null, return_server);
			}
		});
	},
	get_transport: function(callback) {
		var transport_name = config.vm_servers.name;
	}
};

function vm_server(name, server_client) {
	if (!name||!server_client) {
		return;
	}

	var self = this;
	var Private = {
		name: name,
		server_client: server_client,
		host: null,
		port: null
	};

	self.name = function() {
		return Private.name;
	};

	self.load = function(callback) {
		for (var i = 0; i < config.vm_servers.hosts.length; i++) {
			var current = config.vm_servers.hosts[i];

			if (current.name == Private.name) {
				Private.host = current.host;
				Private.port = current.port;
				callback(null, true);
				return;
			}
		}
		callback(new Error("VM server does not exist"), null);
	};

	self.get_status = function(callback) {
		Private.server_client.call(Private.name, "usage", {}, function(s_error, result) {
			if (!s_error) {
				callback(null, result);
			} else {
				console.log("error", s_error);
				callback(s_error, null);
			}
		});
	};

	self.get_info = function(callback) {
		Private.server_client.call(Private.name, "systeminfo", {}, function(s_error, result) {
			if (!s_error) {
				callback(null, result);
			} else {
				console.log("error", s_error);
				callback(s_error, null);
			}
		});
	};
	// self.is_connected

}
