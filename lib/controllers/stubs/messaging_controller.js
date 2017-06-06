var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var stub_util = require("./stub_util")
var common_crypto = require(LABPROJECT_LIB + '/common/crypto');
var message_parser = require(LABPROJECT_LIB + '/util/message_parser');

var message_list = [
    {"message" : "Hello person", "sender": "admin", "importance": "low"},
    {"message" : "Please add me to you lab", "sender": "user", "importance": "medium"},
    {"message" : "You have no space left", "sender": "SYSTEM", "importance": "high"}
]

var HANDLER = null;

module.exports = function() {
    var self = this;
    self.send_message = function(session_id, raw_message, callback) {
        var username = stub_util.get_username(session_id);

        message_parser.parse_message(raw_message, function(error, target_users, importance, message) {
            message_list.push({"message": message, "sender": username, "importance": importance});
            callback(null, true);
        });

    };

    self.get_messages = function(session_id, count, offset, callback) {
        
        callback(null, message_list);
    };

    self.set_handler = function(handler, callback) {
        HANDLER = handler;
    };
    return self;
};


