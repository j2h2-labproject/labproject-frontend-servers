var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

const VERSION = "0.1a";

var net = require("net");

var vorpal = require('vorpal');
var prompt = require('prompt');

var register_session_commands = require("./session_commands").register;
var register_user_commands = require("./user_commands").register;
var register_lab_commands = require("./lab_commands").register;
var register_vm_server_commands = require("./vm_server_commands").register;


var vm_controller = require(LABPROJECT_LIB + "/controllers/vm_controller");
var session_controller = require(LABPROJECT_LIB + "/controllers/session_controller");

var vm_server_controller = require(LABPROJECT_LIB + "/controllers/vm_server_controller");
var sanitize = require(LABPROJECT_LIB + '/common/sanitize');

var temp = null;

module.exports = {
	start: function (logger, vm_server_client, config, on_start) {

    
    vm_controller.initialize(vm_server_client);

		if (temp === null) {

			temp = vm_server_client;

			login(vm_server_client, logger);

		} else {
			vm_server_client.destroy();
		}




	}
};

function login(vm_server_client, logger) {
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
				start_cli(result.username, session_id, vm_server_client, logger);
			} else {

				logger.log("error", "Failed login for user " + result.username + "\n" + s_error.message);

				process.exit(1);
			}
		});
  });

}

function start_cli(username, session_id, vm_server_client, logger) {
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
  register_lab_commands(vorpal_inst, session_id, vm_server_client);
  register_vm_commands(vorpal_inst, session_id);
  register_user_commands(vorpal_inst, session_id);
  register_vm_server_commands(vorpal_inst, session_id, vm_server_client);

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