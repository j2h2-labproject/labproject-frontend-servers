var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

const VERSION = "0.1b";

var net = require("net");

var vorpal = require('vorpal');
var prompt = require('prompt');

var register_session_commands = require("./session_commands").register;
var register_user_commands = require("./user_commands").register;
var register_lab_commands = require("./lab_commands").register;
var register_vm_server_commands = require("./vm_server_commands").register;
var register_vm_commands = require("./vm_commands").register;
var register_iso_commands = require("./iso_commands").register;


var session_controller = require(LABPROJECT_LIB + "/controllers/session_controller");

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');

var temp = null;

module.exports = {
	start: function (logger, vm_server_client, config, on_start) {
        logger.log("notice", "Starting cli frontend");
		if (temp === null) {
			temp = vm_server_client;
			login(vm_server_client, logger);
		}
	}
};

function login(vm_server_client, logger) {
    // Configure the prompt
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

    // Run the prompt
    prompt.get(schema, function (err, result) {
        session_controller.password_login(result.username, result.password, function(s_error, session_id) {
            if (!s_error) {
                // If successful, start the cli section
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

  // register_session_commands(vorpal_inst, session_id);
  // register_lab_commands(vorpal_inst, session_id, vm_server_client);
  // register_vm_commands(vorpal_inst, session_id);
  // register_user_commands(vorpal_inst, session_id);
  register_vm_server_commands(vorpal_inst, session_id, vm_server_client, logger);
  register_iso_commands(vorpal_inst, session_id, vm_server_client, logger);

	vorpal_inst
		.delimiter('labproject$')
		.show();

}


