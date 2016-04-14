var LABPROJECT_BASE = process.cwd();

var session_manager = require(LABPROJECT_BASE + '/lib/managers/session_manager');
var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');

var should = require("should");

describe('session_manager:', function(){

	before(function(done) {
		user_manager.new_user("test", "test2", function(error, result) {
			(error === null).should.equal(true);
			done();
		});
	});

	after(function(done) {
		user_manager.delete_user("test",function(error, result) {
			(error === null).should.equal(true);
			done();
		});
	});


	var session_id = null;

	describe('creating sessions: ', function() {

		it('create a session', function(done){

			session_manager.new_password_session("test", "test2", function(l_error, result) {
				(l_error === null).should.equal(true);
				session_id = result.get_session_id();
				done();
				// result.delete(function(d_error, result) {
				// 	(d_error === null).should.equal(true);
				// 	done();
				// });

			});

		});

		it('create another session', function(done){


			session_manager.new_password_session("test", "test2", function(l_error, result) {
				(l_error === null).should.equal(true);
				result.delete(function(d_error, result) {
					(d_error === null).should.equal(true);
					done();
				});

			});

		});

		it('fails to create a session for an invalid user', function(done){


			session_manager.new_password_session("nope", "test2", function(l_error, result) {
				(l_error === null).should.equal(false);
				done();
			});

		});

		it('fails to create a session for an invalid password', function(done){

			session_manager.new_password_session("test", "test", function(l_error, result) {
				(l_error === null).should.equal(false);
				done();
			});

		});


	});


	describe('get session', function(done) {

		it('Gets a session', function(done){

			session_manager.get_password_session(session_id, function(l_error, result) {
				(l_error === null).should.equal(true);
				result.get_session_id().should.equal(session_id);
				result.get_user().should.equal("test");
				done();

			});

		});

	});


	describe('delete session', function(done) {


		it('Remove a session', function(done){

			session_manager.delete_password_session(session_id, function(d_error, result) {
				(d_error === null).should.equal(true);
				done();
			});

		});





	});

});
