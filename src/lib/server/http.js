var Request  = Brink.require('request'),
    Response = Brink.require('response');

function HTTP(handler) {

	var sys     = require('util'),
	    connect = require('connect'),
	    app     = connect(),
	    server  = require('http').createServer(app),
	    Queue   = Brink.require('queue'), 
	    users   = Brink.require('user_connections');

	app.use(connect.bodyParser())
	   .use(connect.cookieParser('optional secret string'))

	app.use(function (req, res, next) {

		var session = req.cookies.brink_sessionID;

		var data = {}, breq, bres;

		data.method  = req.method;
		data.headers = req.headers;
		data.body    = req.body;
		data.user    = (session) ? users.find(session) : false;

		breq = new Request(req.url, data);
		bres = new Response();

		handler(breq,res,next);

	});

	var listenQ = new Queue();

	function listen(port) {
		sys.puts("Now listening on port "+port+".");
		server.listen(port);
		listenQ.trigger();
	}

	function attach(thing,cb) {
		cb = cb || function() { };
		listenQ.push(function() {
			cb(thing.listen(server));
		});
	}

	return {
		listen: listen,
		attach: attach
	};

}

module.exports = HTTP;