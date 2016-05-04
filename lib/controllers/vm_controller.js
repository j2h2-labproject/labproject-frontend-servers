var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

// Require all managers
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');
var vm_manager = require(LABPROJECT_BASE + '/lib/managers/vm_manager');
var helper =  require(LABPROJECT_BASE + '/lib/util/controller_helpers');

var vm_client = null;

module.exports = {
	initialize: function(new_client) {
		vm_client = new_client;
		vm_manager.initialize(vm_client);
	},
	list_vms: function(session_id, callback) {
		if (vm_client === null) {
			callback(new Error("initialize function must be run first"), null);
		} else {
			helper.get_user_data(session_id, function(d_error, user_data) {

				if (d_error) {
					callback(new Error("Invalid session"), null);
					return;
				}

				var user = user_data.user;
	      var permissions = user_data.permissions;
				var groups = user_data.groups;

				vm_manager.list_available_vms(user, groups, function(error, result) {
					if (!error) {
						callback(null, result);
					} else {
						callback(error, null);
					}
				});
			});
		}

	},
  create_vm: function(session_id, vm_server, hypervisor, vm_name, callback) {
		if (vm_client === null) {
			callback(new Error("initialize function must be run first"), null);
		} else {
			helper.get_user_data(session_id, function(d_error, user_data) {

				if (d_error) {
					callback(new Error("Invalid session"), null);
					return;
				}

				var user = user_data.user;
				var permissions = user_data.permissions;

				if (permissions.can_create_vms() || permissions.is_superuser()) {
					vm_manager.new_vm(vm_server, vm_name, function(l_error, vm_obj) {
						if (!l_error) {

							vm_obj.set_owner(user);
							vm_obj.set_hypervisor(hypervisor);

							var done = function(callback) {
								vm_obj.save(function(s_error, result) {
									vm_obj.state.define(function(d_error, status) {
										if (!s_error) {
											callback(null, vm_obj.get_uuid());
										} else {
											callback(s_error, null);
										}
									});
								});
							};

							callback(null, vm_obj.config, done);


						} else {
							callback(l_error, null);
						}
					});
				} else {
					callback(new Error("Permission denied"), null);
				}

			});
		}


  },
	redefine_vm: function(session_id, uuid, callback) {

	},
	delete_vm: function(session_id, lab_id, callback) {
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
						lab_obj.delete(function(d_error, result) {
							callback(d_error, result);
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
	start_vm: function(session_id, uuid, callback) {
		if (vm_client === null) {
			callback(new Error("initialize function must be run first"), null);
		} else {
			helper.get_user_data(session_id, function(d_error, user_data) {

				if (d_error) {
					callback(new Error("Invalid session"), null);
					return;
				}

				var user = user_data.user;
				var permissions = user_data.permissions;
				var groups = user_data.groups;
				var session = user_data.session;


				vm_manager.get_vm(uuid, function(error, vm) {
					if (!error) {

						if (vm.can_use(user, groups) || permissions.is_superuser()) {

							if (vm.is_template()) {
								callback(new Error("Cannot start a template"), null);
								return;
							}

							if (session.get_session_data('current_lab_id') !== null) {
								lab_manager.get_lab(session.get_session_data('current_lab_id'), function(l_error, lab) {
									if (!l_error) {
										if (lab.device_in_lab(uuid)) {
											if (!(vm.in_maintenance_mode())) {
												vm.state.start(function(s_error, status) {
													callback(null, result);
												});
											} else {
												callback(new Error("Cannot start a VM that is maintenance mode and in a lab"), null);
											}
										} else {
											callback(new Error("Cannot start a VM that is not in the current lab"), null);
										}
									} else {
										callback(l_error, null);
									}
								});
							} else {
								if (vm.in_maintenance_mode()) {
									vm.state.start(function(s_error, status) {
										callback(null, result);
									});
								} else {
									callback(new Error("Cannot start a VM that is not in a lab or in maintenance mode"), null);
								}
							}

						}
					} else {
						callback(error, null);
					}
				});
			});
		}
	}
};

function update_vm(vm, config) {
	if (config.mem_size !== undefined) {
		vm.config.set_mem_size(config.mem_size);
	}

	if (config.cpu_count !== undefined) {
		vm.config.set_cpu_count(config.cpu_count);
	}

	if (config.cpu_count !== undefined) {
		vm.config.set_cpu_count(config.cpu_count);
	}

}
