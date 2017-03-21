var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var common_crypto = require(LABPROJECT_LIB + '/common/crypto');

module.exports = {
    initialize: function(new_client) {
        
    },
    get_recent_labs: function(session_id, callback) {
        callback(null, [
            {"name": "Recent Lab1", "owner": "admin", "running": true},
            {"name": "Recent Lab2", "owner": "person", "running": false},
            {"name": "Recent Lab3", "owner": "person", "running": true}
        ]);
    },
    get_all_labs: function(session_id, callback) {
        callback(null, [
            {"name": "lab1", "owner": "admin"},
            {"name": "Lab 2", "owner": "person"},
            {"name": "Cool Lab", "owner": "person"},
        ]);
    },
    create_lab: function(session_id, lab_name, callback) {
       
    },
};
