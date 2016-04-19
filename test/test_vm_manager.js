var LABPROJECT_BASE = process.cwd();

var vm_manager = require(LABPROJECT_BASE + '/lib/managers/vm_manager');
var socket_io_transport = require(LABPROJECT_BASE + "/lib/transports/socket_io_transport");
var config = require(LABPROJECT_BASE + "/config");
var logging = require(LABPROJECT_BASE + "/lib/common/logging");

test_logger = new logging.logger("INNER_SERVER", "cli");

var should = require("should");

var vm_uuid = null;
var host_item = null;

describe('vm_manager:', function(){

  before(function(done) {
    host_item = config.vm_servers.hosts[0];
    socket_io_transport.connect_clients(test_logger, config.vm_servers.hosts, function(error, vm_server_client) {
      vm_manager.initialize(vm_server_client);
      done();
    });
  });


	describe('new_vm: ', function(){

		it('create a new vm', function(done){

			vm_manager.new_vm(host_item['name'], 'test', function(error, result) {
				(error === null).should.equal(true);
				(result === null).should.equal(false);
        vm_uuid = result.get_uuid();
				done();
			});

		});


	});

	describe('get_vm: ', function(){

		it('get vm', function(done){

			vm_manager.get_vm(vm_uuid, function(error, result) {
				(error === null).should.equal(true);
				(result === null).should.equal(false);
        result.get_name().should.equal('test');
        result.get_vm_server().should.equal('test');
        result.state.is_defined().should.equal(false);
				done();
			});

		});

		it('get vm and save data', function(done){

			vm_manager.get_vm(vm_uuid, function(error, result) {
				(error === null).should.be.true;
				(result === null).should.be.false;
        result.set_hypervisor('vbox');
        result.get_hypervisor().should.equal('vbox');
				result.config.set_mem_size(512);
        result.config.get_mem_size().should.equal(512);
				result.config.set_display('local');
        result.config.get_display().should.equal('local');
        result.set_owner('test');
        result.get_owner().should.equal('test');
				result.save(function(s_error, result) {
					(s_error === null).should.be.true;
					result.should.equal(true);
					done();
				});

			});

		});

    it('get vm with saved data', function(done){

			vm_manager.get_vm(vm_uuid, function(error, result) {
				(error === null).should.be.true;
				(result === null).should.be.false;
        result.get_hypervisor().should.equal('vbox');
        result.config.get_mem_size().should.equal(512);
        result.config.get_display().should.equal('local');
        result.get_owner().should.equal('test');

		    done();
			});

		});

	});

	describe('define the virtual machine', function(){

			it('define', function(done){

        vm_manager.get_vm(vm_uuid, function(error, result) {
  				(error === null).should.be.true;
  				(result === null).should.be.false;
          result.state.define(function( error, result) {
            console.log("ERROR", error);
            done();
          });


  			});

			});

		});

	// describe('remove group memberships', function(){
	// 	it('Remove users from membership', function(done){
  //
	// 		group_manager.get_group('test', function(error, result) {
	// 			(error === null).should.be.true;
	// 			(result === null).should.be.false;
	// 			result.is_admin('test').should.equal(true);
	// 			result.is_member('bob').should.equal(true);
	// 			result.add_member('bob');
	// 			result.add_admin('test');
	// 			result.remove_member('bob');
	// 			result.remove_admin('test');
	// 			result.remove_member('nope');
	// 			result.save(function(s_error, result) {
	// 				(s_error === null).should.be.true;
	// 				result.should.equal(true);
	// 				done();
	// 			});
  //
	// 		});
  //
	// 	});
  //
	// 	it('check membership has been removed', function(done){
  //
	// 		group_manager.get_group('test', function(error, result) {
	// 			(error === null).should.be.true;
	// 			(result === null).should.be.false;
	// 			result.is_admin('test').should.equal(false);
	// 			result.is_member('bob').should.equal(false);
	// 			done();
	// 		});
  //
	// 	});
  //
	// });



	describe('delete_vm', function(){

		it('delete virtual machine', function(done){

			vm_manager.delete_vm(vm_uuid, function(error, result) {
				(error === null).should.be.true;
				result.should.equal(true);
				done();
			});

		});

	});


});
