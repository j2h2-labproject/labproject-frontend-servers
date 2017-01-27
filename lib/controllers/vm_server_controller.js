var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";
var foreach = require(LABPROJECT_LIB + "/common/loop").foreach;

var server_manager = require(LABPROJECT_LIB + "/managers/vm_server_manager");

module.exports = {
	initialize: function(new_client) {
		server_manager.initialize(new_client);
	},
	list_servers: function(callback) {
		server_manager.list_servers(function(error, result) {
			callback(error, result);
		});
	},
	get_server_status: function(server, callback) {
		server_manager.get_server(server, function(g_error, server_obj) {
			if (g_error) {
				callback(g_error, null);
				return;
			}
			server_obj.get_status(function(s_error, status) {
				if (s_error) {
					callback(s_error, null);
					return;
				}
				
				callback(null, status);
			});
		});
	},
	get_server_info: function(callback) {
		server_manager.list_servers(function(error, server_list) {
			foreach(server_list,
				function(loc, server, pass_data, next) {
					server_manager.get_server
				},
				callback);
		});
	},
};
