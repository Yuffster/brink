function Transport(router) {

	var socket,
	    storage = Brink.require('amplify.store').store;

	function attach() {

		var host = window.location.protocol+'//'+window.location.host;

		socket = io.connect(host);

		socket.on('connect', function() {

			var sessionID = storage('_sessionID');
			if (!sessionID) {
				storage('_sessionID', require('uuid-v4')());
				sessionID = storage('_sessionID');
			}

			socket.emit('sessionID', sessionID);

		});

	}

	attach();

}

module.exports = Transport;