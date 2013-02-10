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

	var io       = require('socket.io'),
	    self     = {},
	    // UserConnection objects indexed by sessionId.
	    users    = {},
	    // sessionIds indexed by objectId, to determine if a session is
	    // subscribed to an object.
	    manifest = {},
	    // objectIds indexed by sessionId.
	    sessions = {};

	function UserConnection(sessionId) {

		var sockets = {}, store = {};

		// Wraps a client-side function name into a callback emit which 
		// will be picked up by the client and executed.
		function _callback(fnName) {
			return function(e,data) {
				socket.emit('cb', {err:e, data: data, fn: fnName});
			};
		}

		// Shortcut to get or create a manifest of object IDs for a user
		// indexed by session ID.
		function _user() {
			if (!users[sessionId]) users[sessionId] = [];
			return users[sessionId];
		} 

		// Shortcut to get or create an entry in the manifests to store
		// session IDs of users subscribed to that item.
		function _manifest(objId) {
			if (!manifest[objId]) manifest[objId] = []
			return manifest[objId];
 		}

	 	// Adds an item to the user's manifest so that all changes to that
	 	// item will be pushed to the user through the socket connection.
	 	function subscribe(objId) {
	 		if (!manifest[objId]) manifest[objId] = [];
	 		manifest[objId].push(sessionId);
	 		users[sessionId].push(objId);
	 	}

	 	function unsubscribe(objId,flush) {
	 		var sess  = sessions[sessionId] || [],
	 		    slice = _manifest(objId).indexOf(sessionId);
	 		if (slice>-1) _manifest(objId).slice(slice,slice);
	 		if (flush) return;
	 		slice = sess.indexOf(objId);
		 	if (slice>-1) users[sessionId].slice(slice,slice)
	 	}

	 	// Checks to see if the user has a particular object (by UUID)
	 	// on their local client.
	 	function subscribed(objId) {
	 		return (_manifest(objId).indexOf(sessionId) > -1);
	 	}

	 	// Clears the user's subscriptions.
	 	function flush() {
	 		var sess  = sessions[sessionId] || [];
	 		for (var i in sess) unsubscribe(sess[i], true);
	 		sessions[sessionId] = [];
	 	}

	 	function push() {
	 		//Sends data down the pipe.
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

	 	var handlers = {
	 		'connect': function(socket) {
	 			sockets[socket.id] = socket;
	 		},
	 		'set': function(key, value) {
	 			store[key] = value;
	 		}
	 	}

	 	return {
	 		addSocket: addSocket,
	 		removeSocket: removeSocket,
	 		subscribe: subscribe,
	 		unsubscrive: unsubscribe,
	 		flush: flush,
	 		push: push
	 	}

	}

	function attach(io) {

		io.set('log level', 1);

		io.sockets.on('connection', function (socket) {

			var sessId;
			socket.on('sessionID', function(id) {
				sessId = id;
				if (!sessions[id]) {
					sessions[id] = new UserConnection(id);
				} sessions[id].addSocket(socket);
			});

			socket.on('disconnect', function() {
				sessions[sessId].removeSocket(socket);
			});

		});

	}

	router.attach(io, attach);

}

module.exports = Transport;