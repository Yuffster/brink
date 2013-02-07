/** 
 * A new user object is returned to the Brink 'connection' event for each new 
 * user in the database, once the handshake has been completed and the session
 * has been established.
 *
 * Note that users won't be automatically logged in. To log in a user, you can
 * do something like set a user_id session variable.
 */
function CurrentUser() {

	var self = {};

	// Retrieves a value from this user's session data.
	function get(key, def) {

	}

	// Sets a value to this user's session data.
	function set(key, value) {

	}

	function unset(key) {

	}

	/**
	 * Subscribes a user to the results of a particular CollectionItem or 
	 * CollectionFilter.
	 *
	 * Whenever new items are available, the data will be pushed to the 
	 * user's browser.
	 *
	 * Will automatically unsubscribe when disconnected.
	 */
	function subscribe(filter, fun) {

	}

	function attach(key, item) {
		store[key] = item;
		subscribe(item, function() {
			store[key] = item;
		});
	}

	/**
	 * Removes subscriptions and cleans up the user.
	 */
	function disconnect() {
	}

	return {
		subscribe: subscribe,
		set: set,
		get: get,
		unset: unset,
		disconnect: disconnect
	};

}

module.exports = CurrentUser;