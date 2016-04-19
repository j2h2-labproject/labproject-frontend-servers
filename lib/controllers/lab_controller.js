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
	lab_add_vm: function(session_id, lab_id, vm_uuid, callback) {
		helper.get_user_data(session_id, function(d_error, user_data) {
			var user = user_data.user;
			var permissions = user_data.permissions;

			lab_manager.get_lab(lab_id, callback(l_error, lab_obj) {
				if (!l_error) {
					if (lab_obj.get_owner() == user || lab_obj.user_can_edit(user)) {
						vm_manager.allocate_vm(vm_uuid, function(v_error, vm_obj) {

						});
					}
				} else {
					callback(l_error, null);
				}
			});



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
