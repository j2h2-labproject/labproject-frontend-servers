var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";
var foreach = require(LABPROJECT_LIB + "/common/loop").foreach;

var server_manager = require(LABPROJECT_LIB + "/managers/vm_server_manager");
var permissions_manager = require(LABPROJECT_BASE + '/lib/managers/permissions_manager');
var helper = require(LABPROJECT_BASE + '/lib/util/controller_helpers');
var sanitize = require(LABPROJECT_LIB + '/common/sanitize');

module.exports = {
    initialize: function(new_client) {
        server_manager.initialize(new_client);
    },
    list_servers: function(session_id, callback) {

        session_id = sanitize.simple_string(session_id);

        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {
            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            if (permissions.can_admin_servers() || permissions.is_superuser()) {
                server_manager.list_servers(function(error, result) {
                    callback(error, result);
                });
            } else {
                callback(new Error("Permission denied"), null);
            }

        });
    },
    get_server_status: function(session_id, server, callback) {

        session_id = sanitize.simple_string(session_id);
        server = sanitize.simple_string(server);

        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {

            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            if (permissions.can_admin_servers() || permissions.is_superuser()) {
                server_manager.get_server(server, function(g_error, server_obj) {
                    if (g_error) {
                        callback(g_error, null);
                        return;
                    }
                    server_obj.get_status(function(s_error, status) {
                        if (s_error) {
                            callback(s_error, null);
                            return;
                        }
                        
                        callback(null, status);
                    });
                });
            } else {
                callback(new Error("Permission denied"), null);
            }

        });
    },
    get_server_info: function(session_id, server, callback) {

        session_id = sanitize.simple_string(session_id);
        server = sanitize.simple_string(server);

        helper.get_user_data(session_id, function(d_error, user, groups, permissions, session) {

            if (d_error) {
                callback(new Error("Invalid session"), null);
                return;
            }

            if (permissions.can_admin_servers() || permissions.is_superuser()) {
                server_manager.get_server(server, function(g_error, server_obj) {
                    if (g_error) {
                        callback(g_error, null);
                        return;
                    }
                    server_obj.get_info(function(s_error, status) {
                        if (s_error) {
                            callback(s_error, null);
                            return;
                        }
                        
                        callback(null, status);
                    });
                });
            } else {
                callback(new Error("Permission denied"), null);
            }

        });
    },
};
