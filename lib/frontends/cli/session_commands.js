var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var session_controller = require(LABPROJECT_LIB + "/controllers/session_controller");


var COMMANDS = [
    {
        "name": "session",
        "description": 'List labs available to you',
        "action": function(vorpal_inst, session_id) {
            return function(args, callback) {
                var self = this;
                self.log('Session Info: \n\tSession ID: ' + session_id );
                var lab_id = vorpal_inst.localStorage.getItem('current_lab');
                self.log('\tCurrent Lab ID: ' + lab_id );
                callback();
            };
        }
    }
]

module.exports = {
    register: function(vorpal_inst, session_id) {
        

        for (var i = 0; i < COMMANDS.length; i++) {
            vorpal_inst.command(COMMANDS[i]['name'], COMMANDS[i]['description'])
            .action(COMMANDS[i]['action'](vorpal_inst, session_id))
        }
        
    }
}



