var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

// Require all managers
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');
var lab_manager = require(LABPROJECT_BASE + '/lib/managers/lab_manager');
var vm_manager = require(LABPROJECT_BASE + '/lib/managers/vm_manager');
var helper =  require(LABPROJECT_BASE + '/lib/util/controller_helpers');
var sanitize = require(LABPROJECT_LIB + '/common/sanitize');

var logger = null;

module.exports = {
	initialize: function(new_client, logger) {
		vm_manager.initialize(new_client);
		logger = logger;
	},
	// List labs available to the current user
	list_labs: function(session_id, callback) {
		session_id = sanitize.simple_string(session_id);

		helper.get_user_data(session_id, function(d_error, user_data) {

			if (d_error) {
				callback(new Error("Invalid session"), null);
				return;
			}

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
	// Create a lab
	create_lab: function(session_id, lab_name, callback) {

		session_id = sanitize.simple_string(session_id);
		lab_name = sanitize.simple_string(lab_name);

		helper.get_user_data(session_id, function(d_error, user_data) {

			if (d_error) {
				callback(new Error("Invalid session"), null);
				return;
			}

			var user = user_data.user;
			var permissions = user_data.permissions;
			var session = user_data.session;

			if (permissions.can_create_labs() || permissions.is_superuser()) {
				lab_manager.new_lab(user, lab_name, function(l_error, lab) {
					if (!l_error) {
						callback(null, lab.get_lab_id());
					} else {
						callback(l_error, null);
					}
				});
			} else {
				callback(new Error("Permission denied"), null);
			}

		});
	},
	// Delete a lab
	delete_lab: function(session_id, lab_id, callback) {

		session_id = sanitize.simple_string(session_id);
		lab_id = sanitize.simple_string(lab_id);

		helper.get_user_data(session_id, function(d_error, user_data) {

			if (d_error) {
				callback(new Error("Invalid session"), null);
				return;
			}

			var user = user_data.user;
			var permissions = user_data.permissions;

			lab_manager.get_lab(lab_id, function(l_error, lab_obj) {
				if (!l_error) {
					if (lab_obj.get_owner() == user || permissions.is_superuser()) {
						lab_obj.stop_lab(function(s_error, result) {
							console.log(s_error);
							lab_obj.delete(function(d_error, result) {
								callback(d_error, result);
							});
						});

					} else {
						callback(new Error("Permission denied"), null);
					}
				} else {
					callback(l_error, null);
				}
			});
		});
  },
	// Get information to start interacting with a running lab
	enter_lab: function(session_id, lab_id, callback) {

		session_id = sanitize.simple_string(session_id);
		lab_id = sanitize.simple_string(lab_id);

		helper.get_user_data(session_id, function(d_error, user_data) {
				if (d_error) {
					callback(new Error("Error loading session"), null);
					return;
				}

				var user = user_data.user;
				var permissions = user_data.permissions;
				var groups = user_data.groups;



		});

	},
	// Start a lab that is not running (Bring up VMs and switches, create connections)
	start_lab: function(session_id, lab_id, callback) {

		session_id = sanitize.simple_string(session_id);
		lab_id = sanitize.simple_string(lab_id);

		helper.get_user_data(session_id, function(d_error, user_data) {


			if (d_error) {
				callback(new Error("Invalid session"), null);
				return;
			}

      var user = user_data.user;
      var permissions = user_data.permissions;
			var groups = user_data.groups;

			lab_manager.get_lab(lab_id, function(l_error, lab_obj) {
				if (!l_error) {
					if (lab_obj.get_owner() == user || lab_obj.can_use(user, groups) || permissions.is_superuser()) {
						lab_obj.start_lab(function(s_error, status) {
							if (!s_error) {


								var lab_devices = lab_obj.get_devices();

								// Attempt to allocate all virtual machines
								allocate_vm_list(0, lab_devices, function(a_error, result) {
									if (!a_error) {
										lab_obj.allocate_interface_group(function(i_error, group_id) {

											// Update VM interfaces

											// Bring up all switches
										});
									} else {
										deallocate_vm_list(0, lab_devices, function(error, result) {
											callback(a_error, null);
										});
									}
								});






								// Update interfaces

								callback(null, true);
							} else {
								callback(s_error, null);
							}
						});
					} else {
						callback(new Error("Permission denied"), null);
					}
				} else {
					callback(l_error, null);
				}
			});

    });

	},
	stop_lab: function(session_id, lab_id, callback) {

  },
	lab_add_vm: function(session_id, lab_id, vm_uuid, callback) {

		helper.get_user_data(session_id, function(d_error, user_data) {
			var user = user_data.user;
			var permissions = user_data.permissions;

			lab_manager.get_lab(lab_id, function(l_error, lab_obj) {
				if (!l_error) {
					if (lab_obj.get_owner() == user || lab_obj.user_can_edit(user) || permissions.is_superuser()) {
						vm_manager.get_vm(vm_uuid, function(v_error, vm_obj) {
							vm_obj.state.allocate(function(a_error, result) {
								if (!a_error) {
									lab_obj.add_device(vm_uuid);
									lab_obj.save(function(s_error, result) {
										callback(s_error, result);
									});
								} else {
									callback(a_error, null);
								}
							});
						});
					}
				} else {
					callback(l_error, null);
				}
			});
		});
	},
	lab_remove_vm: function(session_id, lab_id, vm_uuid, callback) {

	},
	lab_add_connection: function(session_id, lab_id, from, to, callback) {

	},
	lab_create_state: function(session_id, lab_id, state_name, callback) {

	},
	lab_remove_state: function(session_id, lab_id, state_name, callback) {

	},
	lab_restore_state: function(session_id, lab_id, state_name, callback) {

	},

	add_edit_users: function(session_id, lab_id, users, callback) {

	},
	add_readonly_users: function(session_id, lab_id, users, callback) {

	}
};


function allocate_vm_list(location, vm_list, callback) {

}

function deallocate_vm_list(location, vm_list, callback) {

}

function update_vm_interfaces(location, vm_list, callback) {

}
