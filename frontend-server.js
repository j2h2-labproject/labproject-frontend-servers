var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var config = require(LABPROJECT_BASE + "/config");
var startup = require(LABPROJECT_LIB + "/startup");
var logging = require(LABPROJECT_LIB + "/common/logging");

// Start the server
startup.start(config, function(err, netdata, server) {
	logger = new logging.logger("SERVER", "cli");
	
	logger.log("notice", "Server has started at " + netdata.address + ":" + netdata.port, function(){});
		
	//~ server.close();
	
}, function(exitstatus) {
	if (exitstatus == null) {
		logger.log("notice", "Server has stopped", function(){})
	} else {
		logger.log("warning", "Server has stopped with an error", function(){})
	}
	
}); 
