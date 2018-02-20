var LABPROJECT_BASE = process.cwd();

var permissions_manager = require(LABPROJECT_BASE + '/lib/managers/permissions_manager');

var should = require("should");

describe('permsissions_manager:', function(){

    describe('add permissions', function(){

        it('create a permission for a user', function(done){

            permissions_manager.new_permissions('test', function(error, result) {
                (error === null).should.equal(true);
                (result === null).should.equal(false);
                done();
            });

        });


        it('fail to create a duplicate permission for a user', function(done){

            permissions_manager.new_permissions('test', function(error, result) {
                (error === null).should.equal(false);
                (result === null).should.equal(true);
                done();
            });

        });


    });

    describe('get permissions', function(){

        it('get permissions', function(done){

            permissions_manager.get_permissions('test', function(error, result) {
                (error === null).should.be.true;
                (result === null).should.be.false;
                result.can_admin_users().should.equal(false);
                done();
            });

        });

        it('get permissions and save data', function(done){

            permissions_manager.get_permissions('test', function(error, result) {
                (error === null).should.be.true;
                (result === null).should.be.false;
                result.set_superuser_status(true);
                result.set_superuser_status('bla');
                result.is_superuser().should.equal(true);
                result.set_can_admin_vms(true);
                result.can_admin_vms().should.equal(true);
                result.save(function(s_error, result) {
                    (s_error === null).should.be.true;
                    result.should.equal(true);
                    done();
                });
                ;
            });

        });

        it('get permissions with new data', function(done){

            permissions_manager.get_permissions('test', function(error, result) {
                (error === null).should.be.true;
                (result === null).should.be.false;
                result.is_superuser().should.equal(true);
                result.can_admin_vms().should.equal(true);
                done();
            });

        });

    });

    describe('delete permissions', function(){

        it('delete permissions', function(done){

            permissions_manager.delete_permissions('test', function(error, result) {
                (error === null).should.be.true;
                result.should.equal(true);
                done();
            });

        });

    });


});
