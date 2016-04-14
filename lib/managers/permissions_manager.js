var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";


module.exports = {
	new_permissions: function(username, callback) {

	},
	get_permissions: function(username, callback) {

	},
	remove_permissions: function(username, callback) {

	}
}

function permissions(username) {
	var self = this;

	var Private = {
		username: username,
		create_groups: false,
		create_labs: false,
		create_vms: false,
		use_vms: false,
		admin_users: false,
		admin_groups: false,
		admin_servers: false,
		admin_vms: false
	}

	self.can_create_groups = function() {
	    return Private.create_groups;
	};

	self.set_can_create_groups = function(value)
	    if (value === true || value === false) {
	       Private.create_groups = value;
	    }
	};

	self.can_create_labs = function() {
	    return Private.create_labs;
	};

	self.set_can_create_labs = function(value)
	    if (value === true || value === false) {
	       Private.create_labs = value;
	    }
	};

	self.can_create_vms = function() {
	    return Private.create_vms;
	};

	self.set_can_create_vms = function(value)
	    if (value === true || value === false) {
	       Private.create_vms = value;
	    }
	};

	self.can_use_vms = function() {
	    return Private.use_vms;
	};

	self.set_can_use_vms = function(value)
	    if (value === true || value === false) {
	       Private.use_vms = value;
	    }
	};

	self.can_admin_users = function() {
	    return Private.admin_users;
	};

	self.set_can_admin_users = function(value)
	    if (value === true || value === false) {
	       Private.admin_users = value;
	    }
	};

	self.can_admin_groups = function() {
	    return Private.admin_groups;
	};

	self.set_can_admin_groups = function(value)
	    if (value === true || value === false) {
	       Private.admin_groups = value;
	    }
	};

	self.can_admin_servers = function() {
	    return Private.admin_servers;
	};

	self.set_can_admin_servers = function(value)
	    if (value === true || value === false) {
	       Private.admin_servers = value;
	    }
	};

	self.can_admin_vms = function() {
	    return Private.admin_vms;
	};

	self.set_can_admin_vms = function(value)
	    if (value === true || value === false) {
	       Private.admin_vms = value;
	    }
	};


}
