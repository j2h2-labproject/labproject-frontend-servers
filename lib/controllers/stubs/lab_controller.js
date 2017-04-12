var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var common_crypto = require(LABPROJECT_LIB + '/common/crypto');
var stub_util = require("./stub_util")

var LAB_DATA = require("./data/lab_info");

module.exports = function(server_client) {
    var self = this;
    self.get_recent_labs = function(session_id, callback) {

        var lab_list = [];

        for (item in LAB_DATA) {
            console.log();
            lab_list.push({"name": LAB_DATA[item].name, "owner": LAB_DATA[item].owner, "lab_id": item})
        }
        callback(null, lab_list);
    };
    self.get_all_labs = function(session_id, callback) {
        callback(null, LAB_LIST);
    };
    self.create_lab = function(session_id, lab_name, callback) {
       
    };
    self.open_lab = function(session_id, lab_id, callback) {
        if (LAB_DATA.hasOwnProperty(lab_id)) {
            callback(null, LAB_DATA[lab_id]);
        } else {
            callback(new Error("Lab does not exist"), null);
        }
    }
    return self;
};
