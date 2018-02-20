var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var config = require(LABPROJECT_BASE + "/config");
var sanitize = require(LABPROJECT_LIB + '/common/sanitize');
var common_crypto = require(LABPROJECT_LIB + '/common/crypto');
var database = require(LABPROJECT_LIB + '/util/database');

module.exports = {
    new_user: function(username, password, callback) {

        var new_user = new user(username);

        new_user.init(function(i_error, i_status) {
            if (!i_error) {
                new_user.set_password(password, function(p_error, result) {
                    if (!p_error) {
                        new_user.save(function(s_error, status) {
                            callback(null, new_user);
                        });
                    } else {
                        callback(p_error, null);
                    }
                });
            } else {
                callback(i_error, null);
            }
        });

    },
    get_user: function(username, callback) {
        var return_user = new user(username);
        return_user.load(function(error, status) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, return_user);
            }
        });
    },
    delete_user: function(username, callback) {
        var delete_user = new user(username);
        delete_user.delete(function(error, result) {
            callback(error, result);
        });
    },
    list_users: function(callback) {
        database.find('users', {}, {}, function(d_error, results) {
            if (!d_error) {
                var user_list = [];
                for (var i = 0; i < results.length; i++) {
                    user_list.push(results[i].username);
                }
                callback(null, user_list);
            } else {
                callback(d_error, null);
            }
        });
    }
}

function user(username) {
    if (!username) {
        return;
    }

    var self = this;

    var Private = {
        username: username,
        password: null,
        salt: null,
        full_name: null
    };


    self.init = function(callback) {
        database.insert('users', {"username": username}, function(error, result) {
            if (!error) {
                callback(null, true);
            } else {
                callback(new Error("User insert failed"), null);
            }
        });
    }

    self.load = function(callback) {
        database.findOne('users', {username: Private.username}, function(d_error, result) {
            if (result) {

                Private.full_name = result.full_name;

                callback(null, true);
            } else if (d_error) {
                callback(d_error, null);
            } else {
                callback(new Error("User does not exist"), null);
            }
        });
    };

    self.save = function(callback) {
        database.update('users', {username: Private.username}, Private, false, function(d_error, result) {
            if (!d_error) {
                callback(null, true);
            } else {
                callback(d_error, null);
            }
        });
    };

    self.delete = function(callback) {
        database.remove('users', {"username": Private.username}, function(error, result) {
            if (!error) {
                callback(null, true);
            } else {
                callback(new Error("User delete failed"), null);
            }
        });
    }

    self.set_full_name = function(name) {
        Private.full_name = name;
    };

    self.get_full_name = function() {
        return Private.full_name;
    };

    self.set_password = function(password, callback) {
        var salt = common_crypto.random_hash(16);

        common_crypto.pbkdf2(password, salt, function(error, hash) {
            if (!error) {
                Private.password = hash;
                Private.salt = salt;
                callback(null, true);
            } else {
                callback(error, null);
            }
        });


    }

}
