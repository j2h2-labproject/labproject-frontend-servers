var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var config = require(LABPROJECT_BASE + "/config");
var sanitize = require(LABPROJECT_LIB + '/common/sanitize');
var common_crypto = require(LABPROJECT_LIB + '/common/crypto');
var database = require(LABPROJECT_LIB + '/util/database');

module.exports = {
	new_password_session: function(username, password, callback) {

		username = sanitize.simple_string(username);

		database.findOne('users', {username: username}, function(error, result) {
			if (result != null) {
				var salt = result.salt;
				common_crypto.pbkdf2(password, salt, function(error, hash) {
					if (!error) {
						if (hash == result.password) {

							create_new_session(username, callback);

						} else {
							callback(new Error("Invalid username/password"), null);
						}
					} else {
						callback(error, null);
					}
				});
			} else {
				callback(new Error("Invalid username/password"), null);
			}
		});
	},
	get_password_session: function(session_id, callback) {
		var return_session = new password_session(session_id);
		return_session.load(function(error, result) {
			if (error) {
				callback(error, null);
			} else {
				callback(null, return_session);
			}
		});

	},
	delete_password_session: function(session_id, callback) {
		var delete_session = new password_session(session_id);
		delete_session.delete(function(error, result) {
			callback(error, result);
		});
	}
}

function generate_session_id(username) {
	return username + "-" + common_crypto.random_hash(32);
}

function create_new_session(username, callback) {
	var session_id = generate_session_id(username);
	var new_session = new password_session(session_id);

	new_session.init(function(i_error, status) {
		if (!i_error && status === true) {
			new_session.set_user(username);

			new_session.save(function(s_error, result) {
				if (!s_error) {
						callback(null, new_session);
				} else {
						callback(s_error, null);
				}

			});
		} else {
			if (i_error.name === "MongoError" && i_error.code === 11000) {
				create_new_session(username, callback);
			} else {
					callback(i_error, null);
			}
		}
	});
}

function password_session(session_id) {
	// if (!session_id) {
	// 	return;
	// }

	var self = this;
	var Private = {
		session_id: session_id,
		user: null
	};

	self.set_user = function(user) {
		Private.user = sanitize.simple_string(user);
	};

	self.get_user = function() {
		return Private.user;
	};

	self.get_session_id = function() {
		return Private.session_id;
	};

	self.init = function(callback) {
		database.insert('sessions', {"session_id": Private.session_id}, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {

				callback(error, null);
			}
		});
	}

	self.load = function(callback) {
		database.findOne('sessions', {"session_id": Private.session_id}, function(d_error, result) {
			if (result) {
				Private = result;
				callback(null, true);
			} else if (d_error) {
				callback(d_error, null);
			} else {
				callback(new Error("Session does not exist"), null);
			}
		});
	};

	self.save = function(callback) {
		database.update('sessions', {session_id: Private.session_id}, Private, false, function(d_error, result) {
			if (!d_error) {
				callback(null, true);
			} else {
				callback(d_error, null);
			}
		});
	};

	self.delete = function(callback) {
		database.remove('sessions', {"session_id": Private.session_id}, function(error, result) {
			if (!error) {
				callback(null, true);
			} else {
				callback(new Error("Session delete failed"), null);
			}
		});
	};


}
