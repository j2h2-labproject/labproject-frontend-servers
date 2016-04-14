var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

// Require all managers
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');
var lab_manager = require(LABPROJECT_BASE + '/lib/managers/lab_manager');
var vm_manager = require(LABPROJECT_BASE + '/lib/managers/vm_manager');
var helper =  require(LABPROJECT_BASE + '/lib/util/controller_helpers');
module.exports = {
	initialize: function(new_client) {

	},
  create_lab: function(session_id, lab_name, callback) {

    helper.get_user_data(session_id, function(d_error, user_data) {
      var user = user_data.user;
      var permissions = user_data.permissions;

      if (permissions.can_create_labs()) {
        lab_manager.new_lab(user, lab_name, function(l_error, lab) {
          if (!l_error) {
            callback(null, lab.get_lab_id());
          }
        });
      } else {

      }

    });







  },
  stop_lab: function(user, lab_id, callback) {

  },
  restore_lab: function(user, lab_id, callback) {

  },
  delete_lab: function(user, lab_id, callback) {

  },
  list_labs: function(user, callback) {

  }
};
