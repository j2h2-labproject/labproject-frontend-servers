const LABPROJECT_BASE = process.cwd();
const LABPROJECT_LIB = process.cwd() + "/lib";



module.exports = {
    register: function(vm_server_client, logger, socket) {

        var vm_server_controller = require(LABPROJECT_LIB + "/controllers/vm_server_controller")(vm_server_client, logger);

        socket.on("vm_server:list_servers", function(data, callback) {
            var session_id = socket.request.session_id;
            vm_server_controller.list_servers(session_id, function(error, result) {
                callback({"error": error, "result": result});
            });
        });
        
        socket.on("vm_server:get_server_status", function(data, callback) {
            var session_id = socket.request.session_id;
            vm_server_controller.get_server_status(session_id, data.server, function(error, result) {
                callback({"error": error, "result": result});
            });
        });
        
        socket.on("vm_server:get_server_info", function(data, callback) {
            var session_id = socket.request.session_id;
            vm_server_controller.get_server_info(session_id, data.server, function(error, result) {
                callback({"error": error, "result": result});
            });
        });
        
        socket.on("vm_server:get_server_debugdump", function(data, callback) {
            var session_id = socket.request.session_id;
            vm_server_controller.get_server_debugdump(session_id, data.server, function(error, result) {
                callback({"error": error, "result": result});
            });
        });

        socket.on("vm_server:on_server_pulse", function(data, callback) {
            var session_id = socket.request.session_id;
            var server = data.server;
            vm_server_controller.on_server_pulse(session_id, server, function(p_error, pulse_data) {
                console.log("hi", server);
                socket.emit(server, pulse_data);
            }, function(error, result) {
                callback({"error": error, "result": result});
            });
        });
    }
}