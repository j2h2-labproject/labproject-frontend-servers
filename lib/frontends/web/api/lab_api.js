const LABPROJECT_BASE = process.cwd();
const LABPROJECT_LIB = process.cwd() + "/lib";
var lab_controller = require(LABPROJECT_LIB + "/controllers/stubs/lab_controller")();

module.exports = {
    register: function(socket) {

        socket.on("lab:get_recent_labs", function(data, callback) {
            console.log("hi")
            var session_id = socket.request.session_id;
            lab_controller.get_recent_labs(session_id, function(error, result) {
                callback({"error": error, "result": result});
            });
        });

        socket.on("lab:get_all_labs", function(data, callback) {
            var session_id = socket.request.session_id;
            lab_controller.get_all_labs(session_id, function(error, result) {
                callback({"error": error, "result": result});
            });
        });

        socket.on("lab:create_lab", function(data, callback) {
            var session_id = socket.request.session_id;
            lab_controller.create_lab(session_id, data.lab_name, function(error, result) {
                callback({"error": error, "result": result});
            });
        });
        
        socket.on("lab:open_lab", function(data, callback) {
            var session_id = socket.request.session_id;
            lab_controller.open_lab(session_id, data.lab_id, function(error, result) {
                callback({"error": error, "result": result});
            });
        });
    }
}