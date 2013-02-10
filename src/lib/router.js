var Reactor = Brink.require('reactor'),
    Queue   = Brink.require('queue'),
    http    = Brink.require('http');

function Router() {

	var self,
	    routes  = {},
	    reactor,
	    app, 
	    listenQ;

	listenQ = new Queue();
	reactor = new Reactor(Brink.application_path(), listenQ);

	app = new http(function (req, res, next) {

		res.render = function(view, data) {

			function fun(e,d) {
				if (typeof d.data=="function") {
					d = d.data();
				} else {
					for (var k in d) {
						if (typeof(d[k].data=="function")) d[k] = d[k].data();
					}
				} res.end(reactor.render(view, d));
			}

			if (data) {
				if (data.run) return data.run(fun);
				for (var k in data) {
					// This means we've got some deferred calls hanging out 
					// within our template dataset.  We'll have to wait for
					// each of these calls to complete and then reform the
					// data object.
					var outstanding = 0;
					if (typeof(data[k].run)=="function") {
						outstanding++;
						(function(k) {
							data[k].run(function(e,d) {
								outstanding--;
								data[k] = d;
								if (outstanding==0) fun(e,data);
							});
						})(k);
					}
				}
			} else {
				fun();
			}

		};

		var handler = getHandler(req);

		if (handler) {
			res.writeHead(200, {'Content-Type': 'text/html'});
			handler(req, res);
		} else {
			next();
		}

	});

	function getHandler(req) {

		var keys, patt, esc, match;

		for (patt in routes) {

			keys = [];

			if (typeof(patt)=="string") {
				esc = patt.replace(/([.?*+\^$\[\]\\(){}|\-])/g, "\\$1");
			}

			esc = esc.replace(/:(\w+)/g, function(a,b) {
				keys.push(b);
				return "([^/]*)";
			});

			match = new RegExp('^'+esc+'$').exec(req.path);

			if (match) {
				var o = {}, i;
				for (i=0;i<keys.length; i++) o[keys[i]] = match[i+1];
				req.params = o;
				for (i in routes[patt]) {
					meth = routes[patt][i].method;
					if (meth == "*" || meth == req.method) {
						return routes[patt][i].handler;
					}
				}
			}

		}

	}

	function listen(port) {
		listenQ.push(function() {
			app.listen.apply(app, arguments);
			reactor.attach(self);
		}, arguments);
	}

	// (match, [method,] fun)
	function route(match, method, fun) {
		if (arguments.length==2) {
			fun    = method;
			method = '*';
		}
		routes[match] = routes[match] || [];
		routes[match].push({method:method, handler:fun});
	}

	function attach(thing,cb) {
		app.attach(thing, cb);
	}

	self = {
		listen: listen,
		route: route,
		attach: attach
	}

	if (Brink.server) Brink.enqueue(self, listenQ);

	return self;

}

module.exports = Router;