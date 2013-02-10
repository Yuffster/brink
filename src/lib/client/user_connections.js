var user;

function UserConnection(sessionId) {

	function addSocket() { }
	function removeSocket() { }

	return {
		addSocket: addSocket,
		removeSocket: removeSocket
	}

}

function getOrCreateUser(id) {
	if (!user) user = new UserConnection[id];
}

module.exports = {
	find: getOrCreateUser
}