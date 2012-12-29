var Brink = Brink || {};

(function env() {

	var window = window || false;

	if (!window) {

		var path = require('path');

		Brink.server = true;

		Brink.require = function(lib) {
			return require(Brink.path('lib',lib));
		};

		Brink.path = function() {
			var args = [__dirname, '..'];
			for (var i in arguments) args.push(arguments[i]);

			return path.join.apply(this, args);
		}

		Brink.callback = function() {
			var i, args = [], fn;
			for (i in arguments) args.push(arguments[i]);
			fn = args.shift()
			if (fn.trigger) fn = fn.trigger;
			if (fn) fn.apply(fn, args);
		}

		global.Brink = Brink;
		
	}

}());

function delegate(apiName, handler) {
	Brink[apiName] = function() { handler.apply(this, arguments); }
}

var Router = Brink.require('router'),
    router = new Router();

delegate('route',  router.route);

if (Brink.server) {
	delegate('listen', router.listen);
}

module.exports = Brink;