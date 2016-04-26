var LABPROJECT_BASE = process.cwd();

var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');
var lab_manager = require(LABPROJECT_BASE + '/lib/managers/lab_manager');

var should = require("should");

describe('lab_manager:', function(){

	var lab_id = "lab-test-test_lab";

	describe('add a lab', function(){

		it('create a new lab', function(done){

			lab_manager.new_lab('test', 'test_lab', function(error, result) {
				(error === null).should.be.true;
				(result === null).should.equal(false);
				result.get_lab_name().should.equal('test_lab');
				result.get_lab_id().should.equal("lab-test-test_lab");
				done();
			});
		});


		it('fail to create a duplicate lab', function(done){

			lab_manager.new_lab('test', 'test_lab', function(error, result) {
				(error === null).should.be.false;
				(result === null).should.be.true;
				done();
			});

		});

	});

	describe('get labs', function(){



		it('get lab', function(done){

			lab_manager.get_lab(lab_id, function(error, result) {
				(error === null).should.be.true;
				(result === null).should.be.false;
				result.get_lab_id().should.equal(lab_id);
				result.get_lab_name().should.equal("test_lab");
				done();
			});

		});

		it('get lab and save data', function(done){

				lab_manager.get_lab(lab_id, function(error, result) {
				(error === null).should.be.true;
				(result === null).should.be.false;
				result.set_owner("bob");
				result.get_owner().should.equal('bob');
				result.save(function(s_error, result) {
					(s_error === null).should.be.true;
					result.should.equal(true);
					done();
				});
				;
			});

		});

		it('get user with new data', function(done){

			lab_manager.get_lab(lab_id, function(error, result) {
				(error === null).should.equal(true);
				(result === null).should.equal(false);
				result.get_owner().should.equal('bob');
				done();
			});

		});

	});


	describe('lab data', function(){

		it('fail to change name of lab', function(done){

			lab_manager.get_lab(lab_id, function(error, result) {
				(error === null).should.be.true;
				result.set_lab_name("nope");
				result.get_lab_name().should.equal("test_lab");
				done();
			});

		});

	});

	describe('list labs', function(){

		it('get a list of labs', function(done){

			lab_manager.list_available_labs("bob", [], function(error, results) {
				(error === null).should.be.true;
				(results.length > 0).should.equal(true);
				var found = false;
				for (var i = 0; i < results.length; i++ ) {
					if (results[i].lab_id == lab_id) {
						found = true;
					}
				}
				found.should.equal(true);
				done();
			});

		});

	});


	describe('delete labs', function(){

		it('delete lab', function(done){

			lab_manager.delete_lab(lab_id, function(error, result) {
				(error === null).should.be.true;
				result.should.equal(true);
				lab_manager.get_lab("lab-test-test_lab", function(error, result) {
					(error === null).should.equal(false);
					(result === null).should.equal(true);
					done();
				});

			});

		});

	});


});
