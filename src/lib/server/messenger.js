/**
 * Any AMQP-compatible messaging server should work for serving apps.
 * We're using a very simple fanout to send messages to waiting
 * clients.
 *
 * While in the future we'd like to use more of AMQP's features, for now
 * we're just sending every client every message in JSON format and letting
 * them filter.
 */
 
var amqp = require('amqp');

function Messenger(o) {

	o = o || {};

	var options = {
		host: 'localhost',
		port: 5672,
		durable: false,
		type: 'fanout',
		name: 'brimstone-amqp'
	}

	for (var k in options) {
		if (o[k]) options[k] = o[k];
	}

	var conn, exchange;

	function Exchange() {

		var self,
		    opts = {},
		    queue
		;

		function setup() {
			queue = new Queue(self);
		}

		return self = conn.exchange(options.name, options, setup);

	}

	function Queue() {

		var queue, messages = [], handlers = [];

		function setup() {
			queue.subscribe(handleMessage);
			queue.bind(exchange.name, '');
		}

		function handleMessage(m) {
			handlers.forEach(function(fun) {
				fun(m);
			});
		}

		return queue = conn.queue('', {}, setup);

	}

	function launch() {

		console.log("Connecting to "+options.host+":"+options.port);

		conn = amqp.createConnection({ host: options.host, port: options.port });

		conn.on('error', function(e) {
			console.error("\033[31mERROR\033[0m: Couldn't connect to the AMQP server.");
			console.error("\t"+e);
			process.exit();
		});

		conn.on('ready', function() { 
			exchange = new Exchange();
		});

	}

	var handlers = [];

	function bind(handler) {
		handlers.push(handler);
	}

	return {
		launch: launch,
		bind: bind,
		listen: listen
	}

}

module.exports = Messenger;