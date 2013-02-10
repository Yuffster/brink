function Transport(router) {

	var io    = require('socket.io'),
	    users = Brink.require('user_connections');

	function attach(io) {

		io.set('log level', 1);

		io.sockets.on('connection', function (socket) {

			var sessId;
			socket.on('sessionID', function(id) {
				sessId = id;
				users.find(id).addSocket(socket);
			});

			socket.on('disconnect', function() {
				users.find(sessId).removeSocket(socket);
			});

		});

	}

	router.attach(io, attach);

}

module.exports = Transport;