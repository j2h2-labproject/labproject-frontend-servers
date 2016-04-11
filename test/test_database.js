var LABPROJECT_BASE = process.cwd();

var database = require(LABPROJECT_BASE + '/lib/util/database');

var should = require("should");

describe('database util functions:', function(){

	describe('insert', function(){

		it('insert a document', function(done){

			database.insert('test', {id: "test", "stuff": "here"}, function(error, result) {
				(error === null).should.equal(true);
				done();
			});

		});


		it('fail to insert document of duplicate key', function(done){

			database.insert('test', {id: "test", "stuff": "here2"}, function(error, result) {
				(error === null).should.equal(false);
				done();
			});

		});


		it('insert a second document', function(done){

			database.insert('test', {id: "test2", "stuff": "here3"}, function(error, result) {
				(error === null).should.equal(true);
				done();
			});

		});

		it('insert a third document', function(done){

			database.insert('test', {id: "test3", "stuff": "here3"}, function(error, result) {
				(error === null).should.equal(true);
				done();
			});

		});


	});

	describe('findOne', function(done){

		it('find a document based on a query', function(){

			database.findOne('test', {"stuff": "here"}, function(error, result) {
				(error === null).should.equal(true);
				result.id.should.equal("test");
				result.stuff.should.equal("here");
				done();
			});

		});

		it('return empty result', function(){

			database.findOne('test', {"stuff": "here-not"}, function(error, result) {
				(error === null).should.equal(true);
				(result === null).should.equal(true);
				done();
			});

		});


	});

	describe('find', function(){

		it('find item based on a query', function(){
			database.find('test', {"stuff": "here3"}, {}, function(error, result) {
				(error === null).should.equal(true);
				result.length.should.equal(2);
				done();
			});
		});

	});

	describe('update', function(){

		it('update an existing document', function(){
			database.update('test', {"stuff": "here"}, {"stuff": "here2"}, false, function(error, result) {
				(error === null).should.equal(true);
				database.find('test', {"stuff": "here2"}, {}, function(error, result) {
					(error === null).should.equal(true);
					result.length.should.equal(1);
					database.find('test', {"stuff": "here"}, {}, function(error, result) {
						(error === null).should.equal(true);
						result.length.should.equal(0);
						done();
					});
				});
			});
		});


	});

	describe('remove', function(){

		it('removes a document with a query', function(done){
			database.remove('test', {"stuff": "here3"}, function(error, result) {
				(error === null).should.equal(true);

				database.find('test', {"stuff": "here3"}, {}, function(error, result) {
					(error === null).should.equal(true);
					result.length.should.equal(0);
					done();
				});
			});
		});

		it('removes all documents', function(done){
			database.remove('test', {}, function(error, result) {
				(error === null).should.equal(true);

				database.find('test', {}, {}, function(error, result) {
					(error === null).should.equal(true);
					result.length.should.equal(0);
					done();
				});
			});
		});


	});

	//~ after(function() {
		//~ database.close();
	//~ });
	//~
});
