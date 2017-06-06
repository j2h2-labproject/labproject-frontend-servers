var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');

module.exports = {
    parse_message: function(raw_message, callback) {

        var message = "";
        var target_user = [];
        var importance = "low";

        var message_parts = raw_message.split(" ");
        for (var i = 0; i < message_parts.length; i++) {
            // @ indicates the target
            if (message_parts[i].charAt(0) == "@") {
                var raw_user = sanitize.simple_string(message_parts[i].slice(1)).toLowerCase();
                if (raw_user == "all") {
                    target_user = ["<ALL>"];
                } else if (target_user == "lab") {
                    target_user = ["<LAB>"];
                } else {
                    target_user = ["<LAB>"];
                }
            // ! indicates the importance
            } else if (message_parts[i].charAt(0) == "!") {
                var raw_importance = sanitize.alphanum_string(message_parts[i].slice(1)).toLowerCase();
                if (raw_importance == "low" ||  raw_importance == "medium" || raw_importance == "high" ) {
                    importance = raw_importance;
                }
                // Skip adding importance to the message
                continue;
            } 

            if (i == 0) {
                message += message_parts[i];
            } else {
                message += " " + message_parts[i];
            }
            
        }

        callback(null, target_user, importance, message);
    }
}
