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

function TransportServer(router) {

	var io       = require('socket.io').listen(router.http),
	    self     = {},
	    // UserConnection objects indexed by sessionId.
	    users    = {},
	    // sessionIds indexed by objectId, to determine if a session is
	    // subscribed to an object.
	    manifest = {},
	    // objectIds indexed by sessionId.
	    sessions = {};

	function UserConnection(socket) {

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

		socket.on('handshake', function(data) {

			//The client needs to provide its session ID which will be linked
			//through middleware to the server-side session of the same ID.

		});

		socket.on('data', function(data) {
			
			var cb;
			if (data.cb) cb = _callback(data.cb);

		});

	 	return {

	 	}

	}

	var handlers = {

		update: function(objId, data, fun) {

		},

		// For creating a new item. The newly-created object from the server will
		// be added to the Manifest.
		put: function(collection, data, fun) {

		},

		// For pushing a set of data not linked to any single item.
		push: function(collection, fun) {

		},

		// For pulling items from a collection which meet the passed criteria.
		pull: function(collection, criteria, fun) {

		},

		// For subscribing to updates to a particular object.
		subscribe: function(objId, fun) {

		}

	};

	function attach(router) {

		io.sockets.on('connection', function (socket) {

			users.push(new UserConnection(socket));

			socket.emit('news', { hello: 'world' });
			for (var evnt in handlers) {
				socket.on(evnt, handlers[evnt]);
			}

		});

	}

	return {
		attach : attach
	}

}

function TransportClient() {

	var socket,
	    callbacks = {},
	    // Objects indexed by their IDs.
	    manifest  = {},
	    Storage   = Brink.require('amplify.store');

	var handlers = {

		cb: function(data) {
			var fun = callbacks[data.fn];
			delete(callbacks[data.fn]);
			if (fun) { fun(data.err, data.data); }
		},

		connect: function() {
			//For reconnection.
		},

		data: function(data) {

		}

	};

	function attach() {

		var host   = window.location.protocol+'//'+window.location.host;

		socket = io.connect(host);

		socket.on('data', function (data) {

		});

		for (evnt in handlers) { socket.on(evnt, handlers[evnt]); }

		socket.emit('data', {wtf:'bbq'});

	}

	// For sending specific data regarding to a Collection item which exists
	// on both the client and the server.
	function update(objId, data) {

	}

	// For creating a new item. The newly-created object from the server will
	// be added to the Manifest.
	function put(collection, data) {

	}

	// For pushing a set of data not linked to any single item.
	function push(collection) {

	}

	// For pulling items from a collection which meet the passed criteria.
	function pull(collection, criteria) {

	}

	// For subscribing to updates to a particular object.
	function subscribe(objId, fun) {

	}

	return {
		attach    : attach,
		update    : update,
		put       : put,
		push      : push,
		pull      : pull,
		subscribe : subscribe
	}

}

module.exports = (Brink.server) ? TransportServer : TransportClient;