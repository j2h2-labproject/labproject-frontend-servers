var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

//Input
var prompt = require('prompt');

// Controllers
var vm_controller = require(LABPROJECT_LIB + "/controllers/vm_controller");
var vm_server_controller = require(LABPROJECT_LIB + "/controllers/vm_server_controller");

// Modules for output
var color = require("cli-color");
var ERROR = color.redBright;
var SUCCESS = color.greenBright;

var COMMANDS = [
    {
        "name": "vm list",
        "description": 'List VMs available to you',
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                vm_controller.list_vms(session_id, function(error, result) {
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
        "name": "vm create <name>",
        "description": 'Create a new virtual machine',
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                vm_server_controller.list_servers(session_id, function(error, server_list) {
                    self.log(server_list);
                    var schema = {
                    properties: {
                        description: {
                                description: 'Description',
                        type: 'string',
                        required: false
                        },
                        server: {
                                description: 'Server',
                        enum: server_list,
                        required: true
                        },
                        hypervisor: {
                                description: 'Hypervisor',
                        enum: ['vbox'],
                        required: true
                        },
                        platform: {
                                description: 'Platform (x64, x32)',
                                enum: ['x64', 'x32'],
                                required: true
                        },
                        mem_size: {
                                description: 'Memory (MB)',
                        default: 512,
                        type: 'integer',
                        required: true
                        },
                        cpu_count: {
                            description: '# of CPUs',
                            default: 1,
                            type: 'integer',
                            required: true
                        },
                        display: {
                            description: 'Display',
                            enum: ['local', 'rdp', 'vnc'],
                            required: true
                        }
                    }
                    };
                    prompt.message = "VM Create";

                    prompt.start();

                    prompt.get(schema, function (err, result) {
                    vm_controller.create_vm(session_id, result.server, result.hypervisor, args.name, function(i_error, config, done) {
                        config.set_mem_size(result.mem_size);
                        config.set_cpu_count(result.cpu_count);
                        config.set_platform(result.platform);
                        config.set_display(result.display);
                        done(function(s_error, result) {
                        if (!error) {
                            self.log(SUCCESS('VM successfully created!'));
                        } else {
                            self.log(ERROR('Error: ' + s_error.message + ''));
                        }
                        callback();
                        });
                    });

                    });

                });
            };
        }
    }
]

module.exports = {
    register: function(vorpal_inst, session_id, vm_server_client) {
        vm_server_controller.initialize(vm_server_client);
        vm_controller.initialize(vm_server_client);
        
        for (var i = 0; i < COMMANDS.length; i++) {
            vorpal_inst.command(COMMANDS[i]['name'], COMMANDS[i]['description'])
            .action(COMMANDS[i]['action'](vorpal_inst, session_id))
        }
        
    }
}



