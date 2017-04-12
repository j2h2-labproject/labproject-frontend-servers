var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var common_crypto = require(LABPROJECT_LIB + '/common/crypto');
var USER_DATA = require("./data/user_info");

module.exports = {
    initialize: function(new_client) {
        
    },
    session_valid: function(session_id, callback) {
        console.log("Got session id: ", session_id);
        if (session_id !== undefined && session_id !== false) {
            callback(null, true);
        } else {
            callback(null, false);
        } 
    },
    password_login: function(username, password, callback) {
        if (USER_DATA.hasOwnProperty(username)&& password == USER_DATA[username].password) {
            callback(null, generate_session_id(username));
        } else {
            callback(new Error("Login failed. Invalid username or password"), null);
        }
    },
    password_logout: function(session_id, callback) {
       
    },
};

function generate_session_id(username) {
	return username + "-" + common_crypto.random_hash(32);
}
