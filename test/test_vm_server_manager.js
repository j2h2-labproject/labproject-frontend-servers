var LABPROJECT_BASE = process.cwd();

var test_helper = require(LABPROJECT_BASE + '/test_util/test_helpers');

var vm_server_manager = require(LABPROJECT_BASE + '/lib/managers/vm_server_manager');
var socket_io_transport = require(LABPROJECT_BASE + "/lib/transports/socket_io_transport");
var config = require(LABPROJECT_BASE + "/config");
var logging = require(LABPROJECT_BASE + "/lib/common/logging");

test_logger = new logging.logger("INNER_SERVER", "cli");

var should = require("should");

describe('vm_server_manager:', function(){

  var server = null;

  before(function(done) {
    host_item = config.vm_servers.hosts[0];
    socket_io_transport.connect_clients(test_logger, config.vm_servers.hosts, function(error, vm_server_client) {
      vm_server_manager.initialize(vm_server_client);
      done();
    });
  });

    describe('list vm servers: ', function(){
        it('should list vm servers', function(done){

            vm_server_manager.list_servers(function(error, server_list) {
        (error === null).should.equal(true);
        (server_list.length >= 1).should.equal(true);
        console.log(server_list);
        server = server_list[0];
        done();
      });

        });
    });

  describe('vm servers maintenance mode: ', function(){
        it('should create/check for maintenance mode', function(done){

          vm_server_manager.get_server(server, function(error, server_obj) {
        (error === null).should.equal(true);
        server_obj.reboot_maintenance_network(function(error, result) {
          (error === null).should.equal(true);
          done();
        });
        
      });

        });
    });

  describe('get vm server info', function(){
        it('should get vm server status', function(done){
            vm_server_manager.get_server(server, function(error, server_obj) {
        (error === null).should.equal(true);
        server_obj.get_status(function(error, result) {
          (error === null).should.equal(true);
          (result.total > 0).should.equal(true);
          (result.free > 0).should.equal(true);
          done();
        });
        
      });
        });

    it('should get vm server info', function(done){
            vm_server_manager.get_server(server, function(error, server_obj) {
        (error === null).should.equal(true);
        server_obj.get_info(function(error, result) {
          (error === null).should.equal(true);
          (result.uptime > 0).should.equal(true);
          console.log(result);
          done();
        });
      });
        });
    });



});
