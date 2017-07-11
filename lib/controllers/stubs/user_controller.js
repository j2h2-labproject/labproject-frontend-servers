var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var common_crypto = require(LABPROJECT_LIB + '/common/crypto');
var stub_util = require("./stub_util");

var USER_INFO = require("./data/user_info");

module.exports = function(server_client) {
    var self = this;
    self.get_profile = function(session_id, callback) {

        var username = stub_util.get_username(session_id);

        if (username in USER_INFO) {
            var profile_data = USER_INFO[username];
            profile_data['username'] = username;
            callback(null, profile_data);
        } else {
            callback("User does not exist", null);
        }
    };
    
    return self;
};
