/*

Lab Manager - Manages lab objects

A lab represents exactly as named. It stores lab-oriented permissions and data to recreate the lab when loaded
Controller will take care of actually recreating the lab devices and connections.

The lab also manages the interface group for the lab.

*/
var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');
// var common_crypto = require(LABPROJECT_LIB + '/common/crypto');
var database = require(LABPROJECT_LIB + '/util/database');
var interface_util = require(LABPROJECT_LIB + '/util/interface_util');

var vm_server_client = null;

module.exports = {
    // Setup the module with the vm_clients
    initialize: function(new_client) {
        vm_server_client = new_client;
    },
    // List all labs available to a user/group combination
    list_available_labs: function(username, groups, callback) {
        database.find('labs', { $or: [{"owner": username}, {'users_readonly': username}, {'users_edit': username}, {'groups_readonly': { $in: groups }}, {'groups_edit': { $in: groups }}] }, {}, function(d_error, results) {
            if (!d_error) {
                var lab_list = [];
                for (var i = 0; i < results.length; i++) {
                    lab_list.push({"name": results[i].lab_name, "lab_id": results[i].lab_id, "owner": results[i].owner});
                }
                callback(null, lab_list);
            } else {
                callback(d_error, null);
            }
        });
    },
    // Create a new lab
    new_lab: function(owner, lab_name, callback) {
    owner = sanitize.simple_string(owner);
        lab_name = sanitize.simple_string(lab_name);

    create_new_lab(owner, lab_name, callback);

    },
    // Get a lab object
    get_lab: function(lab_id, callback) {
    var return_lab = new lab(lab_id, vm_server_client);
    return_lab.load(function(error, result) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, return_lab);
      }
    });
    },
    // Remove a lab object
    delete_lab: function(lab_id, callback) {
        var remove_lab = new lab(lab_id, vm_server_client);
    remove_lab.delete(function(error, result) {
        callback(error, result);
    });
    }
};

function generate_lab_id(username, lab_name) {
    return "lab-" + username + "-" + lab_name;
}

function create_new_lab(owner, lab_name, callback) {
  var new_lab_id = generate_lab_id(owner, lab_name);
  var new_lab = new lab(new_lab_id, vm_server_client);

  new_lab.init(function(i_error, status) {
    if (!i_error && status === true) {
      new_lab.set_owner(owner);
            new_lab.set_lab_name(lab_name);
      new_lab.save(function(s_error, result) {
        if (!s_error) {
            callback(null, new_lab);
        } else {
            callback(s_error, null);
        }
      });
    } else {
      if (i_error.name === "MongoError" && i_error.code === 11000) {
        callback(new Error("Lab already exists"), null);
      } else {
        callback(i_error, null);
      }
    }
  });
}

// Lab object
function lab(lab_id, server_client) {
    var self = this;

    var Private = {
        lab_id: lab_id,
    lab_name: null,
        owner: null,
        users_readonly: [],
        users_edit: [],
    groups_readonly: [], // List of groups that can only use the lab
    groups_edit: [], // List of groups that can edit the lab
        current_devices: [],
        current_connections: [],
        current_state: '',
        current_servers: [],
        interface_group: null
    };

  self.init = function(callback) {
    database.insert('labs', {"lab_id": Private.lab_id}, function(error, result) {
      if (!error) {
        callback(null, true);
      } else {
        callback(new Error("Lab insert failed"), null);
      }
    });
  };

  self.load = function(callback) {
    database.findOne('labs', {"lab_id": Private.lab_id}, function(d_error, result) {
      if (result) {

        Private = result;

        callback(null, true);
      } else if (d_error) {
        callback(d_error, null);
      } else {
        callback(new Error("Lab does not exist"), null);
      }
    });
  };

  self.save = function(callback) {
    database.update('labs', {"lab_id": Private.lab_id}, Private, false, function(d_error, result) {
      if (!d_error) {
        callback(null, true);
      } else {
        callback(d_error, null);
      }
    });
  };

  self.delete = function(callback) {
    database.remove('labs', {"lab_id": Private.lab_id}, function(error, result) {
      if (!error) {
                Private = null;
        callback(null, true);
      } else {
        callback(new Error("Lab delete failed"), null);
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
        } else if (Private.users_readonly.indexOf(username) != -1) {
            return true;
        } else {
            for (var i = 0; i < groups.length; i++) {
                if (Private.groups_readonly.indexOf(group[i]) != -1) {
                    return true;
                }
            }
            return false;
        }
    };

    self.start_lab = function(callback) {
        database.insert('allocated_labs', {lab_id: Private.lab_id}, function(i_error, result) {
            if (!i_error) {
                callback(null, true);
            } else {
                if (i_error.name === "MongoError" && i_error.code === 11000) {
                    callback(new Error("Lab is already started"), null);
                } else {
                    callback(i_error, null);
                }
            }
        });
    };

    self.stop_lab = function(callback) {
        database.remove('allocated_labs', {lab_id: Private.lab_id}, function(error, result) {
            if (!error) {
                callback(null, true);
            } else {
                callback(new Error("Lab deallocation failed"), null);
            }
        });
    };

  self.get_lab_id = function() {
    return Private.lab_id;
  };

  self.get_lab_name = function() {
    return Private.lab_name;
  };

  self.set_lab_name = function(name) {
        if (Private.lab_name === null) {
        Private.lab_name = sanitize.simple_text(name);
        }
  };

  self.get_owner = function() {
    return Private.owner;
  };

  self.set_owner = function(owner) {
    Private.owner = sanitize.simple_string(owner);
  };

  self.add_device = function(server, uuid) {
        if (Private.current_servers.indexOf(server) == -1) {
            Private.current_servers.push(server);
        }
    Private.current_devices.push(uuid);
  };

    self.device_in_lab = function(uuid) {
        if (Private.current_devices.indexOf(uuid) != -1) {
            return true;
        } else {
            return false;
        }
    };

  self.get_devices = function() {
    return Private.current_devices.slice();
  };

    self.get_servers = function() {
        return Private.current_servers.slice();
    };

    self.allocate_interface_group = function(callback) {

        if (Private.interface_group !== null) {
            callback(new Error("Already have an interface group"), null);
            return;
        }
        // Verify we have servers to allocate on
        if (Private.current_servers.length === 0) {
            callback(new Error("No servers"), null);
            return;
        }

        // Get an approximate initial interface group number by counting the number of existing allocations
        database.find("interfaces", {"interface_name": /^lpif[0-9]+$/}, {}, function(d_error, results) {
            // Get an actually available group id and use it
            allocate_group_id(results.length + 1, function(a_error, group_id) {
                if (!a_error){
                    // Allocate the group id on all servers
                    allocate_group(0, group_id, function(c_error, result) {
                        if (!c_error) {
                            // Now save this data in the lab
                            Private.interface_group = group_id;
                            self.save(function(s_error, status) {
                                if (!s_error) {
                                    callback(null, group_id);
                                } else {
                                    callback(s_error, null);
                                }
                            });
                        } else {
                            callback(c_error, null);
                        }
                    });
                } else {
                    callback(a_error, null);
                }
            });
        });
    };

    self.deallocate_interface_group = function(callback) {
        if (Private.interface_group !== null) {
            deallocate_group(0, Private.interface_group, function(s_error, result) {
                if (!s_error) {
                    database.remove('interfaces', {"interface_name": "lpif" + Private.interface_group}, function(error, result) {
                        if (!error) {
                            callback(null, true);
                        } else {
                            callback(new Error("Interface group deallocation failed"), null);
                        }
                    });
                } else {
                    callback(s_error, null);
                }
            });
        }
    };

    self.interface_group_status = function(callback) {
        if (Private.interface_group === null) {
            callback(null, false);
            return;
        }
        check_group(0, Private.interface_group, function(error, status) {
            if (!error) {
                callback(null, status);
            } else {
                callback(error, null);
            }
        });
    };

    self.get_interface = function(callback) {
        if (Private.interface_group === null) {
            callback(new Error("An interface group must be allocated first"), false);
            return;
        }

        interface_util.allocate_interface("lpif" + Private.interface_group, function(error, interface_name) {
            if (!error) {
                callback(null, interface_name);
            } else {
                callback(error, null);
            }
        });
        
    };

    self.remove_interface = function(interface_name, callback) {
        var interface_match = new RegExp("^lpif" + Private.interface_group + "\.[0-9]+$");

        if (interface_match.test(interface_name)) {
            interface_util.deallocate_interface(interface_name, function(error, result){
                if (!error) {
                    callback(null, result);
                } else {
                    callback(errir, null);
                }
            });
        } else {
            callback(new Error("Invalid interface"), null);
        }
    };


    self.create_state = function(state_name, description, callback) {
        database.insert('states', {"state_name": state_name, "description": description, "devices": [], "connections": [], "servers": []}, function(error, result) {
      if (!error) {
        callback(null, true);
      } else {
        callback(new Error("Lab state insert failed"), null);
      }
    });
    };

    self.remove_state = function(state_name, callback) {
        database.remove('states', {"state_name": state_name}, function(error, result) {
      if (!error) {
        callback(null, true);
      } else {
        callback(new Error("Lab state delete failed"), null);
      }
    });
    };

    self.revert_state = function(state_name, callback) {
        database.findOne('states', {"state_name": state_name}, function(d_error, result) {
      if (result) {

        Private.current_state = state_name;
                Private.current_devices = result.devices;
                Private.current_connections = result.connections;
                Private.current_servers = result.servers;

        callback(null, true);
      } else if (d_error) {
        callback(d_error, null);
      } else {
        callback(new Error("Lab state does not exist"), null);
      }
    });
    };

    

    // Attempt to allocate a group id
    function allocate_group_id(id, callback) {
        if ( id > 99999 ) {
            callback(new Error("No interface groups available"), null);
        } else {
            database.insert('interfaces', {"interface_name":  "lpif" + id}, function(i_error, result) {
                if (!i_error) {
                    callback(null, id);
                } else {
                    if (i_error.name === "MongoError" && i_error.code === 11000) {
                        allocate_group_id(id + 1, callback);
                    } else {
                        callback(i_error, null);
                    }
                }
            });
        }
    }

    function allocate_group(pos, group_id, callback) {
        if (pos >= Private.current_servers.length) {
            callback(null, true);
        } else {
            server_client.call(Private.current_servers[pos], "allocate_interface_group", {group_num: group_id}, function(s_error, result) {
                if (!s_error) {
                    allocate_group(pos+1, group_id, callback);
                } else {
                    console.log("error", s_error);
                    callback(s_error, null);
                }
            });
        }
    }

    function deallocate_group(pos, group_id, callback) {
        if (pos >= Private.current_servers.length) {
            callback(null, true);
        } else {
            server_client.call(Private.current_servers[pos], "deallocate_interface_group", {group_num: group_id}, function(s_error, result) {
                if (!s_error) {
                    deallocate_group(pos+1, group_id, callback);
                } else {
                    console.log("error", s_error);
                    callback(s_error, null);
                }
            });
        }
    }

    function check_group(pos, group_id, callback) {
        if (pos >= Private.current_servers.length) {
            callback(null, true);
        } else {
            server_client.call(Private.current_servers[pos], "interface_exists", {interface: "lpif" + group_id}, function(s_error, result) {
                if (!s_error) {
                    if (result === true) {
                        deallocate_group(pos+1, group_id, callback);
                    } else {
                        callback(null, false);
                    }
                } else {
                    console.log("error", s_error);
                    callback(s_error, null);
                }
            });
        }
    }

}
