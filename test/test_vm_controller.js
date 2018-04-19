var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = process.cwd() + "/lib";

var test_helper = require(LABPROJECT_BASE + '/test_util/test_helpers');

var config = require(LABPROJECT_BASE + "/config");
var socket_io_transport = require(LABPROJECT_BASE + "/lib/transports/socket_io_transport");
var foreach = require(LABPROJECT_LIB + "/common/loop").foreach;

var should = require("should");

const TINYCORE_URL = "http://distro.ibiblio.org/tinycorelinux/9.x/x86/release/Core-current.iso";
const TEST_VM_ISO = "test-vm-iso";

describe('vm_controller:', function(){

    var server = null;
    var sessions = null;

    var vm_controller;
    var iso_controller;

    var expected_fail = ['guest', 'admin1', 'regular1', 'regular2'];
    var expected_success = ['superuser', 'admin2'];

    var hypervisor = "vbox";
    var test_resources = {
        mem_size: 256,
        cpu_count: 1
    };
    var cd_list = [
        {"bus":"ide", "iso_id": TEST_VM_ISO}
    ];
    var hd_list = [
        {"bus": "sata", "size": 1024, "format": "vdi"}
    ]

    var user_vms = {}

    before(function(done) {
        this.timeout(50000);
        test_helper.generate_environment(function(result) {
            sessions = result;
            server = config.vm_servers.hosts[0];
            socket_io_transport.connect_clients(test_helper.logger, config.vm_servers.hosts, function(error, vm_server_client) {
                vm_controller = require(LABPROJECT_BASE + '/lib/controllers/vm_controller')(vm_server_client, test_helper.logger);
                iso_controller = require(LABPROJECT_BASE + '/lib/controllers/iso_controller')(vm_server_client, test_helper.logger);
                iso_controller.create_iso(sessions['superuser'], TEST_VM_ISO, TINYCORE_URL, function(error, data) {
                    console.log(error);
                    console.log(data);
                    (error === null).should.equal(true);
                    (data === null).should.equal(false);
                    done();
                });
            });
        });
    });

    after(function(done) {
        this.timeout(20000);
        iso_controller.delete_iso(sessions['superuser'], TEST_VM_ISO, function(error, data) {
            test_helper.destroy_environment(function() {
                (error === null).should.equal(true);
                (data === null).should.equal(false);
                done();
            });
        });
    });

    describe('create vms: ', function(){
        this.timeout(30000);
        var expected_fail = [];
        var expected_success = ['superuser', 'regular2'];
        it('should allow superuser and users with create_vms ability to create a vm', function(done) {
            foreach(expected_success, function(loc, controller, pass_data, next) {
                var username = expected_success[loc];
                var vm_name = username + "-test";
                //
                var drive_list = {"cd": cd_list, "hd": hd_list}; 
                var interface_list = [{"connected": true}];
                vm_controller.create_vm(sessions[username], server.name, hypervisor, vm_name, test_resources, interface_list, drive_list, {display: "local"}, function(error, vm_uuid) {
                    setTimeout(function(){
                        (error === null).should.equal(true);
                        user_vms[username] = vm_uuid;
                        next(null, null);
                    }, 5000)
                    
                });
            }, function(error, status) {
                done();
            })
        });
    });

    describe('start vms in maintenance mode: ', function(){
        this.timeout(30000);
        var expected_fail = [];
        var expected_success = ['superuser', 'regular2'];
        it('should allow users to start their own VMs in maintenance mode', function(done) {
            foreach(expected_success, function(loc, controller, pass_data, next) {
                var username = expected_success[loc];
                var vm_uuid = user_vms[username];
                vm_controller.start_vm_maint(sessions[username], vm_uuid, function(error, status) {
                    console.log(error);
                    (error === null).should.equal(true);
                    setTimeout(function(){
                        user_vms[username] = vm_uuid;
                        next(null, null);
                    }, 5000)
                });
            }, function(error, status) {
                done();
            })
        });
    });

    describe('stop the VMs: ', function(){
        var expected_fail = [];
        var expected_success = ['superuser', 'regular2'];
        it('should allow users to stop their own VMs', function(done) {
            foreach(expected_success, function(loc, controller, pass_data, next) {
                var username = expected_success[loc];
                var vm_uuid = user_vms[username];
                vm_controller.shutdown_vm(sessions[username], vm_uuid, function(error, status) {
                    console.log(error);
                    (error === null).should.equal(true);
                    next(null, null);
                });
            }, function(error, status) {
                done();
            })
        });
    });

    describe('delete vms: ', function(){
        var expected_fail = [];
        var expected_success = ['superuser', 'regular2'];
        it('should allow users to delete their own VMs', function(done) {
            foreach(expected_success, function(loc, controller, pass_data, next) {
                var username = expected_success[loc];
                var vm_uuid = user_vms[username];
                vm_controller.delete_vm(sessions[username], vm_uuid, function(error, status) {
                    (error === null).should.equal(true);
                    next(null, null);
                });
            }, function(error, status) {
                done();
            })
        });
    });

});
