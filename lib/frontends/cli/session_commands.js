var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var session_controller = require(LABPROJECT_LIB + "/controllers/session_controller");

module.exports = {
    register: function(vorpal_inst, session_id) {
        vorpal_inst
            .command('session', 'Get session data')
            .action(function(args, callback) {
            this.log('Session Info: \n\tSession ID: ' + session_id );
            callback();
            });
    }
}
