var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var server_manager = require(LABPROJECT_LIB + "/config");

module.exports = {
	initialize: function(new_client) {
		server_manager.initialize(new_client);
	},
	list_servers: function(username, callback) {

	}
}
