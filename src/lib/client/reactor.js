/**
 * Brink.Reactor (Client-Side)
 *
 * The client-side render functionality. They're separated so we don't waste
 * a lot of bandwidth with all the server-side only stuff. This end of things
 * is a pretty simple interface; you'll want to read server/reactor.js if
 * you're curious as to how it all fits together.
 */

Mustache = Brink.require("mustache");

function Reactor(dir, fun) {

	var templates = window.__brink_templates,
	    screens   = templates.screens, 
	    layouts   = templates.layouts,
	    partials  = templates.partials,
	    doc, current_screen, head;

	var self = {};

	(function constructor(dir) {
		if (!fun) {
			fun  = dir;
			dir = "";
		} Brink.callback(fun, self);
	}(dir));

	function liveUpdate(body) {
		window.document.body.innerHTML = body;
		window.document.body.id = current_screen;
	}

	function render(screen, data) {
		current_screen = screen;
		var content = Mustache.render(screens[screen], (data||{}), partials);
		return liveUpdate(content);
	}

	function update(data) {
		if (!current_screen) {
			current_screen = window.document.getElementsByTagName('body')[0].getAttribute('id');
		}
		// Render the <body> using the new data.
		return render(current_screen, data);
	}

	function attach(router) { }

	self = {
		render : render,
		update : update,
		attach : attach
	};

	return self;

}

module.exports = Reactor;