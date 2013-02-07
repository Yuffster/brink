/**
 * The main Brink.js file doesn't really have a lot of meat in it. It just
 * runs the initializer for client or server (changing require methods and the
 * like where appropriate), then binds all the library modules' interfaces to
 * the Brink.* namespace, which is made global by the initializer.
 */
var Brink;

Brink = (typeof window !== "undefined")
      ? require('client/init') : require('./server/init');

var events      = Brink.require('events');
Brink.fireEvent = events.fire
Brink.addEvent  = events.on;

var enqueue     = Brink.require('enqueue');
Brink.enqueue   = enqueue.enqueue;
Brink.callback  = enqueue.callback;

var router      = new Brink.require('router')();
Brink.route     = router.route;

var Collections = Brink.require('collections');
Brink.define    = Collections.define;
Brink.push      = Collections.push;
Brink.find      = Collections.find;
Brink.find_one  = Collections.find_one;
Brink.create    = Collections.create;

Brink.listen = function(port) {
	if (Brink.server) {
		var assets = new require('./server/assets')();
		assets.attach(router);
	}
	router.listen(port);
}

var transport = new Brink.require('transport')(router);

module.exports = Brink;