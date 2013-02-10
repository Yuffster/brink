function Transport(router) {

	var socket,
	    callbacks = {},
	    // Objects indexed by their IDs.
	    manifest  = {},
	    storage   = Brink.require('amplify.store').store;

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

		var sessionID = storage('_sessionID');
		if (!sessionID) {
			storage('_sessionID', require('uuid-v4')());
			sessionID = storage('_sessionID');
		}

		socket.emit('sessionID', sessionID);

		for (evnt in handlers) { socket.on(evnt, handlers[evnt]); }

	}

	attach();

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
		update    : update,
		put       : put,
		push      : push,
		pull      : pull,
		subscribe : subscribe
	}

}

module.exports = Transport;