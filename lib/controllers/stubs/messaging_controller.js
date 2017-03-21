var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var common_crypto = require(LABPROJECT_LIB + '/common/crypto');

var message_list = [
    {"message" : "Hello person", "sender": "admin", "importance": "low"},
    {"message" : "Please add me to you lab", "sender": "user", "importance": "medium"},
    {"message" : "You have no space left", "sender": "SYSTEM", "importance": "high"}
]

module.exports = function() {
    var self = this;
    self.send_message = function(session_id, message, callback) {
        message_list.push({"message": message, "sender": "SYSTEM", "important": "low"});
    };

    self.get_messages = function(session_id, count, offset, callback) {
        
        callback(null, message_list);
    };

    self.set_handler = function(session_id, handler, callback) {
        
    };
    return self;
};


