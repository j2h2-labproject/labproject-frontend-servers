var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var common_crypto = require(LABPROJECT_LIB + '/common/crypto');

var LAB_LIST = [
                {"name": "Recent Lab1", "owner": "admin", "running": true, "lab_id": "admin_test_lab_1"},
                {"name": "Recent Lab2", "owner": "person", "running": false, "lab_id": "admin_test_lab_2"},
                {"name": "Recent Lab3", "owner": "person", "running": true, "lab_id": "admin_test_lab_2"}
            ];

module.exports = function(server_client) {
    var self = this;
    self.get_recent_labs = function(session_id, callback) {
        callback(null, LAB_LIST);
    };
    self.get_all_labs = function(session_id, callback) {
        callback(null, LAB_LIST);
    };
    self.create_lab = function(session_id, lab_name, callback) {
       
    };
    return self;
};
