const LABPROJECT_BASE = process.cwd();
const LABPROJECT_LIB = process.cwd() + "/lib";
var messaging_controller = require(LABPROJECT_LIB + "/controllers/stubs/messaging_controller")();

module.exports = {
    register: function(socket) {
        socket.on("messaging:send_message", function(data, callback) {
            var session_id = socket.request.session_id;
            messaging_controller.send_message(session_id, data.message, function(error, result) {
                callback({"error": error, "result": result});
            });
        });

        socket.on("messaging:get_messages", function(data, callback) {
            var session_id = socket.request.session_id;
            messaging_controller.get_messages(session_id, data.count, data.offset, function(error, result) {
                callback({"error": error, "result": result});
            });
        });

        socket.on("messaging:set_handler", function(data, callback) {
            var session_id = socket.request.session_id;
            messaging_controller.set_handler(session_id, data.handler, function(error, result) {
                callback({"error": error, "result": result});
            });
        });
    }
};