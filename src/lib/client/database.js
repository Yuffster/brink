/**
 * Client-side database driver.  An empty interface for now.
 */

function Database(callback) {

	(function (callback) {

		Brink.callback(callback);

	})(callback);

	function select(name, criteria, callback) {
		callback = callback || function() { };
		callback(null, []);
	}

	function select_one(name, criteria, callback) {
		callback = callback || function() { };
		callback(null, {});
	}

	function insert(name, data, callback) {
		callback = callback || function() { };
		callback(null);
	}

	function update(name, criteria, data, fun) {
		callback = callback || function() { };
		callback(null);
	}

	function destroy(name, criteria) {
		callback = callback || function() { };
		callback(null);
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