var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";
var foreach = require(LABPROJECT_LIB + "/common/loop").foreach;

var iso_manager = require(LABPROJECT_LIB + "/managers/iso_manager");
var helper = require(LABPROJECT_BASE + '/lib/util/controller_helpers');
var sanitize = require(LABPROJECT_LIB + '/common/sanitize');
var config = require(LABPROJECT_BASE + "/config");

module.exports = function(server_client, logger) {

    if (server_client === undefined || logger === undefined) {
        console.log("iso_contoller initialization failed");
        return null;
    }

    var self = this;
    iso_manager.initialize(server_client);

    self.list_isos = function(session_id, callback) {

        session_id = sanitize.simple_string(session_id);

        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {
            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            if (permissions.can_create_vms() || permissions.is_superuser()) {
                iso_manager.list_isos(function(error, result) {
                    callback(error, result);
                });
            } else {
                callback(new Error("Permission denied"), null);
            }

        });
    };
    self.create_iso = function(session_id, iso_id, iso_url, callback) {

        session_id = sanitize.simple_string(session_id);
        iso_id = sanitize.simple_string(iso_id);
        iso_url = sanitize.url(iso_url);

        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {

            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            if (permissions.can_create_vms() || permissions.is_superuser()) {

                iso_manager.new_iso(iso_id, function(n_error, iso_obj) {
                    if (n_error) {
                        callback(n_error, null);
                        return;
                    }
                    // Add iso to each server
                    // This a pretty long way of going about things. Probably should
                    // downoad once and distribute instead of having each server do it
                    foreach(config.vm_servers.hosts, 
                    function(loc, server_item, result, next) {
                        var server_name = server_item.name;
                        iso_obj.download_http(server_name, iso_url, function(dl_error, result) {
                            if (dl_error) {
                                result[server_name] = dl_error;
                            } else {
                                result[server_name] = true;
                            }
                            next(null, result);
                        });
                    },
                    // When done
                    function(error, result) {
                        if (error) {
                            callback(error, null);
                            return;
                        }
                        iso_obj.set_owner(user);
                        iso_obj.save(function(s_error, save_res) {
                            if (!s_error) {
                                callback(null, result);
                            } else {
                                callback(s_error, null);
                            }
                        });
                    });
                });
            } else {
                callback(new Error("Permission denied"), null);
            }

        });
    };
    self.delete_iso = function(session_id, iso_id, callback) {

        session_id = sanitize.simple_string(session_id);
        iso_id = sanitize.simple_string(iso_id);

        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {
            
            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            iso_manager.get_iso(iso_id, function(g_error, iso_obj) { 
                if (g_error) {
                    callback(g_error, null);
                    return;
                }
                var owner = iso_obj.get_owner();
                // Delete if only user is owner or superuser
                if (user == owner || permissions.is_superuser()) {
                    // Delete on each server
                    foreach(config.vm_servers.hosts, 
                        function(loc, server_item, result, next) {
                            var server_name = server_item.name;
                            console.log("Deleting on server");
                            iso_obj.delete_on_server(server_name, function(d_error, result) {
                                console.log("Deleted on server " + server_name);
                                if (d_error) {
                                    result[server_name] = d_error;
                                } else {
                                    result[server_name] = true;
                                }
                                next(null, result);
                            });
                        },
                        function(error, result) {
                            if (error) {
                                callback(error, null);
                                return;
                            } else {
                                console.log(result);
                                console.log("Deleted ISO from database");
                                // Delete the iso from the database
                                iso_manager.delete_iso(iso_id, function(d_error, del_res) {
                                    if (!d_error) {
                                        callback(null, result);
                                    } else {
                                        callback(d_error, null);
                                    }
                                });
                            }
                        });
                } else {
                    callback(new Error("Permission denied"), null);
                }
            });
        });
    };

    return self;
};
