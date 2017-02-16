var LABPROJECT_BASE = process.cwd();

var permissions_manager = require(LABPROJECT_BASE + '/lib/managers/permissions_manager');
var session_manager = require(LABPROJECT_BASE + '/lib/managers/session_manager');
var group_manager = require(LABPROJECT_BASE + '/lib/managers/group_manager');
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');
var controller_helpers = require(LABPROJECT_BASE + '/lib/util/controller_helpers');

var should = require("should");

describe('controller_helpers:', function(){

  var session_id = null;

	before(function(done) {
		user_manager.new_user("test", "test3", function(error, result) {
      console.log(error);
			(error === null).should.equal(true);
      group_manager.new_group("group", function(g_error, group) {
        group.add_member("test");
        group.save(function(error, result) {
          (error === null).should.equal(true);
          permissions_manager.new_permissions("test", function(p_error, permission) {
            (p_error === null).should.equal(true);
            permission.set_can_admin_vms(true);
            permission.set_can_use_vms(true);
            permission.save(function(p_error, result) {
              (p_error === null).should.equal(true);
              session_manager.new_password_session("test", "test3", function(s_error, session) {
                console.log(s_error);
                (s_error === null).should.equal(true);
                session_id = session.get_session_id();
                done();
              });
            });

          });
        });
      });
		});
	});

	after(function(done) {
    session_manager.delete_password_session(session_id, function(error, result) {
      (error === null).should.equal(true);
      permissions_manager.delete_permissions("test", function(p_error, result) {
        (p_error === null).should.equal(true);
        group_manager.delete_group("group", function(error, result) {
          (error === null).should.equal(true);
          user_manager.delete_user("test", function(error, result) {
            (error === null).should.equal(true);
            done();
          });
        });
      });
    });

	});


	describe('get session data: ', function() {

		it('get session data', function(done){

      controller_helpers.get_user_data(session_id, function(error, data) {
        (error === null).should.equal(true);
        console.log(data);
        data.user.should.equal("test");
        data.groups.should.containDeep(['group']);
        data.permissions.can_use_vms().should.equal(true);
        data.permissions.can_create_vms().should.equal(false);
        done();
      });

		});



	});

});
