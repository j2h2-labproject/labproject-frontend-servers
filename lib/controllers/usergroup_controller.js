var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

// Require all managers
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');
var helper =  require(LABPROJECT_BASE + '/lib/util/controller_helpers');

var vm_client = null;

module.exports = {
	initialize: function(new_client) {

	},
	id: function(session_id, callback) {
		helper.get_user_data(session_id, function(d_error, user_data) {

			if (d_error) {
				callback(new Error("Invalid session"), null);
				return;
			}

			var user = user_data.user;
			var groups = user_data.groups;

			var id_data = {
				username: user,
				groups: groups
			};

			callback(null, id_data);

		});

	},
	add_user: function(session_id, username, password) {
		helper.get_user_data(session_id, function(d_error, user_data) {

			if (d_error) {
				callback(new Error("Invalid session"), null);
				return;
			}

		

			callback(null, id_data);

		});
	},
	remove_user: function(session_id, username) {

	}
};
