var isoPROJECT_BASE = process.cwd();
var isoPROJECT_LIB = process.cwd() + "/lib";

var prompt = require('prompt');

// Controllers
var iso_controller;

// Modules for output
var color = require("cli-color");
var ERROR = color.redBright;
var SUCCESS = color.greenBright;

var COMMANDS = [
    {
        "name": "iso list",
        "description": 'List available ISO images',
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                iso_controller.list_isos(session_id, function(error, result) {
                    if (!error) {
                        if (result.length > 0) {
                            for (var i = 0; i < result.length; i++) {
                                self.log(result[i]);
                            }
                        } else {
                            self.log('No isos available. Type \'iso create <name> <url>\' to create a iso.');
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
        "name": "iso create <name> <url>",
        "description": "Create a new iso'",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                self.log('Downloading from ' + args.url);

                iso_controller.create_iso(session_id, args.name, args.url, function(error, result) {
                    if (!error) {
                        self.log('ISO created!');
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
        "name": "iso delete <iso_id>",
        "description": "Delete an iso",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                self.log('Deleting iso "' + args.iso_id + '"');
                iso_controller.delete_iso(session_id, args.iso_id, function(error, result) {
                    if (!error) {
                        self.log('iso deleted!');
                        callback();
                    } else {
                        self.log('Error: ' + error.message + '');
                        callback();
                    }
                });
            };
        }
    }
]

module.exports = {
    register: function(vorpal_inst, session_id, vm_server_client) {
        iso_controller = require(isoPROJECT_LIB + "/controllers/iso_controller")(vm_server_client, logger);

        for (var i = 0; i < COMMANDS.length; i++) {
            vorpal_inst.command(COMMANDS[i]['name'], COMMANDS[i]['description'])
            .action(COMMANDS[i]['action'](vorpal_inst, session_id))
        }
        
    }
}

