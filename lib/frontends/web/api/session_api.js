const LABPROJECT_BASE = process.cwd();
const LABPROJECT_LIB = process.cwd() + "/lib";
var session_controller = require(LABPROJECT_LIB + "/controllers/stubs/session_controller");

module.exports = {
    register: function(socket) {
        socket.on('session:session_valid', function (data, callback) {
            var session_id = socket.request.session_id;
            session_controller.session_valid(session_id, function(error, result) {
                callback(result);
            });
        });
    }
}