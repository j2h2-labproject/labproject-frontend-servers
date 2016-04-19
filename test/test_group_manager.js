var LABPROJECT_BASE = process.cwd();

var group_manager = require(LABPROJECT_BASE + '/lib/managers/group_manager');

var should = require("should");

describe('group_manager:', function(){

	describe('add groups', function(){

		it('create a group', function(done){

			group_manager.new_group('test', function(error, result) {
				(error === null).should.equal(true);
				(result === null).should.equal(false);
				done();
			});

		});


		it('fail to create a duplicate group', function(done){

			group_manager.new_group('test', function(error, result) {
				(error === null).should.equal(false);
				error.message.should.equal('Group insert failed');
				done();
			});

		});


	});

	describe('get group', function(){

		it('get group', function(done){

			group_manager.get_group('test', function(error, result) {
				(error === null).should.be.true;
				(result === null).should.be.false;
				result.is_admin('test').should.equal(false);
				done();
			});

		});

		it('get user and save data', function(done){

			group_manager.get_group('test', function(error, result) {
				(error === null).should.be.true;
				(result === null).should.be.false;
				result.add_admin('test');
				result.is_admin('test').should.equal(true);
				result.add_member('bob');
				result.is_member('bob').should.equal(true);
				result.in_group('test').should.equal(true);
				result.in_group('bob').should.equal(true);
				result.save(function(s_error, result) {
					(s_error === null).should.be.true;
					result.should.equal(true);
					done();
				});
				;
			});

		});

		it('get user with new data', function(done){

			group_manager.get_group('test', function(error, result) {
				(error === null).should.be.true;
				(result === null).should.be.false;
				result.is_admin('test').should.equal(true);
				result.is_member('bob').should.equal(true);
				done();
			});

		});

	});

	describe('get user membership', function(){

			it('get membership (test)', function(done){

				group_manager.get_user_groups('test', function(error, result) {
					(error === null).should.equal(true);
					result.indexOf('test').should.not.equal(-1);
					done();
				});

			});

		});

	describe('remove group memberships', function(){
		it('Remove users from membership', function(done){

			group_manager.get_group('test', function(error, result) {
				(error === null).should.be.true;
				(result === null).should.be.false;
				result.is_admin('test').should.equal(true);
				result.is_member('bob').should.equal(true);
				result.add_member('bob');
				result.add_admin('test');
				result.remove_member('bob');
				result.remove_admin('test');
				result.remove_member('nope');
				result.save(function(s_error, result) {
					(s_error === null).should.be.true;
					result.should.equal(true);
					done();
				});

			});

		});


		it('check membership has been removed', function(done){

			group_manager.get_group('test', function(error, result) {
				(error === null).should.be.true;
				(result === null).should.be.false;
				result.is_admin('test').should.equal(false);
				result.is_member('bob').should.equal(false);
				done();
			});

		});

	});



	describe('delete group', function(){

		it('delete group', function(done){

			group_manager.delete_group('test', function(error, result) {
				(error === null).should.be.true;
				result.should.equal(true);
				done();
			});

		});

	});


});
