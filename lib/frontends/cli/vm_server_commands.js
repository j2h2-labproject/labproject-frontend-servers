var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

//Input
var prompt = require('prompt');
var clui = require('clui');

var Gauge = clui.Gauge;

// Controllers
var vm_server_controller;

// Modules for output
var color = require("cli-color");
var ERROR = color.redBright;
var SUCCESS = color.greenBright;

var quick_format = require(LABPROJECT_LIB + "/frontends/cli/util/output_util").quick_format;

var COMMANDS = [
    {
        "name": "server list",
        "description": "List available vm servers servers",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                vm_server_controller.list_servers(session_id, function(error, result) {
                    if (!error) {
                        self.log(quick_format(result));
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
                        var used = result.total - result.free;
                        var label = Math.ceil(used / 1000000) + ' MB/' + Math.ceil(result.total / 1000000) + ' MB';
                        self.log(Gauge(used, result.total, 40, result.total * 0.8, label));
                        var cpu_count = result.cpu_data.length;
                        var five_min_load_per = (result.load_avg[1] / cpu_count) * 100;
                        self.log(Gauge(five_min_load_per, 100, 40, 80, "CPU % (15 min)"));
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
        "description": "Get information from the server",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                vm_server_controller.get_server_info(session_id, args.server_id, function(error, result) {
                    if (!error) {
                        self.log(quick_format(result));
                    } else {
                        self.log(ERROR('Error: ' + error.message + ''));
                    }
                    callback();
                });
            };
        }
    },
    {
        "name": "server debugdump <server_id>",
        "description": "Dump debug information",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                vm_server_controller.get_server_debugdump(session_id, args.server_id, function(error, result) {
                    if (!error) {
                        self.log(quick_format(result));
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
    register: function(vorpal_inst, session_id, vm_server_client, logger) {
        vm_server_controller = require(LABPROJECT_LIB + "/controllers/vm_server_controller")(vm_server_client, logger);
        
        for (var i = 0; i < COMMANDS.length; i++) {
            vorpal_inst.command(COMMANDS[i]['name'], COMMANDS[i]['description'])
            .action(COMMANDS[i]['action'](vorpal_inst, session_id))
        }
    }
}

