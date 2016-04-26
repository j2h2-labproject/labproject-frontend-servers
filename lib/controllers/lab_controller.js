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
	list_labs: function(session_id, callback) {

		helper.get_user_data(session_id, function(d_error, user_data) {
			var user = user_data.user;
      var permissions = user_data.permissions;
			var groups = user_data.groups;

			lab_manager.list_available_labs(user, groups, function(error, result) {
				if (!error) {
					callback(null, result);
				} else {
					callback(error, null);
				}
			});


		});
	},
  create_lab: function(session_id, lab_name, callback) {

    helper.get_user_data(session_id, function(d_error, user_data) {
      var user = user_data.user;
      var permissions = user_data.permissions;

      if (permissions.can_create_labs() || permissions.is_superuser()) {
        lab_manager.new_lab(user, lab_name, function(l_error, lab) {
          if (!l_error) {
            callback(null, lab.get_lab_id());
          }
        });
      } else {

      }

    });

  },
	lab_add_vm: function(session_id, lab_id, vm_uuid, callback) {

		helper.get_user_data(session_id, function(d_error, user_data) {
			var user = user_data.user;
			var permissions = user_data.permissions;

			lab_manager.get_lab(lab_id, function(l_error, lab_obj) {
				if (!l_error) {
					if (lab_obj.get_owner() == user || lab_obj.user_can_edit(user) || permissions.is_superuser()) {
						vm_manager.allocate_vm(vm_uuid, function(v_error, vm_obj) {

						});
					}
				} else {
					callback(l_error, null);
				}
			});
		});
	},
  stop_lab: function(user, lab_id, callback) {

  },
  restore_lab: function(user, lab_id, callback) {

  },
  delete_lab: function(user, lab_id, callback) {
		helper.get_user_data(session_id, function(d_error, user_data) {
			var user = user_data.user;
			var permissions = user_data.permissions;

			lab_manager.get_lab(lab_id, function(l_error, lab_obj) {
				if (!l_error) {
					if (lab_obj.get_owner() == user || permissions.is_superuser()) {
						lab_obj.delete(function(d_error, result) {
							callback(d_error, result);
						});
					}
				} else {
					callback(l_error, null);
				}
			});
		});
  }
};
