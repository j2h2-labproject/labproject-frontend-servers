var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var prompt = require('prompt');
var color = require("cli-color");

var lab_controller = require(LABPROJECT_LIB + "/controllers/lab_controller");

var ERROR = color.redBright;
var SUCCESS = color.greenBright;

var COMMANDS = [
    {
        "name": "lab list",
        "description": 'List labs available to you',
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                lab_controller.list_labs(session_id, function(error, result) {
                    if (!error) {
                        if (result.length > 0) {
                            for (var i = 0; i < result.length; i++) {
                            self.log('\t ID: ' + result[i].lab_id + " - " + result[i].name + ' (Owner: ' + result[i].owner + ')');
                            }
                        } else {
                            self.log('No labs available. Type \'lab create <name>\' to create a lab.');
                        }
                        callback();
                    } else {
                        self.log('Error: ' + error.message + '');
                        callback();
                    }
                });
            };
        }
    },
    {
        "name": "lab create <name>",
        "description": "Create a new lab'",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                self.log('Creating lab "' + args.name + '"');

                lab_controller.create_lab(session_id, args.name, function(error, result) {
                    if (!error) {
                        self.log('Lab created!');
                        vorpal_inst.localStorage.setItem('current_lab', result);
                        callback();
                    } else {
                        self.log('Error: ' + error.message + '');
                        callback();
                    }
                });
            };
        }
    },
    {
        "name": "lab status",
        "description": "Get the status of the current lab",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;

                if (vorpal_inst.localStorage.getItem('current_lab') === null) {
                    self.log('You currently have no lab');
                } else {
                    self.log('Lab: ' +  vorpal_inst.localStorage.getItem('current_lab'));
                }

                callback();
            };
        }
    },
    {
        "name": "lab delete <lab_id>",
        "description": "Delete an existing lab",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                self.log('Deleting lab "' + args.lab_id + '"');
                lab_controller.delete_lab(session_id, args.lab_id, function(error, result) {
                    if (!error) {
                        self.log('Lab deleted!');
                        callback();
                    } else {
                        self.log('Error: ' + error.message + '');
                        callback();
                    }
                });
            };
        }
    },
    {
        "name": "lab open <lab_id>",
        "description": "Make a lab the current lab",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                vorpal_inst.localStorage.setItem('current_lab', args.lab_id);
                callback();
            };
        }
    },
]

module.exports = {
    register: function(vorpal_inst, session_id, vm_server_client) {
        lab_controller.initialize(vm_server_client);

        for (var i = 0; i < COMMANDS.length; i++) {
            vorpal_inst.command(COMMANDS[i]['name'], COMMANDS[i]['description'])
            .action(COMMANDS[i]['action'](vorpal_inst, session_id))
        }
        
    }
}

