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
 * Return the event handler that was added so that it can be removed later
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
  return fun;
}

/**
 * Remove an event handler, given the handler type and the handler itself.
 * If the handler is unspecified, remove all of the handlers for the 
 * given type.
 */
function deregister(type, handler) {
	if(handlers[type]) {
    if (arguments.length>1) {
		  var tmp = handlers[type];
		  handlers[type] = [];
		  for (var i in tmp) {
		  	if (tmp[i]!==handler) handlers[type].push(tmp[i]);
		  }
    } else {
      handlers[type] = [];
    }
	}
}

module.exports = {
	fire: fire,
	on: on,
	deregister: deregister
};
