var LABPROJECT_BASE = process.cwd();


var vm_server_controller = require(LABPROJECT_BASE + '/lib/controllers/vm_server_controller');

var should = require("should");

describe('vm_server_controller:', function(){

	describe('list vm servers: ', function(){

		it('should list vm servers', function(done){

			vm_server_controller.list_servers("stuff", function(error, server_list) {
        (error === null).should.equal(true);
        (server_list.length >= 1).should.equal(true);
        console.log(server_list);
        done();
      });

		});


	});
});
