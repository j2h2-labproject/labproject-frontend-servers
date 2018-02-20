var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var usergroup_controller = require(LABPROJECT_BASE + '/lib/controllers/usergroup_controller');

var test_helper = require(LABPROJECT_BASE + '/test_util/test_helpers');

var should = require("should");

var foreach = require(LABPROJECT_LIB + "/common/loop").foreach;

describe('usergroup_controller:', function(){

    var sessions;

    before(function(done) {
        test_helper.generate_environment(function(result) {
        sessions = result;
        done();
        });
    });

    after(function(done) {
        test_helper.destroy_environment(function() {
        done();
        });
    });

    describe('list users: ', function(){

        it('should not allow guest to list users', function(done){
            usergroup_controller.list_users(sessions['guest'], function(error, user_list) {
                (error === null).should.equal(false);
                (user_list === null).should.equal(true);
                done();
            });
        });

        it('should allow superuser to list users', function(done){
            usergroup_controller.list_users(sessions['superuser'], function(error, user_list) {
                (error === null).should.equal(true);
                (user_list.length >= 1).should.equal(true);
                (user_list.indexOf('guest') != -1).should.equal(true);
                (user_list.indexOf('admin1') != -1).should.equal(true);
                done();
            });
        });

        it('should allow admin2 to list users', function(done){
            usergroup_controller.list_users(sessions['admin2'], function(error, user_list) {
                (error === null).should.equal(true);
                (user_list.length >= 1).should.equal(true);
                done();
            });
        });

    });

    describe('add and remove users: ', function(){

        var expected_fail = ['guest', 'admin1', 'regular1', 'regular2'];
        var expected_success = ['superuser', 'admin2'];

        it('should not allow certain users to add a user', function(done){
            foreach(expected_fail, function(loc, controller, pass_data, next) {
                var username = expected_fail[loc];
                usergroup_controller.add_user(sessions[username], 'test_fail_add', 'test', function(error, result) {
                    (error === null).should.equal(false);
                    usergroup_controller.list_users(sessions['superuser'], function(error, user_list) {
                        (error === null).should.equal(true);
                        (user_list.indexOf('test_fail_add') == -1).should.equal(true);
                        next(null, null);
                    });
                });
            }, function(error, status) {
                done();
            })
        });

        it('should allow certain users to add and remove a user', function(done){
            foreach(expected_success, function(loc, controller, pass_data, next) {
                var username = expected_success[loc];
                usergroup_controller.add_user(sessions[username], 'test_do_add', 'test', function(error, result) {
                    (error === null).should.equal(true);
                    usergroup_controller.list_users(sessions['superuser'], function(error, user_list) {
                        (error === null).should.equal(true);
                        (user_list.indexOf('test_do_add') == -1).should.equal(false);
                         usergroup_controller.remove_user(sessions[username], 'test_do_add', function(error, result) {
                             (error === null).should.equal(true);
                             next(null, null);
                         });    
                        
                    });
                });
            }, function(error, status) {
                done();
            })
        });

    });
});
