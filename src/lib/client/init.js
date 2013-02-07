var Brink = window.Brink || {};

Brink.client = true;

Brink.path = function(p) {
	var args = [];
	for (var i in arguments) args.push(arguments[i]);
	return args.join('/');
};

Brink.application_path = function() {
	var args = [];
	for (var i in arguments) args.push(arguments[i]);
	return args.join('/');
}

Brink.environment = function(m) {
	if (m=='client') return true;
	if (m) return false;
	return m;
}

Brink.require = function(lib) {
	return require(lib);
};

Brink.config = Brink.require('config');

window.Brink = Brink;

module.exports = Brink;