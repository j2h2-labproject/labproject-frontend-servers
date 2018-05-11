module.exports = function(socket) {
    var self = this;

    self.list_servers = function(callback) {
        data = {
        };
        socket.emit("vm_server:list_servers", data, function(result) {
            callback(result.error, result.result);
        });
    };
    
    self.get_server_status = function(server, callback) {
        data = {
            server: server,
        };
        socket.emit("vm_server:get_server_status", data, function(result) {
            callback(result.error, result.result);
        });
    };
    
    self.get_server_info = function(server, callback) {
        data = {
            server: server,
        };
        socket.emit("vm_server:get_server_info", data, function(result) {
            callback(result.error, result.result);
        });
    };
    
    self.get_server_debugdump = function(server, callback) {
        data = {
            server: server,
        };
        socket.emit("vm_server:get_server_debugdump", data, function(result) {
            callback(result.error, result.result);
        });
    };

    self.start_pulse = function(server, callback) {
        data = {
            server: server,
        };
        socket.emit("vm_server:on_server_pulse", data, function(result) {
            callback(result.error, result.result);
        });
    };

    return self;
}