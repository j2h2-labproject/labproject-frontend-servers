var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var config = require(LABPROJECT_BASE + "/config");
var foreach = require(LABPROJECT_LIB + "/common/loop").foreach;

var vm_server_client = null;

const MAINT_SWITCH = "maintenance";
const EXTERNAL_SWITCH = "external";

function vm_server(name, server_client) {
    if (!name||!server_client) {
        console.log("Failed to create vm_server");
        return;
    }

    var self = this;
    var Private = {
        name: name,
        server_client: server_client,
        host: null,
        port: null
    };

    self.name = function() {
        return Private.name;
    };

    self.watch_pulse = function(on_pulse) {
        Private.server_client.on_event("server_pulse." + name, function(data){
            console.log(data);
            on_pulse(null, data);
        });
    };

    self.load = function(callback) {
        for (var i = 0; i < config.vm_servers.hosts.length; i++) {
            var current = config.vm_servers.hosts[i];

            if (current.name == Private.name) {
                Private.host = current.host;
                Private.port = current.port;
                callback(null, true);
                return;
            }
        }
        callback(new Error("VM server does not exist"), null);
    };

    self.get_status = function(callback) {
        Private.server_client.call(Private.name, "usage", {}, function(s_error, result) {
            if (!s_error) {
                callback(null, result);
            } else {
                console.log("error", s_error);
                callback(s_error, null);
            }
        });
    };

    self.get_info = function(callback) {
        Private.server_client.call(Private.name, "systeminfo", {}, function(s_error, result) {
            if (!s_error) {
                callback(null, result);
            } else {
                console.log("error", s_error);
                callback(s_error, null);
            }
        });
    };

    self.get_debugdump = function(callback) {
        Private.server_client.call(Private.name, "debugdump", {}, function(s_error, result) {
            if (!s_error) {
                callback(null, result);
            } else {
                callback(s_error, null);
            }
        });
    };

    // Verify the 'external' switch
    self.verify_external = function(callback) {
        // Verify the external switch
        Private.server_client.call(Private.name, "switch_exists", {switch_id: EXTERNAL_SWITCH}, function(s_error, result) {
            if (!s_error) {
                callback(null, result);
            } else {
                console.log("error", s_error);
                callback(s_error, null);
            }
        });
    }

    // Verify the maintenance switch
    self.verify_maintenance = function(callback) {
        Private.server_client.call(Private.name, "switch_exists", { switch_id: MAINT_SWITCH }, function(s_error, result) {
            if (!s_error) {
                callback(null, result);
            } else {
                console.log("error", s_error);
                callback(s_error, null);
            }
        });
    };

    self.allocate_maint_interface = function(callback){
        Private.server_client.call(Private.name, "allocate_maint_interface", {}, function(s_error, result) {
            if (!s_error) {
                callback(null, result);
            } else {
                console.log("error", s_error);
                callback(s_error, null);
            }
        });
    };
        
    // Start/restart the maintenance network on the VM server
    self.reboot_maintenance_network = function(callback) {

        

        Private.server_client.call(Private.name, "switch_exists", {switch_id: maintenance_switch_name}, function(s_error, result) {
            if (!s_error) {

                var port_function = function() {
                    var ports = ['m-to-e0', 'e-to-m0'];
                    foreach(ports,
                    function(loc, port_name, pass_data, next) {
                        Private.server_client.call(Private.name, "interface_exists", {interface: port_name}, function(p_error, result) {
                            if (!p_error) {
                                if (result === false) {
                                    Private.server_client.call(Private.name, "create_tap_interface", {interface: port_name}, function(p_error, result) {
                                        next(null, true);
                                    });
                                } else {
                                    next(null, true);
                                }
                            } else {
                                next(new Error("Error getting port status"), null);
                            }
                        });
                    },
                    function(error, result) {

                        Private.server_client.call(Private.name, "connect_port", {switch_id: maintenance_switch_name, ports: [ports[0]]}, function(p_error, result) {
                            if (!p_error) {
                                Private.server_client.call(Private.name, "connect_port", {switch_id: "external", ports: [ports[1]]}, function(p_error, result) {
                                    if (!p_error) {
                                        Private.server_client.call(Private.name, "patch_ports", {peer1_port: ports[0], peer2_port: ports[1]}, function(p_error, result) {
                                            if (!p_error) {
                                                callback(null, true);
                                            } else {
                                                callback(p_error, null);
                                            }
                                        });
                                    } else {
                                        callback(p_error, null);
                                    }
                                });
                            } else {
                                callback(p_error, null);
                            }
                        });
                    });
                };

                if (result === false) {
                    Private.server_client.call(Private.name, "create_switch", {switch_id: maintenance_switch_name}, function(p_error, result) {
                        if (!p_error) {
                            port_function();
                        } else {
                            callback(p_error, null);
                        }
                    });
                } else {
                    port_function();
                }
            } else {
                console.log("error", s_error);
                callback(s_error, null);
            }
        });
    }

}

module.exports = {
    // Initilize the vm server client, must be called before any other method here
    initialize: function(new_client) {
        vm_server_client = new_client;
    },
    // List all vm servers
    list_servers: function(callback) {
        var server_list = [];

        if (config.vm_servers.hosts == undefined) {
            callback(new Error("No VM servers configured"), null);
            return;
        }

        for (var i = 0; i < config.vm_servers.hosts.length; i++) {
            var current = config.vm_servers.hosts[i];
            server_list.push(current.name);
        }

        callback(null, server_list);

    },
    // Get a server object
    get_server: function(name, callback) {
        var return_server = new vm_server(name, vm_server_client);

        return_server.load(function(error, status) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, return_server);
            }
        });
    },
    get_transport: function(callback) {
        var transport_name = config.vm_servers.name;
    }
};