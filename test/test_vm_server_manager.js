var LABPROJECT_BASE = process.cwd();


var vm_server_manager = require(LABPROJECT_BASE + '/lib/managers/vm_server_manager');


var should = require("should");

describe('vm_server_manager:', function(){

	describe('list vm servers: ', function(){

		it('should list vm servers', function(done){

			vm_server_manager.list_servers(function(error, server_list) {
        (error === null).should.equal(true);
        (server_list.length >= 1).should.equal(true);
        console.log(server_list);
        done();
      });

		});


	});
});
