var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');
var database = require(LABPROJECT_LIB + '/util/database');

module.exports = {
    allocate_interface: function(prefix, callback) {
        prefix = sanitize.simple_string(prefix);
        var interface_match = new RegExp("^" + prefix + "\.[0-9]+$");

        database.find("interfaces", {"interface_name": interface_match}, {}, function(d_error, results) {
            console.log("Found " + results.length);
            interface_alloc_helper(prefix, results.length, function(i_error, interface_name) {
                if (!i_error) {
                    callback(null, interface_name);
                } else {
                    callback(i_error, null);
                }
            });
        });
    },
    deallocate_interface: function(interface, callback) {
        interface = sanitize.simple_string(interface);
        database.remove("interfaces", {"interface_name": interface}, function(d_error, results) {
            if (!d_error) {
                callback(null, true);
            } else {
                callback(d_error, null);
            }
        });
    }
}

function interface_alloc_helper(prefix, last, callback) {
    var interface_name =  prefix + "." + last;
    database.insert('interfaces', {"interface_name": interface_name}, function(i_error, result) {
        if (!i_error) {
            callback(null, interface_name);
        } else {
            if (i_error.name === "MongoError" && i_error.code === 11000) {
                interface_alloc_helper(last + 1, callback);
            } else {
                callback(i_error, null);
            }
        }
    });
}