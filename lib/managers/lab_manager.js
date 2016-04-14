/*
Lab Manager - Manages lab objects

A lab represents exactly as named. It stores lab-oriented permissions and data to recreate the lab when loaded
Controller will take care of actually recreating the lab devices and connections

*/
var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

module.exports = {
	new_lab: function(owner, lab_name, callback) {
    owner = sanitize.simple_string(owner);

    create_new_lab(owner, lab_name, callback);

	},
	get_lab: function(lab_id, callback) {
    var return_lab = new lab(lab_id);
    return_lab.load(function(error, result) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, return_lab);
      }
    });
	},
	remove_lab: function(lab_id, callback) {
		var delete_lab = new lab(lab_id);
    delete_lab.delete(function(error, result) {
        callback(error, result);
    });
	}
};

function generate_lab_id(username) {
	return "lab-" + username + "-" + common_crypto.random_hash(20);
}

function create_new_lab(owner, lab_name, callback) {
  var new_lab_id = generate_lab_id(owner);
  var new_lab = new lab(new_lab_id);

  new_lab.init(function(i_error, status) {
    if (!i_error && status === true) {
      new_lab.set_owner(owner);
			new_lab.set_lab_name(lab_name);
      new_lab.save(function(s_error, result) {
        if (!s_error) {
            callback(null, new_lab);
        } else {
            callback(s_error, null);
        }
      });
    } else {
      if (i_error.name === "MongoError" && i_error.code === 11000) {
        create_new_lab(owner, lab_name, callback);
      } else {
        callback(i_error, null);
      }
    }
  });
}

function lab(lab_id) {
	var self = this;

	var Private = {
		lab_id: lab_id,
    lab_name: null,
		owner: null,
    groups_readonly: [], // List of groups that can only use the lab
    groups_edit: [], // List of groups that can edit the lab
    devices: [],
    connections: []
	};

  self.init = function(callback) {
    database.insert('labs', {"lab_id": Private.lab_id}, function(error, result) {
      if (!error) {
        callback(null, true);
      } else {
        callback(new Error("Lab insert failed"), null);
      }
    });
  }

  self.load = function(callback) {
    database.findOne('labs', {"lab_id": Private.lab_id}, function(d_error, result) {
      if (result) {

        Private = result;

        callback(null, true);
      } else if (d_error) {
        callback(d_error, null);
      } else {
        callback(new Error("Lab does not exist"), null);
      }
    });
  };

  self.save = function(callback) {
    database.update('labs', {"lab_id": Private.lab_id}, Private, false, function(d_error, result) {
      if (!d_error) {
        callback(null, true);
      } else {
        callback(d_error, null);
      }
    });
  };

  self.delete = function(callback) {
    database.remove('labs', {"lab_id": Private.lab_id}, function(error, result) {
      if (!error) {
				Private = null;
        callback(null, true);
      } else {
        callback(new Error("Lab delete failed"), null);
      }
    });
  }

  self.get_lab_id = function() {
    return Private.lab_id;
  };

  self.get_lab_name = function() {
    return Private.lab_name;
  };

  self.set_lab_name = function(name) {
    Private.lab_name = sanitize.simple_text(name);
  };

  self.get_owner = function() {
    return Private.owner;
  };

  self.set_owner = function(owner) {
    Private.owner = sanitize.simple_string(owner);
  };

  self.add_devices = function(uuid) {
    Private.devices.push(uuid);
  };

  self.get_devices = function() {
    return Private.devices.slice();
  }

}
