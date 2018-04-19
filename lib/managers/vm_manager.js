var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var vm_server_client = null;


var uuid = require('uuid');

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');
var common_crypto = require(LABPROJECT_LIB + '/common/crypto');
var database = require(LABPROJECT_LIB + '/util/database');
var hypervisor_string = require(LABPROJECT_LIB + '/common/hypervisor_string');
var string_util = require(LABPROJECT_LIB + '/common/string');
var foreach = require(LABPROJECT_LIB + "/common/loop").foreach;


module.exports = {
    initialize: function(new_client) {
        vm_server_client = new_client;
    },
    list_available_vms: function(username, groups, callback) {
        database.find('registered_devices', { $or: [{"owner": username}, {'users_use': username}, {'users_edit': username}, {'groups_use': { $in: groups }}, {'groups_edit': { $in: groups }}] }, {}, function(d_error, results) {
            if (!d_error) {
                var vm_list = [];
                for (var i = 0; i < results.length; i++) {
                    vm_list.push({"name": results[i].name, "uuid": results[i].uuid, "owner": results[i].owner});
                }
                callback(null, vm_list);
            } else {
                callback(d_error, null);
            }
        });
    },
    list_allocated_vms: function(callback) {

    },
    new_vm: function(vm_server, name, callback) {
        if (vm_server_client === null) {
            callback(new Error("initialize function must be run first"), null);
        } else {
            create_new_vm(vm_server, name, callback);
        }
    },
    get_vm: function(uuid, callback) {
        if (vm_server_client === null) {
            callback(new Error("initialize function must be run first"), null);
        } else {
            var return_vm = new virtual_machine(uuid, vm_server_client);
            return_vm.load(function(error, result) {
                if (error) {
                    callback(error, null);
                } else {
                    callback(null, return_vm);
                }
            });
        }
    },
    delete_vm: function(uuid, callback) {
        if (vm_server_client === null) {
            callback(new Error("initialize function must be run first"), null);
        } else {
            var delete_vm = new virtual_machine(uuid, vm_server_client);
            delete_vm.delete(function(error, result) {
                callback(error, result);
            });
        }
    }
};

function generate_vm_id() {
    return "vm-" + uuid.v4();
}

function create_new_vm(vm_server, name, callback) {
    var vm_id = generate_vm_id();
    var new_vm_obj = new virtual_machine(vm_id, vm_server_client);

    new_vm_obj.init(function(i_error, status) {
        if (!i_error && status === true) {
            new_vm_obj.set_vm_server(vm_server);
            new_vm_obj.set_name(name);

            new_vm_obj.save(function(s_error, result) {
                if (!s_error) {
                        callback(null, new_vm_obj);
                } else {
                        callback(s_error, null);
                }
            });
        } else {
            if (i_error.name === "MongoError" && i_error.code === 11000) {
                create_new_vm(username, callback);
            } else {
                callback(i_error, null);
            }
        }
    });
}

function is_hd_type(value) {
    var valid_disks = ['raw','bochs','cloop','cow','dmg','iso','qcow','qcow2','qed','vmdk','vpc', 'vdi'];

    if (valid_disks.indexOf(value)!=-1) {
        return true;
    } else {
        return false;
    }
}

function virtual_machine(uuid, server_client) {
    var self = this;

    var Private = {
        uuid: uuid,
        name: null,
        description: '',
        hypervisor: null,
        owner: null,
        tags: [],
        template: false,
        vm_server: null,
        users_use: [],
        users_edit: [],
        groups_use: [],
        groups_edit: [],
        // When a VM is defined, this means the VM is created in the underlying hypervisor
        defined: false,
        base_snapshot: '',
        // If maintenance mode is on, the VM cannot be added to a lab, but can be started and modified in the maintenance environment
        maintenance: true,
        // Allocated indicates if the VM is currently being used in a lab (VMs can be in muliple labs, but only used in one at a time)
        allocated: false,
        // VM config
        mem_size: null,
        cpu_count: 1,
        platform: 'x32',
        hd_list: [],
        cd_list: [],
        interface_list: [],
        features: {
            acpi: true,
            apic: true,
            pae: true
        },
        display: null
    };


    self.init = function(callback) {
        database.insert('registered_devices', {"uuid": Private.uuid}, function(error, result) {
            if (!error) {
                callback(null, true);
            } else {
                callback(new Error("Device insert failed"), null);
            }
        });
    };

    self.load = function(callback) {
        database.findOne('registered_devices', {"uuid": Private.uuid}, function(d_error, result) {
            if (result) {

                Private = result;

                callback(null, true);

            } else if (d_error) {
                callback(d_error, null);
            } else {
                callback(new Error("Device does not exist"), null);
            }
        });
    };

    self.save = function(callback) {
        database.update('registered_devices', {"uuid": Private.uuid}, Private, false, function(error, result) {
            if (!error) {
                callback(null, true);
            } else {
                callback(new Error("Device update failed"), null);
            }
        });
    };

    self.delete = function(callback) {
        database.remove('registered_devices', {"uuid": Private.uuid}, function(error, result) {
            if (!error) {
                callback(null, true);
            } else {
                callback(new Error("Device delete failed"), null);
            }
        });
    };

    self.can_edit = function(username, groups) {
        if (Private.owner == username) {
            return true;
        } else if (Private.users_edit.indexOf(username) != -1) {
            return true;
        } else {
            for (var i = 0; i < groups.length; i++) {
                if (Private.groups_edit.indexOf(group[i]) != -1) {
                    return true;
                }
            }
            return false;
        }
    };

    self.can_use = function(username, groups) {
        if (self.can_edit(username, groups)) {
            return true;
        } else if (Private.users_use.indexOf(username) != -1) {
            return true;
        } else {
            for (var i = 0; i < groups.length; i++) {
                if (Private.groups_use.indexOf(group[i]) != -1) {
                    return true;
                }
            }
            return false;
        }
    };

    self.get_uuid = function() {
        return Private.uuid;
    };

    self.get_vm_id = function() {
        return Private.uuid;
    };

    self.get_name = function() {
        return Private.name;
    };

    self.set_name = function(name) {
        name = sanitize.simple_text(name);
        Private.name = name;
    };

    self.get_description = function() {
        return Private.description;
    };

    self.set_description = function(description) {
        description = sanitize.simple_text(description);
        Private.description = description;
    };

    self.get_hypervisor = function() {
        return Private.hypervisor;
    };

    self.set_hypervisor = function(hypervisor) {
        if (hypervisor_string.is_hypervisor(hypervisor)) {
            Private.hypervisor = hypervisor;
            return true;
        } else {
            return false;
        }
    };

    self.get_vm_server = function() {
        return Private.vm_server;
    };

    self.set_vm_server = function(vm_server) {
        vm_server = sanitize.simple_string(vm_server);
        Private.vm_server = vm_server;
    };

    self.get_owner = function() {
        return Private.owner;
    };

    self.set_owner = function(username) {
        username = sanitize.simple_string(username);
        Private.owner = username;
    };

    self.is_template = function() {
        return Private.template;
    };

    self.set_is_template = function(value) {
        if (value === true || value === false) {
             Private.template = value;
        }
    };

    self.in_maintenance_mode = function() {
        return Private.maintenance;
    };

    self.set_maintenance_mode = function(value) {
        if (value === true || value === false) {
            Private.maintenance = value;
        }
    };

    self.state = {
        is_defined: function() {
            return Private.defined;
        },
        // Actually create the VM in the hypervisor
        define: function(callback) {

            var vm_config = {
                hypervisor: Private.hypervisor,
                name: Private.name,
                uuid: Private.uuid.replace("vm-", ""),
                mem_size: Private.mem_size,
                cpu_count: Private.cpu_count,
                platform: Private.platform,
                hd_list: Private.hd_list,
                cd_list: Private.cd_list,
                interface_list: Private.interface_list,
                features: {
                    acpi: Private.features.acpi,
                    apic: Private.features.apic,
                    pae: Private.features.pae
                },
                display: Private.display
            };

            for (var item in vm_config) {
                if (vm_config[item] === null) {
                    callback(new Error("VM not fully configured"), null);
                    return;
                }
            }


            server_client.call(Private.vm_server, "create_vm", {config: vm_config}, function(s_error, result) {
                if (!s_error) {
                    Private.defined = true;
                    self.save(function(s_error, result) {
                        callback(null, result);
                    });

                } else {
                    console.log("error", s_error);
                    callback(s_error, null);
                }
            });

        },
        // Delete the VM in hypervisor
        undefine: function(callback) {
            server_client.call(Private.vm_server, "delete_vm", {uuid: Private.uuid.replace("vm-", "")}, function(s_error, result) {
                if (!s_error) {
                    Private.defined = false;

                    callback(null, true);

                } else {
                    callback(s_error, null);
                }
            });
        },
        update: function(callback) {
            var vm_config = {
                name: Private.name,
                  mem_size: Private.mem_size,
                cpu_count: Private.cpu_count,
                platform: Private.platform,
                hd_list: Private.hd_list,
                 cd_list: Private.cd_list,
                interface_list: Private.interface_list,
                features: {
                    acpi: Private.features.acpi,
                    apic: Private.features.apic,
                    pae: Private.features.pae
                },
                display: Private.display
            };

            for (var item in vm_config) {
                if (vm_config[item] === null) {
                    callback(new Error("VM not fully configured"), null);
                    return;
                }
            }

            server_client.call(Private.vm_server, "update_vm", {uuid: Private.uuid.replace("vm-", ""), config: vm_config}, function(s_error, result) {
                if (!s_error) {
                    Private.defined = true;
                    self.save(function(s_error, result) {
                        callback(null, result);
                    });

                } else {
                    console.log("error", s_error);
                    callback(s_error, null);
                }
            });
        },
        // Mark the VM in use so nobody else can use it 
        allocate: function(callback) {
            if (Private.allocated === true) {
                callback(new Error("Device has already been allocated"), null);
                return;
            }

            database.insert('allocated_devices', {uuid: Private.uuid}, function(i_error, result) {
                if (!i_error) {
                    Private.allocated = true;

                    self.save(function(s_error, status) {
                        if (!s_error) {
                            callback(null, true);
                        } else {
                            callback(s_error, null);
                        }
                    });

                } else {
                    if (i_error.name === "MongoError" && i_error.code === 11000) {
                        callback(new Error("Device is already allocated by another user"), null);
                    } else {
                        callback(i_error, null);
                    }
                }
            });
        },
        deallocate: function(callback) {
            if (Private.allocated === false) {
                callback(new Error("Device is not allocated"), null);
                return;
            }

            database.remove('allocated_devices', {"uuid": Private.uuid}, function(error, result) {
                if (!error) {
                    Private.allocated = false;

                    self.save(function(s_error, status) {
                        if (!s_error) {
                            callback(null, true);
                        } else {
                            callback(s_error, null);
                        }
                    });
                } else {
                    callback(new Error("Device deallocation failed"), null);
                }
            });

        },
        start: function(callback) {
            if (Private.defined !== false) {
                if (Private.template === true) {
                    callback(new Error("Cannot start template"), null);
                } else if (Private.allocated === false) {
                    callback(new Error("Cannot start a VM that has not been allocated"), null);
                } else {
                    server_client.call(Private.vm_server, "start_vm", {uuid: Private.uuid.replace("vm-", "")}, function(s_error, result) {
                        if (!s_error) {
                            callback(null, true);
                        } else {
                            callback(s_error, null);
                        }
                    });
                }
            } else {
                callback(new Error("VM is not defined"), null);
            }

        },
        stop: function(callback) {
            if (Private.allocated === true) {
                server_client.call(Private.vm_server, "stop_vm", {uuid: Private.uuid.replace("vm-", "")}, function(s_error, result) {
                    if (!s_error) {
                        callback(null, true);
                    } else {
                        callback(s_error, null);
                    }
                });
            } else {
                callback(new Error("VM is not allocated"), null);
            }
        },
        is_running: function(callback) {
            server_client.call(Private.vm_server, "vm_is_running", {uuid: Private.uuid.replace("vm-", "")}, function(s_error, result) {
                if (!s_error) {
                    callback(null, result);
                } else {
                    callback(s_error, null);
                }
            });
        },
        set_base: function(callback) {
            self.state.is_running(function(r_error, status) {

            });
        },
        
    };

    self.config = {
        get_mem_size: function() {
            return Private.mem_size;
        },
        set_mem_size: function(mem) {
            if (Number.isInteger(mem)) {
                Private.mem_size = mem;
            } else {

            }
        },
        get_cpu_count: function() {
            return Private.cpu_count;
        },
        set_cpu_count: function(cpu_count) {
            if (Number.isInteger(cpu_count)) {
                Private.cpu_count = cpu_count;
            } else {

            }
        },
        get_platform: function() {
            return Private.platform;
        },
        set_platform: function(platform) {
            if (platform == "x32" || platform == "x64") {
                Private.platform = platform;
            } else {

            }
        },
        append_hd: function(bus, disk_id, path, format) {
            if (disk_id && path && format && bus) {
                Private.hd_list.push({"disk_id": disk_id, "path": path, "format": format, "bus": bus});
            }
        },
        remove_hd: function(name) {

        },
        append_cd: function(bus, iso_id, path) {
            if (iso_id && path && bus) {
                Private.cd_list.push({"iso_id": iso_id, "path": path, "bus": bus});
            }
        },
        remove_cd: function(name) {

        },
        get_display: function() {
            return Private.display;
        },
        set_display: function(display) {
            if (Private.hypervisor !== null) {
                if (display != "vnc" && display != "local" && display != "rdp") {

                } else if (((display == "rdp" || display == "local") && Private.hypervisor == "vbox") || (display == "vnc" && Private.hypervisor == "qemu")) {
                    Private.display = display;
                } else {

                }
            }
        },
        interface_count: function() {
            return Private.interface_list.length;
        },
        append_interface: function(interface, connected) {
            Private.interface_list.push({"interface": interface, "connected": connected});
        },
        remove_interface: function(interface) {
            for (var i = 0; i < Private.interface_list.length; i++) {
                if (Private.interface_list[i]['interface'] == interface) {
                    Private.interface_list[i] = null;
                }
            }
        },
        update_interface: function(location, interface) {
            if (location < Private.interface_list.length) {
                if (Private.interface_list[location] == null || Private.interface_list[location] == {}) {
                    Private.interface_list[location] = {"interface": interface}
                } else {
                    Private.interface_list[location]['interface'] = interface;
                }
            }
        }
    };


}


function define_disks(uuid, hd_list, callback) {
    foreach(hd_list,
    function(loc, hd_obj, pass_data, next) {
        var hd_name = uuid + hd_obj['target']
    }, 
    callback);
}