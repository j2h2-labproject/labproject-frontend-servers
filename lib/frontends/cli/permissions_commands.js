var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var prompt = require('prompt');
var color = require("cli-color");

var usergroup_controller = require(LABPROJECT_LIB + "/controllers/usergroup_controller");
var permissions_controller = require(LABPROJECT_LIB + "/controllers/permissions_controller");

var ERROR = color.redBright;
var SUCCESS = color.greenBright;

var COMMANDS = [
    {
        "name": "permissions view",
        "description": "View current permission set",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                permissions_controller.list_my_permissions(session_id, function(error, result) {
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
        "name": "permissions list",
        "description": "List users",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                usergroup_controller.list_users(session_id, function(error, result) {
                    if (!error) {
                        for (var i = 0; i < result.length; i++) {
                            self.log(" - " + result[i]);
                        }
                    // self.log('Username: ' + result.username + '\nGroups:');
                    // for (var i = 0; i < result.groups.length; i++) {
                    //     self.log('\t' + result.groups[i]);
                    // }
                    } else {
                        self.log(ERROR('Error: ' + error.message + ''));
                    }
                    callback();
                });
            };
        }
    },
    {
        "name": "user add <username>",
        "description": "Add a new user",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;

                var schema = {
                    properties: {
                        password: {
                            description: 'Password',
                            hidden: true,
                            required: true
                        }
                    }
                };

                prompt.message = "New User";
                prompt.start();

                prompt.get(schema, function (err, result) {
                    usergroup_controller.add_user(session_id, args.username, result.password, function(error, result){ 
                        if (!error) {
                            self.log(SUCCESS("User added"));
                        } else {
                            self.log(ERROR('Error: ' + error.message + ''));
                        }
                        callback();
                    });
                });

            //     usergroup_controller.list_users(session_id, function(error, result) {
                    
            //         
            //     });
            };
        }
    },
    {
        "name": "user info <username>",
        "description": "Get information on a user",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                usergroup_controller.list_users(session_id, function(error, result) {
                    callback();
                });
            };
        }
    },
    {
        "name": "user delete <username>",
        "description": "Delete a user",
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                usergroup_controller.remove_user(session_id, args.username, function(error, result) {
                    if (!error) {
                        self.log(SUCCESS("User removed"));
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
    register: function(vorpal_inst, session_id) {
         vorpal_inst.command('id', 'List your user and group info')
            .action(function(args, callback) {
                var self = this;
                usergroup_controller.id(session_id, function(error, result) {
                    if (!error) {
                    self.log('Username: ' + result.username + '\nGroups:');
                    for (var i = 0; i < result.groups.length; i++) {
                        self.log('\t' + result.groups[i]);
                    }
                    } else {
                        self.log(ERROR('Error: ' + error.message + ''));
                    }
                    callback();
                });
            });
        

        for (var i = 0; i < COMMANDS.length; i++) {
            vorpal_inst.command(COMMANDS[i]['name'], COMMANDS[i]['description'])
            .action(COMMANDS[i]['action'](vorpal_inst, session_id))
        }
        
    }
}

