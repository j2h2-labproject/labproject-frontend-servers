var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

// Require all managers
var session_manager = require(LABPROJECT_BASE + '/lib/managers/session_manager');
var permissions_manager = require(LABPROJECT_BASE + '/lib/managers/permissions_manager');

module.exports = {
  get_user_data: function(session_id, callback) {
    session_manager.get_password_session(session_id, function(s_error, session) {
      if (!s_error) {
        var user = session.get_user();

        permissions_manager.get_permissions(user, function(p_error, user_permissions) {
          if (!p_error) {
            callback(null, {user: user, permissions: user_permissions});
          } else {

          }
        });

      } else {

      }
    });
  }
};
