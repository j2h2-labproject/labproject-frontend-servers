var LABPROJECT_BASE = process.cwd();

var socket_io_transport = require(LABPROJECT_BASE + "/lib/transports/socket_io_transport");
var test_helper = require(LABPROJECT_BASE + '/test_util/test_helpers');
var iso_manager = require(LABPROJECT_BASE + '/lib/managers/iso_manager');
var config = require(LABPROJECT_BASE + "/config");
var logging = require(LABPROJECT_BASE + "/lib/common/logging");



var should = require("should");

describe('iso_controller: ', function(){

    const tinycore_url = "http://distro.ibiblio.org/tinycorelinux/8.x/x86/release/Core-current.iso";
    const iso_id = "test-controller-iso";
    var sessions;
    var vm_server_client;
    var iso_controller;
    var test_logger = new logging.logger("INNER_SERVER", "cli");

    before(function(done) {
        test_helper.generate_environment(function(result) {
            sessions = result;
            
            socket_io_transport.connect_clients(test_logger, config.vm_servers.hosts, function(error, new_client) {
                vm_server_client = new_client;
                iso_controller = require(LABPROJECT_BASE + '/lib/controllers/iso_controller')(vm_server_client, test_logger);
                done();
            });
        });
    });

    after(function(done) {
        test_helper.destroy_environment(function() {
            vm_server_client.destroy();
            done();
        });
    });


    describe('create_iso: ', function() {

        it('should fail to create iso due to permissions for guest', function(done){
            iso_controller.create_iso(sessions['guest'], "failed-iso", tinycore_url, function(error, data) {
                (error === null).should.equal(false);
                error.message.should.equal("Permission denied");
                done();
            });
        });

        it('should create lab for regular2', function(done){
            this.timeout(40000);
            iso_controller.create_iso(sessions['regular2'], iso_id, tinycore_url, function(error, data) {
                (error === null).should.equal(true);
                (data === null).should.equal(false);
                done();
            });
        });
    });

    describe('list_isos: ', function() {

        it('should list isos for user regular2', function(done){
            iso_controller.list_isos(sessions['regular2'], function(error, data) {
                (error === null).should.equal(true);
                data.length.should.equal(1);

                done();
            });
        });

    });

    describe('delete_iso: ', function() {
        it('should not delete iso not owned by admin1', function(done){
            iso_controller.delete_iso(sessions['admin1'], iso_id, function(error, data) {
                (error === null).should.equal(false);
                error.message.should.equal("Permission denied");
                done();
            });
        });

        it('should delete iso owned by regular2', function(done){
            iso_controller.delete_iso(sessions['regular2'], iso_id, function(error, data) {
                (error === null).should.equal(true);
                (data === null).should.equal(false);
                done();
            });
        });
    });

});
