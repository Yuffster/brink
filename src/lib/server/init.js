var path = require('path'),
    fs   = require('fs');

var Brink = global.Brink || {};

Brink.server = true;

Brink.path = function() {
	var args = [__dirname, '..', '..'];
	for (var i in arguments) args.push(arguments[i]);
	return path.join.apply(this, args);
};

Brink.application_path = function() {
	BRINK_ENV = BRINK_ENV || {};
	var args = [BRINK_ENV.application_path];
	for (var i in arguments) args.push(arguments[i]);
	return path.join.apply(this, args);
};

Brink.require = function(p) {
	return require('client_require').require(Brink.path('lib',p+'.js'));
}

Brink.config = new Brink.require('config')();

Brink.config('root_file', BRINK_ENV.root_file);
Brink.config('env', BRINK_ENV.env);

global.Brink = Brink;

module.exports = Brink;