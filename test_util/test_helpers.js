var LABPROJECT_BASE = process.cwd();


var permissions_manager = require(LABPROJECT_BASE + '/lib/managers/permissions_manager');
var session_manager = require(LABPROJECT_BASE + '/lib/managers/session_manager');
var group_manager = require(LABPROJECT_BASE + '/lib/managers/group_manager');
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');

var logging = require(LABPROJECT_BASE + "/lib/common/logging");
var foreach = require(LABPROJECT_BASE + "/lib/common/loop").foreach;

var should = require("should");

module.exports = {
  generate_environment: function(callback) {
    generate_users(function() {
      generate_groups(function() {
        callback(session_map);
      });
    });
  },
  destroy_environment: function(callback) {
    delete_groups(function() {
      delete_users(function() {
        delete_sessions(function() {
          callback();
        });
      });
    });
  },
  logger: new logging.logger("TESTING", "cli")
};

var session_map = {};

var user_delete_list = [];
var group_delete_list = [];
var session_delete_list = [];

const user_list = [
  {username: "superuser", password: "test", superuser: true, permissions: []},
  {username: "guest", password: "test", superuser: false, permissions: []},
  {username: "regular1", password: "test", superuser: false, permissions: ["use_vms"]},
  {username: "regular2", password: "test", superuser: false, permissions: ["create_labs", "create_vms"]},
  {username: "admin1", password: "test", superuser: false, permissions: []},
  {username: "admin2", password: "test", superuser: false, permissions: ["admin_users", "admin_groups", "admin_servers", "admin_vms"]}
];

const group_list = [
    {groupname: "group1", members: ['regular1'], admins: ['admin1']},
    {groupname: "group2", members: ['regular1', 'regular2'], admins: ['admin2']}
];

var perm_list = [
"create_groups",
"create_labs",
"create_vms",
"use_vms",
"admin_users",
"admin_groups",
"admin_servers",
"admin_vms"
];

function generate_users(callback) {
  

  create_user(0, user_list, function() {
    callback();
  });
}

function create_user(loc, list, callback) {

  if (loc >= list.length) {
    callback();
  } else {
    var username = list[loc].username;
    user_delete_list.push(username);
    user_manager.new_user(username, list[loc].password, function(error, result) {
      (error === null).should.equal(true);
      permissions_manager.new_permissions(username, function(p_error, permissions) {
        (p_error === null).should.equal(true);
        permissions.set_superuser_status(list[loc].superuser);

        var set_list = list[loc].permissions;

        for (var i = 0; i < set_list.length; i++) {
          permissions['set_can_' + set_list[i]](true);
        }
        permissions.save(function(s_error, status) {
          (s_error === null).should.equal(true);

          session_manager.new_password_session(username, list[loc].password, function(l_error, session) {
            (l_error === null).should.equal(true);
            session_delete_list.push(session.get_session_id());
            session_map[username] = session.get_session_id();
            create_user(loc+1, list, callback);
          });


        });

      });

    });
  }
}

function generate_groups(callback) {
  
  create_group(0, group_list, function() {
    callback();
  });
}

function create_group(loc, list, callback) {
  if (loc >= list.length) {
    callback();
  } else {
    group_manager.new_group(list[loc].groupname, function(g_error, group) {
      (g_error === null).should.equal(true);
      group_delete_list.push(list[loc].groupname);

      for (var i = 0; i < list[loc].members.length; i++) {
        group.add_member(list[loc].members[i]);
      }
      for (var i = 0; i < list[loc].admins.length; i++) {
        group.add_admin(list[loc].admins[i]);
      }
      group.save(function(error, result) {
        create_group(loc+1, list, callback);
      });
    });
  }
}

function delete_users(callback) {
    foreach(user_list, function(loc, user_obj, pass_data, next){
        user_manager.delete_user(user_obj.username, function(error, result) {
            if (error) {
                console.log("Got " + error.message + " when deleting user " + user_obj.username);
            } 
            (error === null).should.equal(true);

            permissions_manager.delete_permissions(user_obj.username, function(s_error, result) {
                if (s_error) {
                    console.log("Got " + s_error.message + " when deleting permissions for " + user_obj.username);
                }
                (s_error === null).should.equal(true);
                next(null, true);
            });
        });
    }, function(error, pass_data){
        callback();
    });
  
}

function delete_groups(callback) {
    foreach(group_list, function(loc, group_obj, pass_data, next){
        group_manager.delete_group(group_obj.groupname, function(error, result) {
            (error === null).should.equal(true);
            next(null, true);
        });
    }, function(error, status){
        callback();
    });
}

function delete_sessions(callback) {
    foreach(session_delete_list, function(loc, session_id, pass_data, next){
        session_manager.delete_password_session(session_id, function(error, result) {
            (error === null).should.equal(true);
            next(null, true)
        });
    }, function(error, status){
        callback();
    });
}

