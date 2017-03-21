var io = require('socket.io-client');

module.exports = {
    connect: function() {
        console.log("Connecting...");
        var socket = io.connect();
        return socket;
    }
}