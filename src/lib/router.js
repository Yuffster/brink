var http    = require('http'),
    url     = require('url'),
    sys     = require('util'),
    Reactor = require('./reactor'),
    Queue   = require('./queue');

function Router() {

	var routes  = {},
	    reactor;

	var app = http.createServer(function (req, res) {

		res.writeHead(200, {'Content-Type': 'text/html'});

		res.render = function(view, data) {
			res.end(reactor.render(view, data));
		};

		getHandler(req)(req, res);

	});

	function getHandler(req) {

		var path  = url.parse(req.url, true, true),
		    patt, match, esc, meth, i;

		req.get  = path.query;
		req.path = path.pathname;

		for (patt in routes) {

			if (typeof(patt)=="string") {
				esc = patt.replace(/([.?*+\^$\[\]\\(){}|\-])/g, "\\$1");
			}

			match = new RegExp(esc).exec(req.path);

			if (match) {
				for (i in routes[patt]) {
					meth = routes[patt][i].method;
					if (meth == "*" || meth == req.method) {
						return routes[patt][i].handler;
					}
				}
			}

		}

		return function(req,res) {
			res.end("Hello, this was routed. FINALLY.");
		};

	}

	var listenQ = new Queue();

	reactor = new Reactor(listenQ);

	function listen(port) {
		listenQ.push(function() {
			sys.puts("Now listening on port "+port+".");
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

	return {
		listen: listen,
		route: route
	};

}

module.exports = Router;