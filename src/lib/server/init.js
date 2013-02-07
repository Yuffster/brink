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

Brink.require = function(lib) {

	var p  = Brink.path('lib',lib),
		sp = Brink.path('lib', 'server', lib);

	//If the module doesn't exist, check in the server/ path.
	if (!path.existsSync(p+'.js') && path.existsSync(sp+'.js')) p = sp;

	return require(p);

};

Brink.config = new Brink.require('config')();

Brink.config('root_file', BRINK_ENV.root_file);
Brink.config('env', BRINK_ENV.env);

global.Brink = Brink;

module.exports = Brink;