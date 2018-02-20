/*

permissions_manager.js

This controls data for global permission per user. Permissions related to specific labs and 
VMs are stored with those objects.

*/
var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');
var database = require(LABPROJECT_LIB + '/util/database');

module.exports = {
    new_permissions: function(username, callback) {
        username = sanitize.simple_string(username);
        var new_permissions_obj = new permissions(username);

        new_permissions_obj.init(function(i_error, i_status) {
            if (!i_error) {
                new_permissions_obj.save(function(s_error, status) {
                    callback(s_error, new_permissions_obj);
                });
            } else {
                callback(i_error, null);
            }
        });
    },
    get_permissions: function(username, callback) {
        username = sanitize.simple_string(username);
        var return_permissions_obj = new permissions(username);
        return_permissions_obj.load(function(error, status) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, return_permissions_obj);
            }
        });
    },
    delete_permissions: function(username, callback) {
        username = sanitize.simple_string(username);
        var delete_permissions = new permissions(username);
        delete_permissions.delete(function(error, result) {
            callback(error, result);
        });
    }
}

function permissions(username) {
    var self = this;

    var Private = {
        username: username,
        superuser: false,
        create_groups: false,
        create_labs: false,
        create_vms: false,
        use_vms: false,
        admin_users: false,
        admin_groups: false,
        admin_servers: false,
        admin_vms: false
    }

    self.init = function(callback) {
        database.insert('permissions', {"username": Private.username}, function(error, result) {
            if (!error) {
                callback(null, true);
            } else {
                callback(new Error("Permissions insert failed"), null);
            }
        });
    }

    self.load = function(callback) {
        database.findOne('permissions', {"username": Private.username}, function(d_error, result) {
            if (result) {

                Private = result;

                callback(null, true);
            } else if (d_error) {
                callback(d_error, null);
            } else {
                callback(new Error("Permissions for user does not exist"), null);
            }
        });
    };

    self.save = function(callback) {
        database.update('permissions', {"username": Private.username}, Private, false, function(d_error, result) {
            if (!d_error) {
                callback(null, true);
            } else {
                callback(d_error, null);
            }
        });
    };

    self.delete = function(callback) {
        database.remove('permissions', {"username": Private.username}, function(error, result) {
            if (!error) {
                callback(null, true);
            } else {
                callback(new Error("Permissions delete failed"), null);
            }
        });
    }

    self.list_permissions = function() {
        data = {};
        for (item in Private) {
            if (item != 'username' && item != "_id") {
                data[item] = Private[item];
            }
        }
        return data;
    };

    self.is_superuser = function() {
        return Private.superuser;
    }

    self.set_superuser_status = function(value) {
        if (value === true || value === false) {
           Private.superuser = value;
        }
    };

    self.can_create_groups = function() {
        return Private.create_groups;
    };

    self.set_can_create_groups = function(value) {
        if (value === true || value === false) {
           Private.create_groups = value;
        }
    };

    self.can_create_labs = function() {
        return Private.create_labs;
    };

    self.set_can_create_labs = function(value) {
        if (value === true || value === false) {
           Private.create_labs = value;
        }
    };

    self.can_create_vms = function() {
        return Private.create_vms;
    };

    self.set_can_create_vms = function(value) {
        if (value === true || value === false) {
           Private.create_vms = value;
        }
    };

    self.can_use_vms = function() {
        return Private.use_vms;
    };

    self.set_can_use_vms = function(value) {
        if (value === true || value === false) {
           Private.use_vms = value;
        }
    };

    self.can_admin_users = function() {
        return Private.admin_users;
    };

    self.set_can_admin_users = function(value) {
        if (value === true || value === false) {
           Private.admin_users = value;
        }
    };

    self.can_admin_groups = function() {
        return Private.admin_groups;
    };

    self.set_can_admin_groups = function(value) {
        if (value === true || value === false) {
           Private.admin_groups = value;
        }
    };

    self.can_admin_servers = function() {
        return Private.admin_servers;
    };

    self.set_can_admin_servers = function(value) {
        if (value === true || value === false) {
           Private.admin_servers = value;
        }
    };

    self.can_admin_vms = function() {
        return Private.admin_vms;
    };

    self.set_can_admin_vms = function(value) {
        if (value === true || value === false) {
           Private.admin_vms = value;
        }
    };


}
