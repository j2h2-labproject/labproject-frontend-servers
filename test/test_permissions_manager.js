var LABPROJECT_BASE = process.cwd();

var permissions_manager = require(LABPROJECT_BASE + '/lib/managers/permissions_manager');

var should = require("should");

describe('permsissions_manager:', function(){


	describe('add permissions', function(){

		// it('create a permission or a user', function(done){
		//
		// 	permissions_manager.new_permissions('test', function(error, result) {
		// 		(error === null).should.be.true;
		// 		(result === null).should.equal(false);
		// 		done();
		// 	});
		//
		// });
		//
		//
		// it('fail to create a duplicate permission for a user', function(done){
		//
		// 	user_manager.new_user('test', 'test', function(error, result) {
		// 		(error === null).should.be.false;
		// 		done();
		// 	});
		//
		// });


	});

	describe('get permissions', function(){

		// it('get user', function(done){
		//
		// 	user_manager.get_user('test', function(error, result) {
		// 		(error === null).should.be.true;
		// 		(result === null).should.be.false;
		// 		(result.get_full_name() === null).should.equal(true);
		// 		done();
		// 	});
		//
		// });
		//
		// it('get user and save data', function(done){
		//
		// 	user_manager.get_user('test', function(error, result) {
		// 		(error === null).should.be.true;
		// 		(result === null).should.be.false;
		// 		result.set_full_name('Testy Test');
		// 		result.get_full_name().should.equal('Testy Test');
		// 		result.save(function(s_error, result) {
		// 			(s_error === null).should.be.true;
		// 			result.should.equal(true);
		// 			done();
		// 		});
		// 		;
		// 	});
		//
		// });
		//
		// it('get user with new data', function(done){
		//
		// 	user_manager.get_user('test', function(error, result) {
		// 		(error === null).should.be.true;
		// 		(result === null).should.be.false;
		// 		result.get_full_name().should.equal('Testy Test');
		// 		done();
		// 	});
		//
		// });

	});

	describe('delete permissions', function(){

		// it('delete users', function(done){
		//
		// 	user_manager.delete_user('test', function(error, result) {
		// 		(error === null).should.be.true;
		// 		result.should.equal(true);
		// 		done();
		// 	});
		//
		// });

	});


});