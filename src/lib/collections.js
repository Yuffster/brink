/**
* Hooks into MongoDB to persist data, handles validation and scoping.
*/

var Queue = Brink.require('queue');

var collections = {},
    db  = require('mongodb').MongoClient,
    dbQ = new Queue(),
    conn;

// Connect to the db
db.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
	conn = db;
	dbQ.trigger();
});

function Collection(name, fields, opts) {

	opts = opts || {};

	var self   = {},
	    parent = self,
	    fields = fields,
	    basep  = opts.base_path || name,
	    paths  = {
	    	edit   : [basep, '{{id}}', 'edit'],
	    	view   : [basep, '{{id}}'],
	    	update : [basep, '{{id}}']
	    };

	fields.id = Number;

	if (opts.paths) {
		paths = opts.paths;
	}

	function _getPaths(d) {
		var o = {}, p, path;
		for(p in paths) {
			path = '/'+paths[p].join('/');
			path = path.replace(/{{(.*)}}/g, function(m,k) {
				return d[k];
			});
			o[p] = path;
		}
		return o;
	}

	function cast(val, field) {
		if (!field) for (var k in val) val[k] = cast(val[k], k);
		else return (fields[field]) ? fields[field](val) : val;
	}

	/**
	 *  An action (Create, Edit, View, Delete, Index) followed by a method
	 *  to determine whether or not the current user is permitted to perform 
	 *  that action.
	 */
	function scope(action, handler) {

	}

	/**
	 * 
	 */
	function find(criteria, fun) {
		if (!fun) {
			fun = criteria;
			criteria = null;
		}
		cast(criteria);
		conn.collection(name).find(criteria).toArray(function(e,d) {
			fun(new CollectionSet(d));
		});

	}

	function find_one(criteria, fun) {
		fun = fun || function() { };
		cast(criteria);
		conn.collection(name).findOne(criteria, function(e,d) {
			console.log(criteria, d);
			fun(new CollectionItem(d));
		});
	}

	function create(obj, fun) {
		fun = fun || function() { };
		console.log("Creating", name, "with", obj);
		conn.collection(name).insert(obj, fun);
	}

	function authorize() {

	}

	self = { 
		scope     : scope,
		find      : find,
		create    : create,
		authorize : authorize,
		find_one  : find_one
	};

	// Basic set pass-through.
	function CollectionSet(items) {

		if (!items || !items.length) return null;

		for (var i in items) items[i] = new CollectionItem(items[i]);

		var itemAPI = [
			'update',
			'validate',
			'authorize',
			'destroy',
			'hash',
			'get',
			'set'
		], self = {};

		for (i in itemAPI) {
			(function(meth) {
				var meth = itemAPI[i];
				self[itemAPI[i]] = function() {
					for (var i in items) {
						items[i][meth].apply(items[i], arguments);
					}
				}
			})(itemAPI[i]);
		}

		self.data = function() {
			var ret = [];
			for (i in items) ret.push(items[i].data());
			return ret;
		}

		self.count = function() {
			return items.length;
		}

		return self;

	};

	function CollectionItem(doc) {

		var _raw = doc, _modified = {};

		function get(k,v) {
			return _modified[k] || _raw[k];
		}

		function set(k,v) {
			if (!fields[k]) return false;
			v = cast(v,k);
			if (v==get(k)) return;
			_modified[k] = v;
		}

		function authorize(user, action) {

		}

		function update(vals, fun) {
			fun = fun || function() { };
			for (var k in vals) set(k, vals[k]);
			conn.collection(name).update({_id:doc._id}, data(), fun);
		}

		function validate() {

		}

		function authorize(user, action) {

		}

		function save() {

		}

		function destroy() {

		}

		function hash() {

		}

		function data() {
			var o = {}, paths;
			for (var k in _raw) o[k] = _modified[k] || _raw[k];
			paths = _getPaths(o);
			for (var p in paths) o[p+'_path'] = paths[p];
			return o;
		}

		function resource_paths() {
			return _getPaths(data());
		}

		return {
			update    : update,
			validate  : validate,
			authorize : authorize,
			destroy   : destroy,
			hash      : hash,
			get       : get,
			set       : set,
			data      : data,
			resource_paths : resource_paths
		};

	}

	return self;

}

function define(name, fields) {
	collections[name] = new Collection(name, fields);
}

function find(name, criteria, fun) {
	if (typeof criteria!="object" && typeof criteria!="function") {
		criteria = {id:criteria};
	}
	return collections[name].find(criteria, fun);
}

function find_one(name, criteria, fun) {
	if (typeof criteria!="object") criteria = {id:criteria};
	return collections[name].find_one(criteria, fun);
}

function create(name, fields, callback) {
	return collections[name].create(fields, callback);
}

function update(name, criteria, data, fun) {

}

function push(name, arr) {
	return collections[name].create(arr);
}

function scope(name, criteria) {

}

self = {
	define   : define,
	scope    : scope,
	find     : find,
	find_one : find_one,
	create   : create,
	push     : push
};

Brink.enqueue(self, dbQ);

module.exports = self;