// tcp_transport client
var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var common_crypto = require(LABPROJECT_LIB + "/common/crypto");

var EventEmitter = require("events").EventEmitter;
 


ee.once("someEvent", function () {
    console.log("event has occured");
});
 
ee.once("someEvent2", function () {
    console.log("same event has occured");
}); 

ee.emit("someEvent");
ee.emit("someEvent2");


var net = require("net");
var EventEmitter = require("events").EventEmitter;

var client_map = {}

module.exports = {
	connect_clients: function (logger, on_send, on_recieve, config, callback) {
		
		var connected_count = 0;
		var has_error = false;
		
		for (var i = 0; i < config.hosts.length; i++) {
			
			var current = config.hosts[i];
			
			client_map[current.name] = new tcp_transport_client(current.host, current.port, current.clientkey, logger);
			
			client_map[current.name].connect(function(error, status) {
				if (!error && status == true) {
					connected_count += 1;
				} else {
					has_error = true;
				}
			});
		}
		
		
		while (connected_count < config.hosts.length) {
			if (has_error) {
				callback(new Error("Error connecting to vm servers", null);
				return;
			}
		}
		
		callback(null, new vm_server_client(client_map));
		
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
				if (!error) {
					callback(null, result);
				} else {
					callback(new Error(error), null);
				}
			});
			
		} else {
			callback(new Error("Invalid server id"), null);
		}
	}
}


function tcp_transport_client(host, port, clientkey, logger, on_receive) {
	var self = this;
	
	var client_host = host;
	var client_port = port;
	var clientkey = clientkey;
	
	var connected = false;
	var connection = null;
	
	var client_logger = logger;
	
	var client_emitter = new EventEmitter();
	client_emitter.setMaxListeners(1);
	
	self.connect = function(callback) {
		try {
			connection = net.createConnection({port: client_host, host: client_port}, function() {
				
				logger.log("notice", "Connected to " + client_host);
				connection.setKeepAlive(true);
				connected = true;
				
				connection.on('error', function(error) {
					
				});
				
				connection.on('end', function() {
					connected = false;
				});
				
				connection.on('data', 
				
				callback(null, true);
			});
			
		} catch (error) {
			callback(new Error("Could not connect to vm server"), null);
		}
	};
	
	self.ensure_connected = function(callback) {
		if (!connected) {
			
		} else {
			
		}
	}
	
	self.is_connected = function() {
		return (connected === true);
	}
	
	self.disconnect = function() {
		
	}
	
	self.send = function(payload, callback) {
		if (connected) {
			
			var send_data = {
				key: clientkey,
				transfer_id: 
				payload: payload
			}
			
			
			
			socket.write(JSON.stringify(send_data));
			
			
		}
	}
	
	
	
}
	


function tcp_handle(logger, on_start, on_data

const client = net.createConnection({port: 8124}, () => {
  //'connect' listener
  console.log('connected to server!');
  client.write('world!\r\n');
});
client.on('data', (data) => {
  console.log(data.toString());
  client.end();
});
client.on('end', () => {
  console.log('disconnected from server');
});
