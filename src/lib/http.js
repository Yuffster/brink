/* A client/server-side clone of the main Node.js HTTP module. */

function Request(url, data) {

	var post=data.body, path, get = {}, m;

	if (!url) {
		url = window.location.toString();
	}

	if (!url.match(/^\//)) url = "/"+url;

	m = url.split('?');

	path = m[0];
		
	if (m[1]) {

		m[1].replace(
		    /([^&?=]+)=([^&]*)?/g,
		    function(m, k, val) { get[k] = decodeURIComponent(val); }
		);

	}

	return {
		get    : get,
		post   : post,
		params : {},
		path   : path,
		files  : null,
		method : data.method.toLowerCase(),
		headers: data.headers
	};

}

function Response() {


	function end() {
		
	}

	function writeHead() {
	}

	return {
		end: end,
		writeHead: writeHead
	};

}

function ClientHTTP(handler) {

	window.onhashchange = function() {
		var url = window.location.hash.substring(1);
		handler(new Request(url), new Response());
	};

	function listen() {

	}

	return {
		listen: listen
	};

}

function ServerHTTP(handler) {

	var sys     = require('util'),
	    connect = require('connect'),
	    app     = connect();

	app.use(connect.bodyParser());

	app.use(function (req, res) {

		var data = {}, breq, bres;

		data.method  = req.method;
		data.headers = req.headers;
		data.body    = req.body;

		breq = new Request(req.url, data);
		bres = new Response();

		res.writeHead(200, {'Content-Type': 'text/html'});

		handler(breq,res);

	});

	function listen(port) {
		sys.puts("Now listening on port "+port+".");
		app.listen(port);
	}

	return {
		listen: listen,
		raw: app
	};

}

module.exports = (Brink.server) ? ServerHTTP : ClientHTTP;