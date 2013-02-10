function Transport(router) {

	var socket,
	    storage = Brink.require('amplify.store').store;

	function attach() {

		var host = window.location.protocol+'//'+window.location.host;

		socket = io.connect(host);

		socket.on('connect', function() {

			// Store the session ID in the local datastore.
			var sessionID = storage('_sessionID');
			if (!sessionID) {
				storage('_sessionID', require('uuid-v4')());
				sessionID = storage('_sessionID');
			}

			// Save the session ID in a cookie as well.
			var cookie = document.cookie.match(/brink_sessionID=([^;]*)/);
			if (!cookie) {
				document.cookie = 'brink_sessionID='+sessionID;
			}

			socket.emit('sessionID', sessionID);

		});

	}

	attach();

}

module.exports = Transport;