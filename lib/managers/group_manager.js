var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

module.exports = {
	new_groups: function(username, callback) {

	},
	get_permissions: function(username, callback) {

	},
	remove_permissions: function(username, callback) {

	}
};

function group(groupname) {
	var self = this;

	var Private = {
		groupname: groupname,
		admins: [],
    members: []
	};

}
