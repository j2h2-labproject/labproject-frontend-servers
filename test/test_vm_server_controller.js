var LABPROJECT_BASE = process.cwd();

var test_helper = require(LABPROJECT_BASE + '/test_util/test_helpers');

var config = require(LABPROJECT_BASE + "/config");
var vm_server_controller = require(LABPROJECT_BASE + '/lib/controllers/vm_server_controller');
var socket_io_transport = require(LABPROJECT_BASE + "/lib/transports/socket_io_transport");

var should = require("should");

describe('vm_server_controller:', function(){

  var server = null;
  var sessions = null;

  before(function(done) {
    test_helper.generate_environment(function(result) {
      sessions = result;
      host_item = config.vm_servers.hosts[0];
      socket_io_transport.connect_clients(test_logger, config.vm_servers.hosts, function(error, vm_server_client) {
        vm_server_controller.initialize(vm_server_client);
        done();
      });
    });
	});

	after(function(done) {
    test_helper.destroy_environment(function() {
      done();
    });
	});

	describe('list vm servers: ', function(){
		it('should list vm servers', function(done){
			vm_server_controller.list_servers(function(error, server_list) {
        (error === null).should.equal(true);
        (server_list.length >= 1).should.equal(true);
        console.log(server_list);
        server = server_list[0];
        done();
      });
		});
	});

  describe('list vm server status: ', function(){
		it('should list vm servers', function(done){
			vm_server_controller.get_server_status(server, function(error, server_info) {
        (error === null).should.equal(true);
        (server_info['free'] > 0).should.equal(true);
        (server_info['total'] > 0).should.equal(true);
        console.log(server_info);
        done();
      });
		});
	});



});
