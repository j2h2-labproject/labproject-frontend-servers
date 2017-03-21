
module.exports = function(socket) {
    var self = this;
    self.send_message = function(message, callback) {
        data = {
            message: message
        };
        socket.emit("messaging:send_message", data, function(result) {
            callback(result.error, result.result);
        });
    };

    self.get_messages = function(count, offset, callback) {
        data = {
            count: count,
            offset: offset
        };
        socket.emit("messaging:get_messages", data, function(result) {
            callback(result.error, result.result);
        });
    };

    self.set_handler = function(handler, callback) {
        data = {
            handler: handler
        };
        socket.emit("messaging:set_handler", data, function(result) {
            callback(result.error, result.result);
        });
    };
    return self;
}