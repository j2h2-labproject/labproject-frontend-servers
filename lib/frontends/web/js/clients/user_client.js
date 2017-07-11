module.exports = function(socket) {
    var self = this;

    self.get_profile = function(callback) {
        socket.emit("user:get_profile", {}, function(result) {
            callback(result.error, result.result);
        });
    };

    return self;
}