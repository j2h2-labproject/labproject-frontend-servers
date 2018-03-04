/*
ISO Manager - Manages ISO objects

ISOs (CD images for OS installations) are stored in a directory indicated in the config.
Metadata about the image is stored in the database.
*/
var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');
var common_crypto = require(LABPROJECT_LIB + '/common/crypto');
var database = require(LABPROJECT_LIB + '/util/database');

var vm_server_client = null;

module.exports = {
    // Setup the module with the vm_clients
    initialize: function(new_client) {
        vm_server_client = new_client;
    },
    // List all ISOs available 
    list_available_isos: function(callback) {
        database.find('isos', {}, {}, function(d_error, lab_list) {
            if (!d_error) {
                callback(null, lab_list);
            } else {
                callback(d_error, null);
            }
        });
    },
    // Create a new iso
    new_iso: function(iso_id, callback) {
        if (vm_server_client === null) {
            callback(new Error("initialize function must be run first"), null);
            return;
        }

        iso_id = sanitize.simple_string(iso_id);
        var return_iso = new iso(iso_id, vm_server_client);
        return_iso.init(function(i_error, status) {
            if (!i_error && status === true) {
                return_iso.save(function(s_error, result) {
                    if (!s_error) {
                        callback(null, return_iso);
                    } else {
                        callback(s_error, null);
                    }
                });
            } else {
                if (i_error.name === "MongoError" && i_error.code === 11000) {
                    callback(new Error("An ISO of that name already exists"), null);
                } else {
                    callback(i_error, null);
                }
            }
        });
    },
    // Get a iso object
    get_iso: function(iso_id, callback) {
        if (vm_server_client === null) {
            callback(new Error("initialize function must be run first"), null);
            return;
        }

        var return_iso = new iso(iso_id, vm_server_client);
        return_iso.load(function(error, result) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, return_iso);
            }
        });
    },
    // Remove a lab object
    delete_iso: function(iso_id, callback) {
        var remove_iso = new iso(iso_id, vm_server_client);
        remove_iso.delete(function(error, result) {
            callback(error, result);
        });
    }
};

// ISO object
function iso(iso_id, server_client) {
    var self = this;

    var Private = {
        iso_id: iso_id,
        owner: null,
        time_created: Date.now()
    };

    self.init = function(callback) {
        database.insert('isos', {"iso_id": Private.iso_id}, function(error, result) {
            if (!error) {
                callback(null, true);
            } else {
                callback(new Error("ISO insert failed"), null);
            }
        });
    };

    self.load = function(callback) {
        database.findOne('isos', {"iso_id": Private.iso_id}, function(d_error, result) {
            if (result) {
                Private = result;
                callback(null, true);
            } else if (d_error) {
                callback(d_error, null);
            } else {
                callback(new Error("ISO does not exist"), null);
            }
        });
    };

    self.save = function(callback) {
        database.update('isos', {"iso_id": Private.iso_id}, Private, false, function(d_error, result) {
        if (!d_error) {
            callback(null, true);
        } else {
            callback(d_error, null);
        }
        });
    };

    self.delete = function(callback) {
        database.remove('isos', {"iso_id": Private.iso_id}, function(error, result) {
            if (!error) {
                Private = null;
                callback(null, true);
            } else {
                callback(new Error("ISO delete failed"), null);
            }
        });
    };

    // Download the ISO to the server
    self.download_http = function(vm_server, url, callback) {
        server_client.call(vm_server, "download_http", {"url": url, "filename": Private.iso_id}, function(s_error, result) {
            if (!s_error) {
                callback(null, result);
            } else {
                callback(s_error, null);
            }
        });
    };

    // Check if the ISO exists on the server
    self.exists_on_server = function(vm_server, callback) {
        server_client.call(vm_server, "list_isos", {}, function(s_error, iso_list) {
            if (!s_error) {
                callback(null, iso_list.indexOf(Private.iso_id) != -1);
            } else {
                callback(s_error, null);
            }
        });
    }

    // Check if the ISO exists on the server
    self.delete_on_server = function(vm_server, callback) {
        server_client.call(vm_server, "delete_iso", {"filename": Private.iso_id}, function(s_error, status) {
            if (!s_error) {
                callback(null, status);
            } else {
                callback(s_error, null);
            }
        });
    }

    self.get_full_path = function(vm_server, callback) {
        server_client.call(vm_server, "iso_full_path", {"filename": Private.iso_id}, function(s_error, full_path) {
            if (!s_error) {
                callback(null, full_path);
            } else {
                callback(s_error, null);
            }
        });
    }

    self.get_iso_id = function() {
        return Private.iso_id;
    };

    self.get_owner = function() {
        return Private.owner;
    };

    self.set_owner = function(owner) {
        Private.owner = owner;
    };
}
