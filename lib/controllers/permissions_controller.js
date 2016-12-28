var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

// Require all managers
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');
var lab_manager = require(LABPROJECT_BASE + '/lib/managers/lab_manager');
var vm_manager = require(LABPROJECT_BASE + '/lib/managers/permissions_manager');
var helper =  require(LABPROJECT_BASE + '/lib/util/controller_helpers');
var sanitize = require(LABPROJECT_LIB + '/common/sanitize');

var logger = null;

module.exports = {
	initialize: function(new_client, logger) {
		// vm_manager.initialize(new_client);
		logger = logger;
	},
    // Get permissions for the current user
	list_my_permissions: function(session_id, callback) {
		session_id = sanitize.simple_string(session_id);
		helper.get_user_data(session_id, function(d_error, user_data) {

			if (d_error) {
				callback(new Error("Invalid session"), null);
				return;
			}

			var user = user_data.user;
      		var permissions = user_data.permissions;
			var groups = user_data.groups;

			callback(null, user_data.permissions.list_permissions());
		});
	},
    get_user_permissions: function(session_id, username, callback) {

    }
};

