var Reactor = Brink.require('reactor'),
    Queue   = Brink.require('queue'),
    http    = Brink.require('http');

function Router() {

	var self,
	    routes  = {},
	    reactor,
	    app, 
	    listenQ,
	    //The asset server will callback with script URLs to add to head.
	    scripts = [];

	listenQ = new Queue();
	reactor = new Reactor(listenQ);

	app = new http(function (req, res) {

		res.writeHead(200, {'Content-Type': 'text/html'});

		res.render = function(view, data) {
			res.end(reactor.render(view, data));
		};

		var handler = getHandler(req);

		if (handler) {
			handler(req, res);
		} else {
			res.writeHead(404);
			res.end();
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

	self = {
		listen: listen,
		route: route
	}

	Brink.enqueue(self, listenQ);

	self.http = app.raw;

	return self;

}

module.exports = Router;