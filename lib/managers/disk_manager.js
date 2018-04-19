/*
Disk Manager - Manages Virtual Disk objects

VM disks are stored in a directory indicated in the config.
Metadata about the disk is stored in the database.
*/
var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');
var common_crypto = require(LABPROJECT_LIB + '/common/crypto');
var database = require(LABPROJECT_LIB + '/util/database');

var vm_server_client = null;

const UNKNOWN_FORMAT = "unknown";

module.exports = {
    // Setup the module with the vm_clients
    initialize: function(new_client) {
        vm_server_client = new_client;
    },
    // List all drives owned by user 
    list_disks: function(user, callback) {
        database.find('disks', {"owner": user}, {}, function(d_error, lab_list) {
            if (!d_error) {
                callback(null, lab_list);
            } else {
                callback(d_error, null);
            }
        });
    },
    // Create a new disk
    new_disk: function(disk_id, format, vm_server, init_size, callback) {
        if (vm_server_client === null) {
            callback(new Error("initialize function must be run first"), null);
            return;
        }

        disk_id = sanitize.simple_string(disk_id);
        var return_disk = new disk(disk_id, vm_server_client);

        return_disk.init(function(i_error, status) {
            if (!i_error && status === true) {

                return_disk.set_format(format);
                return_disk.set_vm_server(vm_server);
                return_disk.set_size(init_size);

                return_disk.save(function(s_error, result) {
                    if (!s_error) {
                        callback(null, return_disk);
                    } else {
                        callback(s_error, null);
                    }
                });
            } else {
                if (i_error.name === "MongoError" && i_error.code === 11000) {
                    callback(new Error("A disk of that name already exists"), null);
                } else {
                    callback(i_error, null);
                }
            }
        });
    },
    // Get a disk object
    get_disk: function(disk_id, callback) {
        if (vm_server_client === null) {
            callback(new Error("initialize function must be run first"), null);
            return;
        }

        var return_disk = new disk(disk_id, vm_server_client);
        return_disk.load(function(error, result) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, return_disk);
            }
        });
    },
    // Remove a disk object
    delete_disk: function(disk_id, callback) {
        var remove_disk = new disk(disk_id, vm_server_client);
        remove_disk.delete(function(error, result) {
            callback(error, result);
        });
    }
};

// Disk object
function disk(disk_id, server_client) {
    var self = this;

    // TODO ensure format type

    var Private = {
        disk_id: disk_id,
        owner: null,
        vm_server: null,
        time_created: Date.now(),
        size: 0,
        format: UNKNOWN_FORMAT,
        path: ""
    };

    // diskname is disk_id
    self.get_diskname = function(){
        return Private.disk_id;
    };

    self.init = function(callback) {
        database.insert('disks', {"disk_id": Private.disk_id}, function(error, result) {
            if (!error) {
                callback(null, true);
            } else {
                callback(new Error("Disk insert failed"), null);
            }
        });
    };

    self.load = function(callback) {
        database.findOne('disks', {"disk_id": Private.disk_id}, function(d_error, result) {
            if (result) {
                Private = result;
                callback(null, true);
            } else if (d_error) {
                callback(d_error, null);
            } else {
                callback(new Error("Disk does not exist"), null);
            }
        });
    };

    self.save = function(callback) {
        database.update('disks', {"disk_id": Private.disk_id}, Private, false, function(d_error, result) {
        if (!d_error) {
            callback(null, true);
        } else {
            callback(d_error, null);
        }
        });
    };

    self.delete = function(callback) {
        database.remove('disks', {"disk_id": Private.disk_id}, function(error, result) {
            if (!error) {
                Private = null;
                callback(null, true);
            } else {
                callback(new Error("Disk delete failed"), null);
            }
        });
    };

    // Create disk on a server
    self.define_disk = function(callback) {

        var call_data = { 
            "diskname": self.get_diskname(), 
            "size": Private.size, 
            "format": Private.format
        };

        server_client.call(Private.vm_server, "create_disk", call_data, function(s_error, full_path) {
            if (!s_error) {
                Private.path = full_path;
                callback(null, full_path);
            } else {
                callback(s_error, null);
            }
        });
    };

    self.resize_disk = function(new_size, callback) {
        if (new_size < Private.size) {
            callback(new Error("Cannot resize to a size smaller than the current size"), null);
            return;
        }
    };

    // Remove disk from server
    self.undefine_disk = function(callback) {
        server_client.call(Private.vm_server, "remove_disk", {"diskname": self.get_diskname()}, function(s_error, result) {
            if (!s_error) {
                callback(null, result);
            } else {
                callback(s_error, null);
            }
        });
    };

    // Check if the disk exists on the server
    self.exists_on_server = function(callback) {
        server_client.call(Private.vm_server, "disk_exists", {"diskname": self.get_diskname()}, function(s_error, status) {
            if (!s_error) {
                callback(null, status);
            } else {
                callback(s_error, null);
            }
        });
    };

    self.get_full_path = function(callback) {
        server_client.call(Private.vm_server, "disk_full_path", {"filename": self.get_diskname()}, function(s_error, full_path) {
            if (!s_error) {
                callback(null, full_path);
            } else {
                callback(s_error, null);
            }
        });
    };

    self.get_disk_info = function() {
        server_client.call(Private.vm_server, "disk_info", {"filename": self.get_diskname()}, function(s_error, data) {
            if (!s_error) {
                callback(null, data);
            } else {
                callback(s_error, null);
            }
        });
    };

    self.get_disk_id = function() {
        return Private.disk_id;
    };

    self.get_owner = function() {
        return Private.owner;
    };

    self.set_owner = function(owner) {
        Private.owner = owner;
    };

    self.set_size = function(size) {
        // Only allow the size to be initialized
        if (Private.size == 0) {
            Private.size = size;
        }
    };

    self.get_size = function() {
        return Private.size;
    };

    self.set_vm_server = function(vm_server) {
        // Only allow the VM server to be initialized
        if (Private.vm_server === null) {
            Private.vm_server = vm_server;
        }
    };

    self.get_vm_server = function() {
        return Private.vm_server;
    };

    self.set_format = function(format) {
        // Only allow the format to be initialized
        if (Private.format == UNKNOWN_FORMAT) {
            Private.format = format;
        }
    };

    self.get_format = function() {
        return Private.format;
    };

    self.get_path = function() {
        return Private.path;
    };
}
