var Brink = Brink || {};

(function env() {

	var modules = {};

	if (typeof window !== "undefined") {

		Brink.client = true;

		Brink.path = function(p) {
			var args = [];
			for (var i in arguments) args.push(arguments[i]);
			return args.join('/');
		};

		Brink._cexp = function(path, mod) {
			modules[path] = mod;
		};

		Brink._creq = function(path) {
			if (modules[path+'.js']) return modules[path+'.js']();
			else console.error("Can't find module "+path);
		}

		window.Brink = Brink;

	} else {

		var path = require('path');

		Brink.server = true;

		Brink.path = function() {
			var args = [__dirname, '..'];
			for (var i in arguments) args.push(arguments[i]);
			return path.join.apply(this, args);
		};

		global.Brink = Brink;
		
	}

}());

Brink.require = function(lib) {
	return require(Brink.path('lib',lib));
};

var Queue = Brink.require("queue");

Brink.callback = function(e,d) {
	if (e) 
	var i, args = [], fn;
	for (i in arguments) args.push(arguments[i]);
	fn = args.shift();
	if (fn.trigger) fn = fn.trigger;
	if (fn) fn.apply(fn, args);
};

Brink.enqueue = function(wrap,q) {
	var q = q || new Queue(), old = {};
	for (var k in wrap) {
		(function(k) {
			old[k]  = wrap[k];
			wrap[k] = (function() {
				var a = arguments;
				q.push(function() { old[k].apply(old, a); });
			});
		})(k);
	} return q;
}

var router      = new Brink.require('router')(),
    Collections = Brink.require('collections');

Brink.route     = router.route;
Brink.listen    = router.listen;

Brink.define    = Collections.define;
Brink.push      = Collections.push;
Brink.find      = Collections.find;
Brink.find_one  = Collections.find_one;
Brink.create    = Collections.create;

if (Brink.server) {
	var assets = new require('./server/assets')();
	assets.attach(router);
}

var transport = new Brink.require('transport')(router);

module.exports = Brink;