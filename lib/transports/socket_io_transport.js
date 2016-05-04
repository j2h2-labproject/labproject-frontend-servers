// socket_io_transport client
var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var common_crypto = require(LABPROJECT_LIB + "/common/crypto");




function create_socket(location, callback) {
	var socket = require('socket.io-client')(location, {forceNew: true});
	socket.on('connect', function(){
		callback(null, socket);
	});
}

module.exports = {
	connect_clients: function(logger, hosts_config, callback) {

		add_clients(logger, 0, hosts_config, {}, function(error, client_map) {
			callback(null, new vm_server_client(client_map));
		});

	}
}

function add_clients(logger, location, hosts_config, client_map, callback) {
	if (location >= Object.keys(hosts_config).length) {
		callback(null, client_map);
	} else {
		var current_key = Object.keys(hosts_config)[location];
		var current = hosts_config[current_key];
		client_map[current.name] = new socket_io_client(current.clientkey, logger);

		client_map[current.name].connect('http://' + current.host + ':' + current.port, function(error, status) {
			add_clients(logger, location+1, hosts_config, client_map, callback);
		});
	}







}

function vm_server_client(client_map) {
	var self = this;
	var client_map = client_map;

	self.call = function(server_id, method, params, callback) {
		if (client_map.hasOwnProperty(server_id)) {

			var call_data = {
				'get': method
			}

			for (var item in params) {
				call_data[item] = params[item];
			}

			client_map[server_id].send(call_data, function(error, result) {

				if (error) {
					callback(error, null);
				} else if (result.error !== null) {
					callback(result.error, null);
				} else {
					callback(null, result.data);
				}

			});

		} else {
			callback(new Error("Invalid server id"), null);
		}
	}

	self.destroy = function() {
		for (var server_id in client_map) {
			client_map[server_id].disconnect();
		}
	}

}


function socket_io_client(clientkey, logger) {
	var self = this;

	var connected = false;
	var client_socket = null;
	var client_logger = logger;

	var response_map = {};

	self.connect = function(location, callback) {

		create_socket(location, function(error, socket) {

			client_logger.log("notice", "Connected to VM server at " + location);
			client_socket = socket;
			connected = true;

			socket.on("server_response", function(data) {

				client_logger.log("notice", "Recieved response from server");


				if (!data.hasOwnProperty('payload')||!data.hasOwnProperty('transact_id')||!data.hasOwnProperty('clientkey')||!data.hasOwnProperty('error')) {
					client_logger.log("error", "Recieved invalid response");
					return;
				}

				if (response_map.hasOwnProperty(data.transact_id)) {

					if (data.error != null) {
						response_map[data.transact_id](data.error, null);
					} else {
						response_map[data.transact_id](null, data.payload);
						delete response_map[data.transact_id];
					}
				}

			});

			callback(null, true);
		});

	};


	self.is_connected = function() {
		return (connected === true);
	}

	self.disconnect = function() {
		if (connected) {
			client_socket.disconnect();
		}
	}

	self.send = function(payload, callback) {
		if (connected) {

			var data_hash = common_crypto.sha256_string(clientkey +":" + JSON.stringify(payload) + Date.now());

			var transact_id = data_hash + "-" + common_crypto.random_hash();

			var request_data = {
				clientkey: clientkey,
				transact_id: transact_id,
				payload: payload
			}

			response_map[transact_id] = callback;

			client_socket.emit("server_request", request_data);

		}
	}



}
