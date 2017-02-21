var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

//Input
var prompt = require('prompt');

// Controllers
var vm_server_controller = require(LABPROJECT_LIB + "/controllers/vm_server_controller");

// Modules for output
var color = require("cli-color");
var ERROR = color.redBright;
var SUCCESS = color.greenBright;


var COMMANDS = [
    {
        "name": "server list",
        "description": "List available vm servers servers",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                vm_server_controller.list_servers(session_id, function(error, result) {
                    if (!error) {
                        self.log(result);
                    } else {
                        self.log('Error: ' + error.message + '');
                    }
                    callback();
                });
            };
        }
    },
    {
        "name": "server usage <server_id>",
        "description": "List users",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                vm_server_controller.get_server_status(session_id, args.server_id, function(error, result) {
                    if (!error) {
                        self.log(result);
                    } else {
                        self.log(ERROR('Error: ' + error.message + ''));
                    }
                    callback();
                });
            };
        }
    },
    {
        "name": "server info <server_id>",
        "description": "Add a new user",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                vm_server_controller.get_server_info(session_id, args.server_id, function(error, result) {
                    if (!error) {
                        self.log(result);
                    } else {
                        self.log(ERROR('Error: ' + error.message + ''));
                    }
                    callback();
                });
            };
        }
    },
]

module.exports = {
    register: function(vorpal_inst, session_id, vm_server_client) {
        vm_server_controller.initialize(vm_server_client);

        for (var i = 0; i < COMMANDS.length; i++) {
            vorpal_inst.command(COMMANDS[i]['name'], COMMANDS[i]['description'])
            .action(COMMANDS[i]['action'](vorpal_inst, session_id))
        }
    }
}

