/**
 * Transports
 * 
 * So, the point of these two classes is to make sure that any object within
 * a document gets automatically updated when it changes, and that the client
 * and the server both have the same version.
 *
 * We want to make sure that this handles the scenario where the connection
 * between client and server is dropped and another server picks up. We can
 * assume the client missed a few message updates in the interim.
 *
 * We also don't want to be pushing massive amounts of data around, so we're
 * keeping track of which objects are being displayed on which clients.
 *
 * TODO: Make this work for distributing across multiple Brink.js instances.
 */

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