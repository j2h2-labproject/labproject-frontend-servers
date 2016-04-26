var LABPROJECT_BASE = process.cwd();


var permissions_manager = require(LABPROJECT_BASE + '/lib/managers/permissions_manager');
var session_manager = require(LABPROJECT_BASE + '/lib/managers/session_manager');
var group_manager = require(LABPROJECT_BASE + '/lib/managers/group_manager');
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');

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
  }
};

var session_map = {};

var user_delete_list = [];
var group_delete_list = [];
var session_delete_list = [];


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
  var user_list = [
    {username: "superuser", password: "test", superuser: true, permissions: []},
    {username: "regular1", password: "test", superuser: false, permissions: []},
    {username: "regular2", password: "test", superuser: false, permissions: []},
    {username: "admin1", password: "test", superuser: false, permissions: []},
    {username: "admin2", password: "test", superuser: false, permissions: ["admin_users", "admin_groups", "admin_servers", "admin_vms"]}
  ];

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
  var group_list = [
    {groupname: "group1", members: ['regular1'], admins: ['admin1']},
    {groupname: "group2", members: ['regular1', 'regular2'], admins: ['admin2']}
  ];
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
  delete_user(0, function() {
    callback();
  });
}

function delete_user(loc, callback) {
  if (loc >= user_delete_list.length) {
    callback();
  } else {
    user_manager.delete_user(user_delete_list[loc], function(error, result) {
      (error === null).should.equal(true);
      permissions_manager.delete_permissions(user_delete_list[loc], function(s_error, result) {
        (s_error === null).should.equal(true);
        delete_user(loc+1, callback);
      });

    });
  }
}

function delete_groups(callback) {
  delete_group(0, function() {
    callback();
  });
}

function delete_group(loc, callback) {
  if (loc >= group_delete_list.length) {
    callback();
  } else {
    group_manager.delete_group(group_delete_list[loc], function(error, result) {
      (error === null).should.equal(true);
      delete_group(loc+1, callback);
    });
  }

}

function delete_sessions(callback) {
  delete_session(0, function(){
    callback();
  });
}

function delete_session(loc, callback) {
  if (loc > session_delete_list.length) {
    callback();
  } else {
    session_manager.delete_password_session(session_delete_list[loc], function(error, result) {
      (error === null).should.equal(true);
      delete_session(loc+1, callback)
    });
  }
}
