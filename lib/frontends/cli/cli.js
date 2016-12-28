var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

const VERSION = "0.1a";

var net = require("net");

var vorpal = require('vorpal');
var prompt = require('prompt');

var register_session_commands = require("./session_commands").register;
var register_user_commands = require("./user_commands").register;


var lab_controller = require(LABPROJECT_LIB + "/controllers/lab_controller");
var vm_controller = require(LABPROJECT_LIB + "/controllers/vm_controller");
var session_controller = require(LABPROJECT_LIB + "/controllers/session_controller");

var vm_server_controller = require(LABPROJECT_LIB + "/controllers/vm_server_controller");
var sanitize = require(LABPROJECT_LIB + '/common/sanitize');

var temp = null;

module.exports = {
	start: function (logger, vm_server_client, config, on_start) {

    lab_controller.initialize(vm_server_client);
    vm_controller.initialize(vm_server_client);

		if (temp === null) {

			temp = vm_server_client;

			login(logger);

			// try {
			// 	var server = net.createServer(function (socket) {
			// 		tcp_handle(socket, logger);
			// 	});
			//
			// 	server.on('close', function(){
			//
			// 	});
			//
			// 	server.listen(config.port, function() {
			// 		on_start(null, server.address());
			// 	});
			//
			// } catch (ex){
			//
			// }

		} else {
			vm_server_client.destroy();
		}




	}
};

function login(logger) {
	var schema = {
    properties: {
      username: {
				description: 'Username',
        required: true
      },
      password: {
				description: 'Password',
        hidden: true,
				required: true
      }
    }
  };
	prompt.message = "Login";

	prompt.start();


  prompt.get(schema, function (err, result) {
    session_controller.password_login(result.username, result.password, function(s_error, session_id) {
			if (!s_error) {
				start_cli(result.username, session_id, logger);
			} else {

				logger.log("error", "Failed login for user " + result.username + "\n" + s_error.message);

				process.exit(1);
			}
		});
  });

}

function start_cli(username, session_id, logger) {
	console.log("\nLabProject CLI v" + VERSION + "\n");

  var vorpal_inst = vorpal();

  const exit_com = vorpal_inst.find('exit');
  if (exit_com) {
    exit_com.remove();
  }

  vorpal_inst
  	.command('exit', 'Exit')
  	.action(function(args, callback) {
      session_controller.password_logout(session_id, function(logout_error, result) {
        if (!logout_error) {
          console.log("\n");
          logger.log("notice", "Logout" + "\n");
          process.exit(0);
        } else {
          logger.log("error", "Logout cleanup failed " + logout_error.message + "\n");
          process.exit(1);
        }
      });
  		callback();
  	});

  vorpal_inst.localStorage(session_id);

  register_server_commands(vorpal_inst, session_id);
  register_session_commands(vorpal_inst, session_id);
  register_lab_commands(vorpal_inst, session_id);
  register_vm_commands(vorpal_inst, session_id);
  register_user_commands(vorpal_inst, session_id);

	vorpal_inst
		.delimiter('labproject$')
		.show();


}

function register_vm_commands(vorpal_inst, session_id) {
  vorpal_inst
    .command('vm list', 'List available vms')
    .action(function(args, callback) {
      var v_this = this;
      vm_controller.list_vms(session_id, function(error, result) {
        v_this.log(result);
        callback();
      });

    });

  vorpal_inst
    .command('vm create <name>', 'Create a new virtual machine')
    .action(function(args, callback) {
      var v_this = this;
      vm_server_controller.list_servers(session_id, function(error, server_list) {
        v_this.log(server_list);
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
      				description: 'Platform',
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
                v_this.log('VM successfully created!');
              } else {
                v_this.log('Error: ' + s_error.message + '');
              }
              callback();
            });
          });

        });

      });

    });
}



function register_server_commands(vorpal_inst, session_id) {
  vorpal_inst
    .command('status', 'Get the status of the vm servers')
    .action(function(args, callback) {
      this.log('bar');
      callback();
    });
}


function register_lab_commands(vorpal_inst, session_id) {
  vorpal_inst.command('lab status', 'Get the status of the current lab')
    .action(function(args, callback) {
      if (vorpal_inst.localStorage.getItem('current_lab') === null) {
        this.log('You currently have no lab');
      } else {
        this.log('Lab: ' +  vorpal_inst.localStorage.getItem('current_lab'));
      }

      callback();
    });

  vorpal_inst.command('lab list', 'List labs available to you')
    .action(function(args, callback) {
      var v_this = this;
      lab_controller.list_labs(session_id, function(error, result) {
        if (!error) {
          if (result.length > 0) {
            for (var i = 0; i < result.length; i++) {
              v_this.log('\t ID: ' + result[i].lab_id + " - " + result[i].name + ' (Owner: ' + result[i].owner + ')');
            }
          } else {
            v_this.log('No labs available');
          }
          callback();
        } else {
          v_this.log('Error: ' + error.message + '');
          callback();
        }
      });
    });

  vorpal_inst.command('lab create <name>', 'Create a new lab')
    .action(function(args, callback) {
      var v_this = this;
      v_this.log('Creating lab "' + args.name + '"');

      lab_controller.create_lab(session_id, args.name, function(error, result) {
        if (!error) {
          v_this.log('Lab created!');
          vorpal_inst.localStorage.setItem('current_lab', result);
          callback();
        } else {
          v_this.log('Error: ' + error.message + '');
          callback();
        }
      });

    });

  vorpal_inst.command('lab delete <lab_id>', 'Delete an existing lab')
    .action(function(args, callback) {
      var v_this = this;
      v_this.log('Deleting lab "' + args.lab_id + '"');
      lab_controller.delete_lab(session_id, args.lab_id, function(error, result) {
        if (!error) {
          v_this.log('Lab deleted!');
          callback();
        } else {
          v_this.log('Error: ' + error.message + '');
          callback();
        }
      });
      callback();
    });

}


