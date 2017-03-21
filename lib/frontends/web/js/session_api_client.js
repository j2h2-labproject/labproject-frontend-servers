var socket = null;

module.exports = {
    initialize: function(s) {
        socket = s;
    },
    session_valid: function(callback) {
        socket.emit("session:session_valid", null, function(result) {
            callback(null, result);
        });
    }
}