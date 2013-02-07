/**
 * MongoDB Driver
 */

function Database(callback) {

	var db  = require('mongodb').MongoClient,
		dbQ = new Brink.require('queue')(),
		conn;

	(function (callback) {

		// Connect to the databse.
		db.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
			conn = db;
			Brink.callback(callback);
			dbQ.trigger();
		});

	})(callback);

	function select(name, criteria, callback) {
		callback = callback || function() { };
		conn.collection(name).find(criteria).toArray(callback);
	}

	function select_one(name, criteria, callback) {
		callback = callback || function() { };
		conn.collection(name).findOne(criteria, callback);
	}

	function insert(name, data, fun) {
		fun = fun || function() { };
		conn.collection(name).insert(obj, fun);
	}

	function update(name, criteria, data, fun) {
		fun = fun || function() { };
		conn.collection(name).update(criteria, data, fun);
	}

	function destroy(name, criteria) {
		conn.collection(name).remove(criteria, 1);
	}

	function define(name, properties, options) {

	}

	var self = {
		select: select,
		select_one: select_one,
		insert: insert,
		update: update,
		destroy: destroy,
		define: define
	};

	Brink.enqueue(self, dbQ);

	return self;

}

module.exports = Database;