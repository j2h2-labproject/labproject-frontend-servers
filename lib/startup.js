var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var config = require(LABPROJECT_BASE + "/config");
var fs = require("fs");

var hypervisor_string = require(LABPROJECT_LIB + "/common/hypervisor_string");
var logging = require(LABPROJECT_LIB + "/common/logging");


module.exports = {
	// Start the front-end server
	start: function(config, onstart, onstop, callback) {

		logger = new logging.logger("FRONTEND_SERVER_MAIN", "cli");

		// Connect to our vm servers
		var transport_name = config.vm_servers.name;
		var transport = null;

		logger.log("notice", "Starting transport '" + transport_name + "'");

		try {
			transport = require(LABPROJECT_LIB + "/transports/" + transport_name);
		} catch (error) {
			logger.log("error", "Could not load transport '" + transport_name + "'");
			callback(new Error("Could not load transport '" + transport_name + "'"), null);
			return;
		}

		if (transport == null) {
			logger.log("error", "Did not load a transport");
			callback(new Error("Failed to load a transport"), null);
		} else {
			var vm_client_logger = new logging.logger("FRONTEND_SERVER_VM_CLIENT", "cli");
			transport.connect_clients(vm_client_logger, config.vm_servers.hosts,  function(error, vm_server_client) {
				start_frontends(vm_server_client);
			});
		}
	}
}


function start_frontends(vm_server_client, callback) {
	var frontend_list = config.frontends;
	var frontend_logger = new logging.logger("FRONTEND_FRONTENDS", "cli");

	for (var i = 0; i < frontend_list.length;i++){
		var current = frontend_list[i];

		var frontend_type = current.type;


		var frontend = null;


		try {
			frontend = require(LABPROJECT_LIB + "/frontends/" + frontend_type + "/" + frontend_type);
		} catch (error) {
			logger.log("error", "Could not load frontend '" + frontend_type + "'");
			console.log(error);
			return;
		}

		if (frontend === null) {
			logger.log("error", "Did not load the frontend");
		} else {

			frontend.start(frontend_logger, vm_server_client, current.config, function(error, status) {
				logger.log("notice", "Started frontend '" + frontend_type + "'");
			});
		}

	}
}
