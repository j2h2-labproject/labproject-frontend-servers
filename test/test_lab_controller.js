var LABPROJECT_BASE = process.cwd();


var lab_controller = require(LABPROJECT_BASE + '/lib/controllers/lab_controller');
var test_helper = require(LABPROJECT_BASE + '/test_util/test_helper');
var should = require("should");

describe('lab_controller: ', function(){

  var sessions;

	before(function(done) {
    test.generate_environment(function(result) {
      sessions = result;
      done();
    });
	});

	after(function(done) {
    test.destroy_environment(function() {
      done(); 
    });

	});

	describe('list_labs: ', function() {

		it('should list available labs', function(done){

      lab_controller.list_labs(session_id, function(error, data) {
        (error === null).should.equal(true);
        data.length.should.equal(0);

        done();
      });

		});



	});

});
