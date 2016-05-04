var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var server_manager = require(LABPROJECT_LIB + "/managers/vm_server_manager");

module.exports = {
	initialize: function(new_client) {
		server_manager.initialize(new_client);
	},
	list_servers: function(session_id, callback) {
		server_manager.list_servers(function(error, result) {
			callback(error, result);
		});
	}
};
