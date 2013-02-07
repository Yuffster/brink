/**
 * Your basic bread-and-butter Event handler.
 *
 * These are for application-level events, not DOM events.
 *
 * Example:
 *
 * 	events.on('error', {'type':'db'}, function(e) {
 * 		console.log("Oh no, database trouble!", error.message);
 * 	});
 *
 *	events.fire('error', {type:'db', 'message':"Stuff's broke."});
 */

var handlers = {};

/**
 * Dynamic pass-through arguments; the first argument is the type of event
 * and the rest of the arguments are passed on to the handlers.
 */
function fire() {
	if (!handlers[type]) return;
	var a = arguments, type = a.shift();
	handlers[type].forEach(function(fun) {
		fun.apply(fun, a);
	});
}

/**
 * Adds an event handler. The optional middle argument can be an object
 * to match against before running the handler method.
 *
 ~ (I know, I know, optional middle argument, special hell.)
 */
function on(type, crit, handler) {
	var fun = handler;
	if (arguments.length==2) {
		handler = crit;
		crit = null;
	}
	if (crit) {
		fun = function(data) {
			if (!data) return;
			for (var o in crit) if (data[o]!==crit[o]) return;
			handler.apply(handler, arguments);
		};
	}
	if (!handlers[type]) handlers[type] = [];
	this.handlers[type].push(fun);
}

module.exports = {
	fire: fire,
	on: on
};