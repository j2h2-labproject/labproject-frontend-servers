const LABPROJECT_BASE = process.cwd();
const LABPROJECT_LIB = process.cwd() + "/lib";
var user_controller = require(LABPROJECT_LIB + "/controllers/stubs/user_controller")();

module.exports = {
    register: function(socket) {
        socket.on("user:get_profile", function(data, callback) {
            var session_id = socket.request.session_id;
            user_controller.get_profile(session_id, function(error, result) {
                callback({"error": error, "result": result});
            });
        });
    }
}