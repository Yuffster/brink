var sessions = {};

function UserConnection(sessionId) {

	var sockets = {}, store = {};

	var handlers = {
		'connect': function(socket) {
			sockets[socket.id] = socket;
		}
	}

	function addSocket(socket) {
		for (var evt in handlers) {
			socket.on(evt, function() {
				var args = (arguments.push) ? arguments : [];
				args.push(socket);
				handlers[evt].apply(this, args);
			});
			handlers.connect(socket);
		}
	}

	function removeSocket(socket) {
		delete sockets[socket.id];
		var others = false;
		for (var i in sockets) others = true;
		if (!others) delete sessions[sessionId];
	}

	return {
		addSocket: addSocket,
		removeSocket: removeSocket
	}

}

function getOrCreateSession(id) {
	if (!sessions[id]) sessions[id] = new UserConnection(id);
	return sessions[id];
}

module.exports = {
	find: getOrCreateSession
}