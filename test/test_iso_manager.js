var LABPROJECT_BASE = process.cwd();

var user_manager = require(LABPROJECT_BASE + '/lib/managers/user_manager');
var iso_manager = require(LABPROJECT_BASE + '/lib/managers/iso_manager');
var config = require(LABPROJECT_BASE + "/config");
var socket_io_transport = require(LABPROJECT_BASE + "/lib/transports/socket_io_transport");

var should = require("should");

describe('iso_manager:', function(){

    var vm_server_client ;

    before(function(done) {
        host_item = config.vm_servers.hosts[0];
        socket_io_transport.connect_clients(test_logger, config.vm_servers.hosts, function(error, new_client) {
            vm_server_client = new_client;
            iso_manager.initialize(vm_server_client);
            done();
        });
    });

    after(function(){
        vm_server_client.destroy();
    });

    const iso_id = "test-tinycorelinux";
    const test_server = "test";
    const test_owner = "bob";
    const tinycore_url = "http://distro.ibiblio.org/tinycorelinux/8.x/x86/release/Core-current.iso";

    describe('add an iso', function(){

        it('should create a new iso', function(done){
            iso_manager.new_iso(iso_id, function(error, result) {
                (error === null).should.equal(true);
                (result === null).should.equal(false);
                result.get_iso_id().should.equal(iso_id);
                done();
            });
        });

        it('should fail to create a duplicate iso', function(done){
            iso_manager.new_iso(iso_id, function(error, result) {
                (error === null).should.equal(false);
                (result === null).should.equal(true);
                done();
            });
        });

        it('should download an iso', function(done){
            this.timeout(40000);
            iso_manager.get_iso(iso_id, function(error, iso_obj) {
                (error === null).should.equal(true);
                (iso_obj === null).should.equal(false);
                iso_obj.download_http(test_server, tinycore_url, function(d_error, result){
                    (d_error === null).should.equal(true);
                    done();
                });
            });
        });

    });

    describe('get isos', function(){

        it('should get an iso', function(done){
            iso_manager.get_iso(iso_id, function(error, result) {
                (error === null).should.equal(true);
                (result === null).should.be.false;
                result.get_iso_id().should.equal(iso_id);
                done();
            });
        });

        it('should get an iso and save data', function(done){
            iso_manager.get_iso(iso_id, function(error, result) {
                (error === null).should.equal(true);
                (result === null).should.be.false;
                result.set_owner(test_owner);
                result.get_owner().should.equal(test_owner);

                result.get_tags().length.should.equal(0);
                result.add_tag("test_tag");
                result.get_tags().length.should.equal(1);
                result.add_tag("tinycore_test");
                result.get_tags().length.should.equal(2);
                result.remove_tag("test_tag");
                result.get_tags().length.should.equal(1);
                result.add_tag("test_tag");

                result.save(function(s_error, result) {
                    (s_error === null).should.equal(true);
                    result.should.equal(true);
                    done();
                });
            });
        });

        it('should get iso with new data', function(done){
            iso_manager.get_iso(iso_id, function(error, result) {
                (error === null).should.equal(true);
                (result === null).should.equal(false);
                result.get_owner().should.equal(test_owner);
                done();
            });
        });

        it('should list isos', function(done){
            iso_manager.list_isos(function(error, iso_list) {
                (error === null).should.equal(true);
                (iso_list === null).should.equal(false);
                iso_list.length.should.equal(1);
                done();
            });
        });

        it('should list iso by tag', function(done){
            iso_manager.list_isos_by_tags(['tinycore_test', "test_tag"], function(error, iso_list) {
                (error === null).should.equal(true);
                (iso_list === null).should.equal(false);
                iso_list.length.should.equal(1);
                done();
            });
        });

        it('should not get list of isos by nonexistant tag', function(done){
            iso_manager.list_isos_by_tags(['nope'], function(error, iso_list) {
                (error === null).should.equal(true);
                (iso_list === null).should.equal(false);
                iso_list.length.should.equal(0);
                done();
            });
        });

        it('should verify iso is on server', function(done){
            iso_manager.get_iso(iso_id, function(error, iso_obj) {
                (error === null).should.equal(true);
                (iso_obj === null).should.equal(false);
                iso_obj.exists_on_server(test_server, function(t_error, result) {
                    (t_error === null).should.equal(true);
                    (result).should.equal(true);
                    done();
                });
            });
        });

    });

    describe('list isos', function(){

        it('get a list of isos', function(done){
            iso_manager.list_isos(function(error, results) {
                (error === null).should.equal(true);
                (results.length > 0).should.equal(true);
                var found = false;
                for (var i = 0; i < results.length; i++ ) {
                    if (results[i].iso_id == iso_id) {
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
            iso_manager.get_iso(iso_id, function(error, iso_obj) {
                (error === null).should.equal(true);
                (iso_obj === null).should.equal(false);
                iso_obj.delete_on_server(test_server, function(error, result) {
                    (error === null).should.equal(true);
                    iso_obj.exists_on_server(test_server, function(t_error, result) {
                        (t_error === null).should.equal(true);
                        (result).should.equal(false);
                        done();
                    });
                });
            });
            
        });

        it('delete iso', function(done){

            iso_manager.delete_iso(iso_id, function(error, result) {
                (error === null).should.equal(true);
                result.should.equal(true);
                iso_manager.get_iso(iso_id, function(error, result) {
                    (error === null).should.equal(false);
                    (result === null).should.equal(true);
                    done();
                });
            });

        });

    });


});
