var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var test_helper = require(LABPROJECT_BASE + '/test_util/test_helpers');

var config = require(LABPROJECT_BASE + "/config");
var vm_server_controller = require(LABPROJECT_BASE + '/lib/controllers/vm_server_controller');
var socket_io_transport = require(LABPROJECT_BASE + "/lib/transports/socket_io_transport");
var foreach = require(LABPROJECT_LIB + "/common/loop").foreach;

var should = require("should");

describe('vm_server_controller:', function(){

  var server = null;
  var sessions = null;

  var expected_fail = ['guest', 'admin1', 'regular1', 'regular2'];
  var expected_success = ['superuser', 'admin2'];

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

		it('should allow superuser and users with admin_servers ability to list vm servers', function(done) {
      foreach(expected_success, function(loc, controller, pass_data, next) {
          var username = expected_success[loc];
          vm_server_controller.list_servers(sessions[username], function(error, server_list) {
            (error === null).should.equal(true);
            (server_list.length >= 1).should.equal(true);
            server = server_list[0];
            next(null, null);
          });
      }, function(error, status) {
          done();
      })
		});

    it('should not allow any other users to list vm servers', function(done) {
      foreach(expected_fail, function(loc, controller, pass_data, next) {
          var username = expected_fail[loc];
          vm_server_controller.list_servers(sessions[username], function(error, server_list) {
            (error === null).should.equal(false);
            error.message.should.equal("Permission denied");
            next(null, null);
          });
      }, function(error, status) {
          done();
      })
		});
	});

  describe('list vm server status: ', function() {
    it('should allow superuser and users with admin_servers ability to get vm server info', function(done) {
      foreach(expected_success, function(loc, controller, pass_data, next) {
          var username = expected_success[loc];

          vm_server_controller.get_server_status(sessions[username], server, function(error, server_status) {
            (error === null).should.equal(true);
            (server_status['free'] > 0).should.equal(true);
            (server_status['total'] > 0).should.equal(true);
            next(null, null);
          });

      }, function(error, status) {
          done();
      })
		});

    it('should not allow any other user to get vm server info', function(done) {
      foreach(expected_fail, function(loc, controller, pass_data, next) {
          var username = expected_fail[loc];

          vm_server_controller.get_server_status(sessions[username], server, function(error, server_status) {
            (error === null).should.equal(false);
            error.message.should.equal("Permission denied");
            next(null, null);
          });

      }, function(error, status) {
          done();
      })
		});

	});

  describe('list vm server info: ', function(){

    it('should allow superuser and users with admin_servers ability to get vm server status', function(done) {
      foreach(expected_success, function(loc, controller, pass_data, next) {
          var username = expected_success[loc];

          vm_server_controller.get_server_info(sessions[username], server, function(error, server_info) {
            (error === null).should.equal(true);
            console.log(server_info);
            next(null, null);
          });
      }, function(error, status) {
          done();
      })
		});

    it('should not allow any other user to get vm server status', function(done) {
      foreach(expected_fail, function(loc, controller, pass_data, next) {
          var username = expected_fail[loc];

          vm_server_controller.get_server_info(sessions[username], server, function(error, server_status) {
            (error === null).should.equal(false);
            error.message.should.equal("Permission denied");
            next(null, null);
          });

      }, function(error, status) {
          done();
      })
		});

	});



});
