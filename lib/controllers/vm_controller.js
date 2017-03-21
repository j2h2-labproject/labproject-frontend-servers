var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

// Require all managers
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');
var switch_manager = require(LABPROJECT_BASE + '/lib/managers/switch_manager');
var vm_manager = require(LABPROJECT_BASE + '/lib/managers/vm_manager');

// Utility
var helper = require(LABPROJECT_BASE + '/lib/util/controller_helpers');
var interface_util = require(LABPROJECT_LIB + '/util/interface_util');
var foreach = require(LABPROJECT_LIB + "/common/loop").foreach;

var vm_client = null;

module.exports = {
	initialize: function(new_client) {
		vm_client = new_client;
		vm_manager.initialize(vm_client);
	},
	list_vms: function(session_id, callback) {
		if (vm_client === null) {
			callback(new Error("initialize function must be run first"), null);
			return;
		} 

		helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {

			if (d_error) {
				callback(new Error("Invalid session"), null);
				return;
			}

			vm_manager.list_available_vms(user, groups, function(error, result) {
				if (!error) {
					callback(null, result);
				} else {
					callback(error, null);
				}
			});
		});
	

	},
	create_vm: function(session_id, vm_server, hypervisor, vm_name, platform, cpu_count, mem_size, options, callback) {

		if (vm_client === null) {
			callback(new Error("initialize function must be run first"), null);
			return;
		} 

		// Sanitize input data
		session_id = sanitize.simple_string(session_id);
		vm_server = sanitize.simple_string(vm_server);
		hypervisor = sanitize.simple_string(hypervisor);
		vm_name = sanitize.simple_string(vm_name);
		if (!Number.isSafeInteger(cpu_count)) {
			callback(new Error("Invalid option for cpu_count"), null);
			return;
		}
		if (!Number.isSafeInteger(mem_size)) {
			callback(new Error("Invalid option for mem_size"), null);
			return;
		}
		platform = sanitize.simple_string(platform);

		var optional_keys = ['']

		helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {

			if (d_error) {
				callback(new Error("Invalid session"), null);
				return;
			}

			if (permissions.can_create_vms() || permissions.is_superuser()) {
				vm_manager.new_vm(vm_server, vm_name, function(l_error, vm_obj) {
					if (!l_error) {

						vm_obj.set_owner(user);
						vm_obj.set_hypervisor(hypervisor);
						vm_obj.config.set_mem_size(mem_size);
						vm_obj.config.set_cpu_count(cpu_count);
						vm_obj.config.set_platform(platform);

						vm_obj.save(function(s_error, result) {
							callback(null, vm_obj.get_uuid());
						});
					} else {
						callback(l_error, null);
					}
				});
			} else {
				callback(new Error("Permission denied"), null);
			}

		});
		


	},
	config_vm_drives: function(session_id, vm_id, hd_list, cd_list, callback) {

	},
	config_vm_interface: function(session_id, vm_id, iface_list, callback) {

	},
	get_vm_config: function(session_id, vm_id, callback) {

		// Sanitize
		session_id = sanitize.simple_string(session_id);

		if (vm_client === null) {
			callback(new Error("initialize function must be run first"), null);
		} else {
			helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {
				if (d_error) {
					callback(new Error("Invalid session"), null);
					return;
				}

				if (permissions.can_use_vms() || permissions.is_superuser()) {
					vm_manager.get_vm(vm_id, function(error, vm_obj) {
						if (!error) {
							if (vm_obj.can_use(user, groups)) {

							}
						} else {
							callback(error, null);
						}
					});
				}
			});
		}
	},
	redefine_vm: function(session_id, uuid, callback) {

	},
	delete_vm: function(session_id, lab_id, callback) {
		helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {

			if (d_error) {
				callback(new Error("Invalid session"), null);
				return;
			}

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
	start_vm_in_maint_mode: function(session_id, uuid, callback) {
		if (vm_client === null) {
			callback(new Error("initialize function must be run first"), null);
		} else {
			helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {

				if (d_error) {
					callback(new Error("Invalid session"), null);
					return;
				}

				vm_manager.get_vm(uuid, function(error, vm) {
					if (!error) {

						// Permissions
						if (vm.get_owner() == user || permissions.is_superuser()) {

							if (vm.is_template()) {
								callback(new Error("Cannot start a template"), null);
								return;
							}

							// Lock the VM for our use
							vm.state.allocate(function(error, result) {
								if (!error) {

									vm.state.is_running(function(c_error, result) {
										if (!c_error) {
											if (result == true) {
												callback(new Error("VM is already running"), null);
											} else {
												vm.set_maintenance_mode(true);

												var done_function = function() {
													vm.save(function(s_error, result) {
														if (!s_error) {
															vm.state.start(function(s_error, status) {
																callback(null, result);
															});
														} else {
															callback(s_error, null);
														}
													});
												}
												// Allocate interfaces if necessary
												// TODO: Figure out what to do when a VM has multiple interfaces
												if (vm.config.interface_count() > 0) {
													interface_util.allocate_interface("maint", function(error, interface_name) {
														if (!error) {
															vm.update_interface(0, interface_name);
															vm.state.update(function(u_error, result) {
																if (!u_error) {
																	done_function();
																} else {
																	callback(u_error, null);
																}
															});
														} else {
															callback(error, null);
														}
													});
												} else {
													done_function();
												}
											}
										}
									});

								} else {
									callback(error, null);
								}
							});

						}
					} else {
						callback(error, null);
					}
				});
			});
		}
	},
	remove_vm_maint_mode: function(session_id, uuid, callback) {

	}
};

function build_maintenance_environment(callback) {

}


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
