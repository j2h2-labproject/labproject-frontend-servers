var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

const VERSION = "0.1";

var net = require("net");

var vorpal = require('vorpal');
var prompt = require('prompt');

var lab_controller = require(LABPROJECT_LIB + "/controllers/lab_controller");
var session_controller = require(LABPROJECT_LIB + "/controllers/session_controller");
var sanitize = require(LABPROJECT_LIB + '/common/sanitize');

var temp = null;

module.exports = {
	start: function (logger, vm_server_client, config, on_start) {

    lab_controller.initialize(vm_server_client);

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

	vorpal_inst
		.delimiter('labproject$')
		.show();


}

function register_vm_commands(vorpal_inst) {

}

function register_user_commands(vorpal_inst) {

}

function register_server_commands(vorpal_inst, session_id) {
  vorpal_inst
    .command('status', 'Get the status of the vm servers')
    .action(function(args, callback) {
      this.log('bar');
      callback();
    });
}

function register_session_commands(vorpal_inst, session_id) {
  vorpal_inst
    .command('session', 'Get session data')
    .action(function(args, callback) {
      this.log('Session Info: \n\t' + session_id );
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
              v_this.log('\t ' + result[i].name + ' (Owner: ' + result[i].owner + ')');
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
      this.log('Creating lab "' + args.name + '"');

      callback();
    });

  vorpal_inst.command('lab delete <name>', 'Delete an existing lab')
    .action(function(args, callback) {
      this.log('Creating lab "' + args.name + '"');

      callback();
    });

}


//
// function tcp_handle(socket, logger) {
//
// 		var session_id = null;
// 		var username = null;
//
// 		logger.log("notice", "Connection from " + socket.remoteAddress);
//
// 		socket.on('end', function() {
// 			logger.log("notice", "Disconnected from " + socket.remoteAddress);
// 		});
//
// 		var buffer = "";
//
// 		socket.on('data', function(data) {
// 			data_string = data.toString();
//
// 			buffer += data_string;
//
// 			if (buffer.endsWith("\n")) {
//
// 				if (session_id === null && username === null) {
// 					username = sanitize.simple_string(buffer);
// 				} else if (session_id === null) {
//
// 				} else {
// 					parse_command(buffer, function(error, result) {
// 						if (error) {
// 							socket.write("! - ERROR: " + error + "\n");
// 						} else {
// 							socket.write(result + "\n");
// 						}
//
// 						socket.write("> ");
// 					});
// 				}
//
//
// 				buffer = "";
//
// 			}
//
// 		});
//
// 		socket.write('\n==========================\nLabProject CLI\n==========================\n');
//
// 		if (session_id === null && username === null) {
// 			socket.write("Username: ");
// 		} else if (session_id === null) {
// 			socket.write("Password: ");
// 		} else {
// 			socket.write("> ");
// 		}
//
//
// }
//
// function parse_command(command, callback) {
// 	temp.call("test", "status", {}, function(error, result) {
// 		callback(error, result);
// 	});
//
// }
