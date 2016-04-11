var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var net = require("net");

var lab_controller = require(LABPROJECT_LIB + "/controllers/lab_controller");
var session_controller = require(LABPROJECT_LIB + "/controllers/session_controller");
var sanitize = require(LABPROJECT_LIB + '/common/sanitize');

var temp = null;

module.exports = {
	start: function (logger, vm_server_client, config, on_start) {

		//~ lab_controller.initialize(vm_servers);

		if (temp === null) {

			temp = vm_server_client;

			try {
				var server = net.createServer(function (socket) {
					tcp_handle(socket, logger);
				});

				server.on('close', function(){

				});

				server.listen(config.port, function() {
					on_start(null, server.address());
				});

			} catch (ex){

			}

		} else {
			vm_server_client.destroy();
		}




	}
}


function tcp_handle(socket, logger) {

		var session_id = null;
		var username = null;

		logger.log("notice", "Connection from " + socket.remoteAddress);

		socket.on('end', function() {
			logger.log("notice", "Disconnected from " + socket.remoteAddress);
		});

		var buffer = "";

		socket.on('data', function(data) {
			data_string = data.toString();

			buffer += data_string;

			if (buffer.endsWith("\n")) {

				if (session_id === null && username === null) {
					username = sanitize.simple_string(buffer);
				} else if (session_id === null) {
					
				} else {
					parse_command(buffer, function(error, result) {
						if (error) {
							socket.write("! - ERROR: " + error + "\n");
						} else {
							socket.write(result + "\n");
						}

						socket.write("> ");
					});
				}


				buffer = "";

			}

		});

		socket.write('\n==========================\nLabProject CLI\n==========================\n');

		if (session_id === null && username === null) {
			socket.write("Username: ");
		} else if (session_id === null) {
			socket.write("Password: ");
		} else {
			socket.write("> ");
		}


}

function parse_command(command, callback) {
	temp.call("test", "status", {}, function(error, result) {
		callback(error, result);
	});

}
