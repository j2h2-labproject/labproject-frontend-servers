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

            // socket.on("server_response", function(data, response) {

            // });

            socket.on('disconnect', function() {
                client_logger.log("warning", "Disconnected from server");
                connected = false;
            });

            socket.on('reconnect_attempt', function() {
                client_logger.log("notice", "Attempting to reconnect to server");
            });

            socket.on('reconnect', function(){
                client_logger.log("notice", "Successfully reconnected to server");
                connected = true;
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

    // Send data to server
    self.send = function(payload, callback) {
        if (connected) {
            var request_data = {
                clientkey: clientkey,
                payload: payload
            }

            client_socket.emit("server_request", request_data, function(resp) {
                if (!resp.error) {
                    callback(null, resp.payload);
                } else {
                    callback(new Error(resp.error), null);
                } 
            });
        } else {
            callback(new Error("SOCKET_IO_TRANSPORT_NOT_CONNECTED"), null);
        }
    }
}
