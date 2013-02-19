module.exports = function () {

	var _saved = {
		app_js      : '/js/client_require.js',
		socket_js   : '/socket.io/socket.io.js',
		template_js : '/_js/templates.js'
	};

	return function(k,v) {
		if (typeof v === "undefined") return _saved[k] || null;
		else _saved[k] = v;
	};

};