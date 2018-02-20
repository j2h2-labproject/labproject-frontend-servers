var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

// Require all managers
var session_manager = require(LABPROJECT_BASE + '/lib/managers/session_manager');
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');

module.exports = {
    initialize: function(new_client) {

    },
    password_login: function(username, password, callback) {
    session_manager.new_password_session(username, password, function(login_error, session) {
      if (!login_error && session.get_user() == username) {
        callback(null, session.get_session_id());
      } else {
                callback(login_error, null);
      }
    });
  },
  password_logout: function(session_id, callback) {
        session_manager.delete_password_session(session_id, function(logout_error, result) {
            callback(logout_error, result);
        });
  },
};
