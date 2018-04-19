var LABPROJECT_BASE = process.cwd();

var test_helper = require(LABPROJECT_BASE + '/test_util/test_helpers');

var disk_manager = require(LABPROJECT_BASE + '/lib/managers/disk_manager');
var config = require(LABPROJECT_BASE + "/config");
var socket_io_transport = require(LABPROJECT_BASE + "/lib/transports/socket_io_transport");

var should = require("should");

describe('disk_manager:', function(){

    var vm_server_client;
    var server_name;

    before(function(done) {
        socket_io_transport.connect_clients(test_helper.logger, config.vm_servers.hosts, function(error, new_client) {
            vm_server_client = new_client;
            server_name = config.vm_servers.hosts[0];
            disk_manager.initialize(vm_server_client);
            done();
        });
    });

    after(function(){
        vm_server_client.destroy();
    });

    const TEST_DISK_ID = "test-disk";
    const TEST_DISK_FORMAT = "vdi";
    const TEST_OWNER = "bob";
    const TEST_DISK_SIZE = 512;

    describe('add a disk', function(){

        it('should create a new disk', function(done){
            disk_manager.new_disk(TEST_DISK_ID, TEST_DISK_FORMAT, server_name.name, TEST_DISK_SIZE, function(error, result) {
                (error === null).should.equal(true);
                (result === null).should.equal(false);
                result.get_disk_id().should.equal(TEST_DISK_ID);
                result.get_size().should.equal(TEST_DISK_SIZE);
                done();
            });
        });

        it('should fail to create a duplicate disk', function(done){
            disk_manager.new_disk(TEST_DISK_ID, TEST_DISK_FORMAT, server_name.name, TEST_DISK_SIZE, function(error, result) {
                (error === null).should.equal(false);
                (result === null).should.equal(true);
                done();
            });
        });

        it('should define disk on server', function(done){
            disk_manager.get_disk(TEST_DISK_ID, function(error, disk_obj) {
                (error === null).should.equal(true);
                (disk_obj === null).should.equal(false);
                disk_obj.define_disk(function(d_error, result){
                    (d_error === null).should.equal(true);
                    disk_obj.get_path().should.not.equal("");
                    console.log(disk_obj.get_path());
                    done();
                });
            });
        });

    });

    describe('get isos', function(){

        it('should get a disk', function(done){
            disk_manager.get_disk(TEST_DISK_ID, function(error, result) {
                (error === null).should.equal(true);
                (result === null).should.be.false;
                result.get_disk_id().should.equal(TEST_DISK_ID);
                done();
            });
        });

        it('should get an iso and save data', function(done){
            disk_manager.get_disk(TEST_DISK_ID, function(error, result) {
                (error === null).should.equal(true);
                (result === null).should.be.false;
                result.set_owner(TEST_OWNER);
                result.get_owner().should.equal(TEST_OWNER);
                result.save(function(s_error, result) {
                    (s_error === null).should.equal(true);
                    result.should.equal(true);
                    done();
                });
            });
        });

        it('should get iso with new data', function(done){
            disk_manager.get_disk(TEST_DISK_ID, function(error, result) {
                (error === null).should.equal(true);
                (result === null).should.equal(false);
                result.get_owner().should.equal(TEST_OWNER);
                done();
            });
        });

        it('should verify iso is on server', function(done){
            disk_manager.get_disk(TEST_DISK_ID, function(error, disk_obj) {
                (error === null).should.equal(true);
                (disk_obj === null).should.equal(false);
                disk_obj.exists_on_server(function(t_error, result) {
                    (t_error === null).should.equal(true);
                    (result).should.equal(true);
                    done();
                });
            });
        });

    });

    describe('list isos', function(){

        it('get a list of isos', function(done){
            disk_manager.list_disks(TEST_OWNER, function(error, results) {
                (error === null).should.equal(true);
                (results.length > 0).should.equal(true);
                var found = false;
                for (var i = 0; i < results.length; i++ ) {
                    if (results[i].disk_id == TEST_DISK_ID) {
                        found = true;
                    }
                }
                found.should.equal(true);
                done();
            });
        });

    });


    describe('delete isos', function(){

        it('remove iso from server', function(done){
            disk_manager.get_disk(TEST_DISK_ID, function(error, disk_obj) {
                (error === null).should.equal(true);
                (disk_obj === null).should.equal(false);
                disk_obj.undefine_disk(function(error, result) {
                    (error === null).should.equal(true);
                    disk_obj.exists_on_server(function(t_error, result) {
                        (t_error === null).should.equal(true);
                        (result).should.equal(false);
                        done();
                    });
                });
            });
            
        });

        it('delete iso', function(done){

            disk_manager.delete_disk(TEST_DISK_ID, function(error, result) {
                (error === null).should.equal(true);
                result.should.equal(true);
                disk_manager.get_disk(TEST_DISK_ID, function(error, result) {
                    (error === null).should.equal(false);
                    (result === null).should.equal(true);
                    done();
                });
            });

        });

    });


});
