var LABPROJECT_BASE = process.cwd();


var lab_controller = require(LABPROJECT_BASE + '/lib/controllers/lab_controller');
var test_helper = require(LABPROJECT_BASE + '/test_util/test_helpers');
var should = require("should");

describe('lab_controller: ', function(){

  var sessions;
  var lab_id_1;

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


  describe('create_lab: ', function() {

    it('should fail to create lab due to permissions for regular1', function(done){

      lab_controller.create_lab(sessions['regular1'], "regular1_test_lab", function(error, data) {
        (error === null).should.equal(false);
        error.message.should.equal("Permission denied");

        done();
      });

        });

        it('should create lab for regular2', function(done){

      lab_controller.create_lab(sessions['regular2'], "regular2_test_lab", function(error, data) {
        console.log(error);
        (error === null).should.equal(true);
        (data === null).should.equal(false);
        lab_id_1 = data;

        done();
      });

        });
    });

    describe('list_labs: ', function() {

        it('should list no labs for user regular1', function(done){

      lab_controller.list_labs(sessions['regular1'], function(error, data) {
        (error === null).should.equal(true);
        data.length.should.equal(0);

        done();
      });

        });

    it('should list a lab for user regular2', function(done){

      lab_controller.list_labs(sessions['regular2'], function(error, data) {
        (error === null).should.equal(true);
        data.length.should.equal(1);

        done();
      });

    });

    });

  describe('delete_lab: ', function() {

    it('should not delete lab not owned by regular 1', function(done){

      lab_controller.delete_lab(sessions['regular1'], lab_id_1, function(error, data) {
        (error === null).should.equal(false);
        error.message.should.equal("Permission denied");

        done();
      });

    });

    it('should delete lab owned by regular2', function(done){

      lab_controller.delete_lab(sessions['regular2'], lab_id_1, function(error, data) {
        (error === null).should.equal(true);
        (data === null).should.equal(false);

        done();
      });

    });

  });

});
