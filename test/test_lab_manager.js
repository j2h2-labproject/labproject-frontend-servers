var LABPROJECT_BASE = process.cwd();

var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');
var lab_manager = require(LABPROJECT_BASE + '/lib/managers/lab_manager');
var config = require(LABPROJECT_BASE + "/config");
var socket_io_transport = require(LABPROJECT_BASE + "/lib/transports/socket_io_transport");

var should = require("should");

describe('lab_manager:', function(){

	before(function(done) {
    host_item = config.vm_servers.hosts[0];
    socket_io_transport.connect_clients(test_logger, config.vm_servers.hosts, function(error, vm_server_client) {
      lab_manager.initialize(vm_server_client);
      done();
    });
  });



	var lab_id = "lab-test-test_lab";

	describe('add a lab', function(){

		it('create a new lab', function(done){

			lab_manager.new_lab('test', 'test_lab', function(error, result) {
				(error === null).should.equal(true);
				(result === null).should.equal(false);
				result.get_lab_name().should.equal('test_lab');
				result.get_lab_id().should.equal("lab-test-test_lab");
				done();
			});
		});


		it('fail to create a duplicate lab', function(done){

			lab_manager.new_lab('test', 'test_lab', function(error, result) {
				(error === null).should.be.false;
				(result === null).should.equal(true);
				done();
			});

		});

	});

	describe('get labs', function(){



		it('get lab', function(done){

			lab_manager.get_lab(lab_id, function(error, result) {
				(error === null).should.equal(true);
				(result === null).should.be.false;
				result.get_lab_id().should.equal(lab_id);
				result.get_lab_name().should.equal("test_lab");
				done();
			});

		});

		it('get lab and save data', function(done){

				lab_manager.get_lab(lab_id, function(error, result) {
				(error === null).should.equal(true);
				(result === null).should.be.false;
				result.set_owner("bob");
				result.get_owner().should.equal('bob');
				result.add_device("test", "12345678-1234-5678-1234-567812345678");
				result.device_in_lab("12345678-1234-5678-1234-567812345678").should.equal(true);
				result.save(function(s_error, result) {
					(s_error === null).should.equal(true);

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
				result.device_in_lab("12345678-1234-5678-1234-567812345678").should.equal(true);
				done();
			});

		});

	});


	describe('lab data', function(){

		it('fail to change name of lab', function(done){

			lab_manager.get_lab(lab_id, function(error, result) {
				(error === null).should.equal(true);
				result.set_lab_name("nope");
				result.get_lab_name().should.equal("test_lab");
				done();
			});

		});

	});

	describe('start/stop lab', function(){

		it('starts the lab', function(done){

			lab_manager.get_lab(lab_id, function(error, result) {
				(error === null).should.equal(true);
				result.start_lab(function(s_error, status) {
					(s_error === null).should.equal(true);
					status.should.equal(true);
					done();
				});
			});

		});

		it('fails to start the same lab', function(done){

			lab_manager.get_lab(lab_id, function(error, result) {
				(error === null).should.equal(true);
				result.start_lab(function(s_error, status) {
					(s_error === null).should.equal(false);
					s_error.message.should.equal("Lab is already started");
					done();
				});
			});

		});


		it('stops the lab', function(done){

			lab_manager.get_lab(lab_id, function(error, result) {
				(error === null).should.equal(true);
				result.stop_lab(function(s_error, status) {
					(s_error === null).should.equal(true);
					status.should.equal(true);
					done();
				});

			});

		});

	});

	describe('labs and interfaces', function(){

		var test_group_id = null;
		var test_interface = null;

		it('should allocate an interface group', function(done){

			lab_manager.get_lab(lab_id, function(error, lab) {
				(error === null).should.equal(true);
				lab.add_device(config.vm_servers.hosts[0].name, "12345678-1234-5678-1234-567812345678");
				lab.allocate_interface_group(function(error, group_id) {
					(error === null).should.equal(true);
					(group_id >= 0).should.equal(true);
					test_group_id = group_id;
					done();
				});
			});

		});

		it('should verify the interface group', function(done){

			lab_manager.get_lab(lab_id, function(error, lab) {
				(error === null).should.equal(true);
				lab.interface_group_status(function(error, status) {
					(error === null).should.equal(true);
					status.should.equal(true);
					done();
				});
			});
		});

		it('should get an interface', function(done){

			lab_manager.get_lab(lab_id, function(error, lab) {
				(error === null).should.equal(true);
				lab.get_interface(function(error, interface_name) {
					(error === null).should.equal(true);

					var interface_match = new RegExp("^lpif" + test_group_id + "\.[0-9]+$");

					interface_match.test(interface_name).should.equal(true);
					test_interface = interface_name;
					
					done();
				});
			});
		});

		it('should remove an interface', function(done){

			lab_manager.get_lab(lab_id, function(error, lab) {
				(error === null).should.equal(true);
				lab.remove_interface(test_interface, function(error, result) {
					(error === null).should.equal(true);
					result.should.equal(true);
					done();
				});
			});
		});

		it('should deallocate the interface group', function(done){

			lab_manager.get_lab(lab_id, function(error, lab) {
				(error === null).should.equal(true);
				lab.deallocate_interface_group(function(error, status) {
					(error === null).should.equal(true);
					status.should.equal(true);
					done();
				});
			});
		});

	});


	describe('list labs', function(){

		it('get a list of labs', function(done){

			lab_manager.list_available_labs("bob", [], function(error, results) {
				(error === null).should.equal(true);
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
				(error === null).should.equal(true);
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
