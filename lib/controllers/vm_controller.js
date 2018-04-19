var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

// Require all managers
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');
var switch_manager = require(LABPROJECT_BASE + '/lib/managers/switch_manager');
var vm_manager = require(LABPROJECT_BASE + '/lib/managers/vm_manager');
var server_manager = require(LABPROJECT_LIB + "/managers/vm_server_manager");
var iso_manager = require(LABPROJECT_LIB + "/managers/iso_manager");
var disk_manager = require(LABPROJECT_LIB + "/managers/disk_manager");

// Utility
var helper = require(LABPROJECT_BASE + '/lib/util/controller_helpers');
var interface_util = require(LABPROJECT_LIB + '/util/interface_util');
var foreach = require(LABPROJECT_LIB + "/common/loop").foreach;
var sanitize = require(LABPROJECT_LIB + '/common/sanitize');

var vm_client = null;



module.exports = function(server_client, logger) {

    if (server_client===undefined || logger === undefined) {
        return null;
    }

    function alloc_maint(vm_server, callback) {
        server_manager.get_server(vm_server, function(server_error, server_obj) {
            if (server_error) {
                callback(server_error, null);
                return;
            }
    
            server_obj.allocate_maint_interface(function(int_error, new_int){
                callback(server_error, null);
            });
        });
    }
    
    function start_maint(vm_obj, callback) {
        vm_obj.state.allocate(function(alloc_error, result) {
            if (alloc_error) {
                callback(alloc_error, null);
                return;
            }  
    
            vm_obj.set_maintenance_mode(true);
    
            var start_vm = function(start_vm_obj) {
                start_vm_obj.state.start(function(st_error, result) {
                    callback(st_error, result);
                });
            };
    
            if (vm_obj.config.interface_count() > 0) {
                var vm_server = vm_obj.get_vm_server();
                alloc_maint(vm_server, function(alloc_error, maint_int){
                    if (alloc_error) {
                        callback(alloc_error, null);
                        return;
                    }
                    vm_obj.config.update_interface(0, maint_int);
                    for (var i = 1; i < vm_obj.config.interface_count(); i++) {
                        vm_obj.config.update_interface(i, {});
                    }
                    vm_obj.save(function(s_error, status) {
                        if (s_error) {
                            callback(s_error, null);
                            return;
                        } 
                        vm_obj.state.update(function(u_error, status){
                            if (u_error) {
                                callback(u_error, null);
                                return;
                            } 
                            start_vm(vm_obj);
                        });
                    });
                });
            } else {
                start_vm(vm_obj);
            }
    
            
        });
    }
    
    
    function expand_hd(vm_id, hd_list, vm_server, user, groups, callback) {
        if (hd_list.length == 0) {
            callback(null, []);
            return;
        }
        console.log("Expanding HD");
        foreach(hd_list, function(loc, hd_obj, pass_data, next) {
            if (loc == 0) {
                pass_data = [];
            }
    
            // Check if config is good
            if (hd_obj.size === undefined || hd_obj.format === undefined) {
                callback(new Error("disk config is not defined", null));
                return;
            }
    
            // Check if size is a number
            if (!Number.isSafeInteger(hd_obj.size)) {
                callback(new Error("Invalid value for disk size"), null);
                return;
            } else {
                mem_size = hd_obj.size;
            }
    
            // TODO: Check if format is valid
    
            var drive_name = vm_id + "-disk" + loc;
    
            disk_manager.new_disk(drive_name, hd_obj.format, vm_server, hd_obj.size, function(c_error, disk_obj){
                console.log(drive_name);
                if (c_error) {
                    callback(c_error, null);
                    return;
                }
                disk_obj.set_owner(user);
                disk_obj.define_disk(function(d_error, full_path) {
                    if (d_error) {
                        callback(d_error, null);
                        return;
                    }
                    logger.log('info', "Creating drive " + drive_name + " of size " + (hd_obj.size));
                    disk_obj.save(function(s_error, result) {
                        if (s_error) {
                            callback(s_error, null);
                            return;
                        }
                        var return_hd = Object.assign({}, hd_obj); 
                        return_hd.path = full_path;
                        return_hd.disk_id = disk_obj.get_disk_id();
                        pass_data.push(return_hd);
                        next(null, pass_data);
                    });
                });
    
            });
        }, callback);
    }
    
    function expand_cd(cd_list, vm_server, user, groups, callback) {
        if (cd_list.length == 0) {
            callback(null, []);
            return;
        }
        foreach(cd_list, function(loc, cd_obj, pass_data, next) {
            if (pass_data === null) {
                pass_data = [];
            }
    
            if (cd_obj.iso_id === undefined || cd_obj.iso_id === null) {
                next(new Error("iso_id is not defined", null));
                return;
            }
    
            iso_manager.get_iso(cd_obj.iso_id, function(get_error, iso_obj) {
                if (get_error) {
                    next(new Error("Could not get ISO with id " + cd_obj.iso_id, null));
                    return;
                }
                iso_obj.exists_on_server(vm_server, function(i_error, result) {
                    if (i_error) {
                        next(i_error, null);
                        return;
                    }
                    iso_obj.get_full_path(vm_server, function(f_error, result) {
                        if (f_error) {
                            next(f_error, null);
                            return;
                        }
                        var return_cd = Object.assign({}, cd_obj); 
                        return_cd.path = result;
                        return_cd.iso_id = iso_obj.get_iso_id();
                        pass_data.push(return_cd);
                        next(null, pass_data);
                    });
                });
            });
        }, callback);
    }
    
    function expand_drives(vm_id, drives_list, vm_server, user, groups, callback) {
    
        if (drives_list.cd === undefined) {
            drives_list.cd = [];
        }
    
        if (drives_list.hd === undefined) {
            drives_list.hd = [];
        }
        console.log(drives_list.cd);
        // Fill out CD drivers and HD drives
        expand_cd(drives_list.cd, vm_server, user, groups, function(cd_error, cd_list){
            
            if (cd_error) {
                callback(cd_error, null);
                return;
            }
            console.log("hi", drives_list.hd);
            expand_hd(vm_id, drives_list.hd, vm_server, user, groups, function(hd_error, hd_list) {
                if (hd_error) {
                    callback(hd_error, null);
                    return;
                }
                callback(null, {"cd": cd_list, "hd": hd_list});
            });
        });
    }



    var self = this;
    vm_manager.initialize(server_client);
    server_manager.initialize(server_client);
    iso_manager.initialize(server_client);
    disk_manager.initialize(server_client);

    self.list_vms = function(session_id, callback) {
        session_id = sanitize.simple_string(session_id);

        helper.get_user_data(session_id, function(sess_error, user, groups, permissions, session) {
            if (sess_error) {
                callback(sess_error, null);
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
    };

    self.create_vm = function(session_id, vm_server, hypervisor, vm_name, resources, interfaces, drives, options, callback) {
        session_id = sanitize.simple_string(session_id);
        vm_server = sanitize.simple_string(vm_server);
        hypervisor = sanitize.simple_string(hypervisor);
        vm_name = sanitize.simple_string(vm_name);
        
        var mem_size = 0;
        if (resources.mem_size !== undefined ) {
            if (!Number.isSafeInteger(resources.mem_size)) {
                callback(new Error("Invalid option for mem_size"), null);
                return;
            } else {
                mem_size = resources.mem_size;
            }
        }

        var cpu_count = 0;
        if (resources.cpu_count !== undefined) {
            if (!Number.isSafeInteger(resources.cpu_count)) {
                callback(new Error("Invalid option for cpu_count"), null);
                return;
            } else {
                cpu_count = resources.cpu_count;
            }
        }

        var platform = "x86";
        if (options.platform !== undefined) {
            platform = sanitize.simple_string(platform);
        }

        var display = "";
        if (options.display === undefined) {
            callback(new Error("No display set"), null);
            return;
        } else {
            display = options.display;
        }
        helper.get_user_data(session_id, function(sess_error, user, groups, permissions, session) {
            if (sess_error) {
                callback(new Error("Invalid session"), null);
                return;
            }
            if ( permissions.can_create_vms() ||  
                 permissions.is_superuser() ) {
                vm_manager.new_vm(vm_server, vm_name, function(l_error, vm_obj) {
                    if (!l_error) {

                        vm_obj.set_owner(user);
                        vm_obj.set_hypervisor(hypervisor);
                        vm_obj.config.set_mem_size(mem_size);
                        vm_obj.config.set_cpu_count(cpu_count);
                        vm_obj.config.set_platform(platform);
                        vm_obj.config.set_display(display);
                        console.log("new vm: " + user + ": " + vm_obj.get_uuid());
                        expand_drives(vm_obj.get_vm_id(), drives, vm_server, user, groups, function(disk_error, new_drives) {
                            if (disk_error) {
                                callback(disk_error, null);
                                return;
                            }
                            for (var c = 0; c < new_drives.cd.length; c++) {
                                var cd = new_drives.cd[c];
                                vm_obj.config.append_cd(cd.bus, cd.iso_id, cd.path);
                            }
                            for (var h = 0; h < new_drives.hd.length; h++) {
                                console.log("hd!");
                                var hd = new_drives.hd[h];
                                vm_obj.config.append_hd(hd.bus, hd.disk_id, hd.path, hd.format);
                            }
                            for (var i = 0; i < interfaces.length; i++) {
                                console.log("interface!");
                                var interface = interfaces[i];
                                vm_obj.config.append_interface("", interface.connected);
                            }
                            vm_obj.save(function(s_error, result) {
                                if (s_error) {
                                    callback(s_error, null);
                                    return;
                                }
                                vm_obj.state.define(function(d_error, result) {
                                    if (d_error) {
                                        callback(d_error, null);
                                        return;
                                    }
                                    callback(null, vm_obj.get_uuid());
                                });
                            });
                        });

                        
                    } else {
                        callback(l_error, null);
                    }
                });
            } else {
                callback(new Error("Permission denied"), null);
            }

        });
    };

    self.delete_vm = function(session_id, vm_id, callback) {
        session_id = sanitize.simple_string(session_id);
        vm_id = sanitize.simple_string(vm_id);

        helper.get_user_data(session_id, function(sess_error, user, groups, permissions, session) {
            if (sess_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            vm_manager.get_vm(vm_id, function(v_error, vm_obj) {
                if (v_error) {
                    callback(v_error, null);
                    return;
                }

                if (vm_obj.get_owner() == user || permissions.can_admin_vms() || permissions.is_superuser()) {
                    vm_obj.state.undefine(function(u_error, result){
                        if (u_error) {
                            callback(u_error, null);
                            return;
                        }
                        vm_obj.delete(function(d_error, result){
                            callback(d_error, result);
                        });
                    });
                } else {
                    callback(new Error("Permission denied"), null);
                }
            });

        });

    };

    self.start_vm_maint = function(session_id, vm_id, callback) {

        session_id = sanitize.simple_string(session_id);
        vm_id = sanitize.simple_string(vm_id);

        helper.get_user_data(session_id, function(sess_error, user, groups, permissions, session) {
            if (sess_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            vm_manager.get_vm(vm_id, function(v_error, vm_obj) {
                if (v_error) {
                    callback(v_error, null);
                    return;
                }
                // Only owner or admins can start a VM in maintenance mode
                if (vm_obj.get_owner() == user || permissions.can_admin_vms() || permissions.is_superuser()) {
                    start_maint(vm_obj, function(st_error, status){
                        callback(st_error, status);
                    });
                } else {
                    callback(new Error("Permission denied"), null);
                }

            });

            

        });
    };

    self.shutdown_vm = function(session_id, vm_id, callback) {
        session_id = sanitize.simple_string(session_id);
        vm_id = sanitize.simple_string(vm_id);

        helper.get_user_data(session_id, function(sess_error, user, groups, permissions, session) {
            if (sess_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            vm_manager.get_vm(vm_id, function(v_error, vm_obj) {
                if (v_error) {
                    callback(v_error, null);
                    return;
                }

                // Not in maintenance mode, owner, admins and other authorized users can shutdown
                if (!(vm_obj.in_maintenance_mode()) && (
                    vm_obj.get_owner() == user || 
                    permissions.can_admin_vms() || 
                    permissions.is_superuser()) ||
                    vm_obj.can_use(user, groups)) {
                    
                    vm_obj.state.stop(function(s_error, result) {
                        callback(s_error, result);
                    });


                // In maintenance mode, only owner and admins can shutdown
                } else if (vm_obj.in_maintenance_mode() && (vm_obj.get_owner() == user || permissions.can_admin_vms() || permissions.is_superuser())) {
                    vm_obj.state.stop(function(s_error, result) {
                        vm_obj.set_maintenance_mode(false);
                        vm_obj.save(function(sa_error, result){
                            callback(sa_error, result);
                        });
                    });
                } else { 
                    callback(new Error("Permission denied"), null);
                }

              
            });

        });
    };
    
    return self;

};

