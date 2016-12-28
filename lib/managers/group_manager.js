/*

group_manager.js

The group manager controls data for a group.

*/
var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');
var database = require(LABPROJECT_LIB + '/util/database');

module.exports = {
	new_group: function(groupname, callback) {
		var new_group_obj = new group(groupname);

		new_group_obj.init(function(i_error, i_status) {
			if (!i_error) {

					new_group_obj.save(function(s_error, status) {
						callback(s_error, new_group_obj);
					});

			} else {
				callback(i_error, null);
			}
		});
	},
	get_group: function(groupname, callback) {
		var return_group = new group(groupname);
		return_group.load(function(error, status) {
			if (error) {
				callback(error, null);
			} else {
				callback(null, return_group);
			}
		});
	},
	delete_group: function(groupname, callback) {
		var delete_group = new group(groupname);
		delete_group.delete(function(error, result) {
			callback(error, result);
		});
	},
	get_user_groups: function(username, callback) {
		database.find('groups', { $or: [{'members': username}, {'admins': username}] }, {}, function(d_error, results) {
			if (!d_error) {
				var group_list = [];
				for (var i = 0; i < results.length; i++) {
					group_list.push(results[i].groupname);
				}
				callback(null, group_list);
			} else {
				callback(d_error, null);
			}
		});
	},
	remove_all_membership: function(username, callback) {

	}
};

function group(groupname) {
	var self = this;

	var Private = {
		groupname: groupname,
		admins: [],
    	members: []
	};

	self.init = function(callback) {
		database.insert('groups', {"groupname": Private.groupname}, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {
				callback(new Error("Group insert failed"), null);
			}
		});
	}

	self.load = function(callback) {
		database.findOne('groups', {"groupname": Private.groupname}, function(d_error, result) {
			if (result) {

				Private = result;

				callback(null, true);
			} else if (d_error) {
				callback(d_error, null);
			} else {
				callback(new Error("Group does not exist"), null);
			}
		});
	};

	self.save = function(callback) {
		database.update('groups', {"groupname": Private.groupname}, Private, false, function(d_error, result) {
			if (!d_error) {
				callback(null, true);
			} else {
				callback(d_error, null);
			}
		});
	};

	self.delete = function(callback) {
		database.remove('groups', {"groupname": Private.groupname}, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {
				callback(new Error("Group delete failed"), null);
			}
		});
	}

	self.get_groupname = function() {
		return Private.groupname;
	}

	self.add_admin = function(username) {
		username = sanitize.simple_string(username);
		if (Private.admins.indexOf(username) == -1 && Private.members.indexOf(username) == -1) {
			Private.admins.push(username);
		}
	};

	self.remove_admin = function(username) {
		username = sanitize.simple_string(username);
		var location = Private.admins.indexOf(username);
		if (location != -1) {
			Private.admins.splice(location, 1);
		}
	};

	self.add_member = function(username) {
		username = sanitize.simple_string(username);
		if (Private.members.indexOf(username) == -1 && Private.admins.indexOf(username) == -1) {
			Private.members.push(username);
		}
	};

	self.remove_member = function(username){
		username = sanitize.simple_string(username);
		var location = Private.members.indexOf(username);
		if (location != -1) {
			Private.members.splice(location, 1);
		}
	};

	self.is_member = function(username) {
		username = sanitize.simple_string(username);
		return Private.members.indexOf(username) != -1;
	};

	self.is_admin = function(username) {
		username = sanitize.simple_string(username);
		return Private.admins.indexOf(username) != -1;
	};

	self.in_group = function(username) {
		username = sanitize.simple_string(username);
		return (Private.members.indexOf(username) != -1 || Private.admins.indexOf(username) != -1);
	};

}
