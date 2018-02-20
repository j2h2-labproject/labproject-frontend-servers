var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

// Require all managers
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');
var group_manager = require(LABPROJECT_BASE + '/lib/managers/group_manager');
var permissions_manager = require(LABPROJECT_BASE + '/lib/managers/permissions_manager');
var helper =  require(LABPROJECT_BASE + '/lib/util/controller_helpers');

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');

var vm_client = null;

module.exports = {
    initialize: function(new_client) {

    },
    // Get info on the user associated with this session_id
    id: function(session_id, callback) {
        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {

            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            var id_data = {
                username: user,
                groups: groups
            };

            callback(null, id_data);

        });

    },
    // List the users in LabProject
    list_users: function(session_id, callback) {
        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {

            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            if (permissions.can_admin_users() || permissions.is_superuser()) {
                user_manager.list_users(function(error, result) {
                    if (!error) {
                        callback(null, result);
                    } else {
                        callback(error, null);
                    }
                });
            } else {
                callback(new Error("Permission denied"), null);
            }

        });
    },
    // Add a user
    add_user: function(session_id, username, password, callback) {
        session_id = sanitize.simple_string(session_id);
        username = sanitize.simple_string(username);
        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {
            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            if (permissions.can_admin_users() || permissions.is_superuser()) {
                // Create the user and the permissions for the user
                user_manager.new_user(username, password, function(error, status){
                    if (!error) {
                        permissions_manager.new_permissions(username, function(p_error, status) {
                            if (!p_error) {
                                callback(null, status);
                            } else {
                                callback(p_error, null);
                            }
                        });
                    } else {
                        callback(error, null);
                    }
                });    
            } else {
                callback(new Error("Permission denied"), null);
            }
        });
    },
    // Remove a user
    remove_user: function(session_id, username, callback) {
        session_id = sanitize.simple_string(session_id);
        username = sanitize.simple_string(username);
        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {
            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            if (permissions.can_admin_users() || permissions.is_superuser()) {
                user_manager.delete_user(username, function(error, status){
                    if (!error) {
                        permissions_manager.delete_permissions(username, function(p_error, status) {
                            if (!p_error) {
                                callback(null, status);
                            } else {
                                callback(p_error, null);
                            }
                        });
                    } else {
                        callback(error, null);
                    }
                });    
            } else {
                callback(new Error("Permission denied"), null);
            }
        });
    },
    // Add a new group, user creating the group is added to the admins
    add_group: function(session_id, groupname, callback) {
        session_id = sanitize.simple_string(session_id);
        groupname = sanitize.simple_string(groupname);
        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {
            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            if (permissions.can_create_groups() || permissions.is_superuser() || permissions.can_admin_groups()) {
                // Create the user and the permissions for the user
                group_manager.new_group(groupname, function(error, group_obj){
                    if (!error) {
                        group_obj.add_admin(user);
                        group_obj.save(function(error, result) {
                            if (!error) {
                                callback(null, true);
                            } else {
                                callback(error, null);
                            }
                        });
                    } else {
                        callback(error, null);
                    }
                });    
            } else {
                callback(new Error("Permission denied"), null);
            }
        });
    },
    // Remove a group and all memberships. You should only be able to remove groups you are admin to (or if you are superuser)
    remove_group: function(session_id, groupname, callback) {
        session_id = sanitize.simple_string(session_id);
        groupname = sanitize.simple_string(groupname);
        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {
            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            group_manager.get_group(groupname, function(error, group_obj){
                if (group_obj.is_admin(user) || permissions.is_superuser() || permissions.can_admin_groups()) {
                    group_obj.delete(function(error, result) {
                        if (!error) {
                            callback(null, result);
                        } else {
                            callback(error, null);
                        }
                    });
                } else {
                    callback(new Error("Permission denied"), null);
                }
            });
        });
    },
    // Add a user to a group
    add_user_to_group: function(session_id, username, groupname, callback) {
        session_id = sanitize.simple_string(session_id);
        username = sanitize.simple_string(username);
        groupname = sanitize.simple_string(groupname);
        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {
            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            group_manager.get_group(groupname, function(error, group_obj){
                if (group_obj.is_admin(user) || permissions.is_superuser() || permissions.can_admin_groups()) {
                    group_obj.add_member(username);
                    group_obj.save(function(error, result) {
                        if (!error) {
                            callback(null, true);
                        } else {
                            callback(error, null);
                        }
                    });
                } else {
                    callback(new Error("Permission denied"), null);
                }
            });
        });
    },
    // Add an admin to a group
    add_admin_to_group: function(session_id, username, groupname, callback) {
        session_id = sanitize.simple_string(session_id);
        username = sanitize.simple_string(username);
        groupname = sanitize.simple_string(groupname);
        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {
            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            group_manager.get_group(groupname, function(error, group_obj){
                if (group_obj.is_admin(user) || permissions.is_superuser() || permissions.can_admin_groups()) {
                    group_obj.add_admin(username);
                    group_obj.save(function(error, result) {
                        if (!error) {
                            callback(null, true);
                        } else {
                            callback(error, null);
                        }
                    });
                } else {
                    callback(new Error("Permission denied"), null);
                }
            });
        });
    },
    // Remove a user from a group
    remove_user_from_group: function(session_id, username, groupname, callback) {

    },
    // Remove an admin from a group
    remove_admin_from_group: function(session_id, username, groupname, callback) {

    }
    
};
