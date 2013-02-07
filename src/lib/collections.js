/**
* Hooks into MongoDB to persist data, handles validation and scoping.
*/

var Queue = Brink.require('queue');

var collections = {},
    dbQ = new Queue(),
    db  = new Brink.require('database')(dbQ);

function Collection(name, fields, opts) {

	opts = opts || {};

	var self   = {},
	    parent = self,
	    fields = fields,
	    basep  = opts.base_path || name,
	    paths  = {
			edit   : [basep, '{{id}}', 'edit'],
	    	view   : [basep, '{{id}}'],
	    	update : [basep, '{{id}}'],
	    	create : [basep]
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

	/**
	 * Casts each key value in an object as the type of the relevant
	 * defined field.
	 */
	function cast(val, field) {
		if (!field) for (var k in val) val[k] = cast(val[k], k);
		else return (fields[field]) ? fields[field](val) : val;
	}

	/**
	 * An action (Create, Edit, View, Delete, Index) followed by a method
	 * to determine whether or not the current user is permitted to perform 
	 * that action.
	 *
	 * The system also supports a Push scope, in which items will be
	 * automatically pushed to a given client when the scope parameter is
	 * met.
	 */
	function scope(action, handler) {

	}

	function transform() {

	}

	function validate() {

	}

	/**
     * See criteria.js for criteria information.
	 */
	function find(criteria, callback) {

		if (typeof criteria=="function") {
			callback = criteria;
			criteria = null;
		}

		criteria = criteria || {};

		if (typeof criteria!="object" && typeof criteria!="function") {
			criteria = {id:criteria};
		}

		cast(criteria);

		function run(fn) {
			if (!fn) return;
			db.select(name, criteria, function(e,d) {
				if (d) fn(null, new CollectionSet(d));
				else fn(e, null);
			});
		}

		function watch(fn) {
			//Subscribe to new results to this query.
		}

		if (callback) run(callback);

		return {
			run: run,
			watch: watch
		}

	}

	function find_one(criteria, callback) {

		if (typeof criteria=="function") {
			callback = criteria;
			criteria = null;
		}

		if (typeof criteria!="object" && typeof criteria!="function") {
			criteria = {id:criteria};
		}

		cast(criteria);

		function run(fn) {
			if (!fn) return;
			db.select_one(name, criteria, function(e,d) {
				if (d) {
					fn(null, new CollectionItem(d));
				} else fn(e, null);
			});
		}

		function watch(fn) {
			//Subscribe to new results to this query.
		}

		if (callback) run(callback);

		return {
			run: run,
			watch: watch
		}

	}

	function create(obj, fun) {
		fun = fun || function() { };
		db.insert(name, obj, fun);
	}

	function authorize(field, action) {

	}

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
			'set',
			'data',
			'resource_paths'
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

	}

	function CollectionFilter(criteria) {

		var filters = [criteria];

		function find(criteria) {
			filters.push(criteria);
		}

		function execute(callback) {

		}

		return {
			find: find,
			execute: execute
		}

	}

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

		function update(vals, fun) {
			fun = fun || function() { };
			for (var k in vals) set(k, vals[k]);
			db.update({id:doc.id}, _modified, fun);
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
			authorize : authorize,
			destroy   : destroy,
			get       : get,
			set       : set,
			data      : data,
			resource_paths : resource_paths
		};

	}

	self = { 
		scope     : scope,
		find      : find,
		create    : create,
		authorize : authorize,
		transform : transform,
		validate  : validate,
		find_one  : find_one
	};

	var faces = { 
		find      : ['run', 'watch'],
		find_one  : ['run', 'watch']
	};

	Brink.enqueue(self,faces,dbQ);

	return self;

}

function define(name, fields, options) {
	collections[name] = new Collection(name, fields, options);
	return collections[name];
}

function find(name, criteria, fun) {
	if (typeof criteria!="object" && typeof criteria!="function") {
		criteria = {id:criteria};
	}
	return collections[name].find(criteria, fun);
}

function find_one(name, criteria, fun) {
	if (typeof criteria!="object" && typeof criteria!="function") {
		criteria = {id:criteria};
	}
	return collections[name].find_one(criteria, fun);
}

function create(name, fields, fun) {
	return collections[name].create(fields, fun);
}

function update(name, criteria, data, fun) {
	return collections[name].update(criteria, data, fun);
}

function push(name, arr) {
	return collections[name].create(arr);
}

function scope(name, criteria) {

}

self = {
	scope    : scope,
	find     : find,
	filter   : find,
	find_one : find_one,
	create   : create,
	push     : push,
	define   : define
};

module.exports = self;