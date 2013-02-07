/**
 * Brink.Reactor
 *
 * Basic reactive document handler which finds all the HTML in a given
 * app directory and parses it to find screens, templates, and layouts.
 *
 * It then generates an empty HTML document with all the Brink client scripts
 * injected into the top of the <head>, followed by any content placed into
 * user-defined <head> sections (for example, CDN links), followed by all
 * the user-defined application scripts.
 *
 * That file gets pushed out to the browser, and from then on, the client
 * will render data updates by replacing <body> with the newly generated
 * content. <body> is also given the id of the screen name.
 *
 * Note that Reactor doesn't bind itself to the data; you'll need to 
 * create an event handler for your data system and add a call to the
 * Reactor document.
 *
 * Inititialization:
 *
 * 	new Reactor([path,] callback);
 *
 * If no path is specified, it will default to the current working directory.
 *
 * The callback will be passed errors (or null) followed by the compiled 
 * Reactor document with two public methods, render and update.
 *
 * Public Methods:
 *
 *  render(screen, data);
 *
 *  update(data);
 *
 *  attach(router);
 *
 * Todo:
 *
 * Concept of something more granular than screens. The client should be 
 * able to specify a parent node for rendering within an existing screen
 * instead of blowing away <body> every time, and the server should be
 * able to reproduce the same state given the same parameters.
 */

var fs     = require('fs'),
    jsdom  = require('jsdom'),
    glob   = require('glob'),
    path   = require('path'),
    assets = new Brink.require('assets')();

Mustache = Brink.require("mustache");

function Reactor(dir, fun) {

	var screens   = {}, 
	    layouts   = {},
	    partials  = {},
	    doc, current_screen, head;

	var self = {};

	(function constructor(dir) {
		if (!fun) {
			fun  = dir;
			dir = "";
		}
		if (Brink.server) {
			parseHTML(dir, function(e,html) {
				compile();
				Brink.callback(fun, self);
			});
		} else {
			compile();
			Brink.callback(fun, self);
		}
	}(dir));

	function parseHTML(dir, fun) {

		dir = path.join(dir, '*.html');

		var files  = [];

		glob.sync(dir).forEach(function(f) {
			files.push(f);
		});

		(function next() {

			var file = files.shift();

			if (!file) {
				if (fun) fun(self);
				return;
			}

			var html  = fs.readFileSync(file, 'utf8');

			//Cheap hack; jsdom seems to discard the > when it parses the
			//raw HTML.
			function esc(s)   { return s.replace(/\{\{>/g, '{{&gt;'); }
			function unesc(s) { return s.replace(/\{\{&gt;/g, '{{>'); }

			html = esc(html);

			function domStuff(errors, window) {

				function tags(t) {

					var d = window.document.getElementsByTagName(t);
					
					//~ That's right, it's a public API for an internal
					//~ method of an internal method of an internal
					//~ method that only gets used once. Problem?
					return {
						each: function(fun) {
							Array.prototype.forEach.call(d, fun);
						}
					};

				}

				tags('screen').each(function(el) {
					var content = unesc(el.innerHTML);
					screens[el.getAttribute('name')] = content;
				});

				tags('template').each(function(el) {
					partials[el.getAttribute('name')] = unesc(el.innerHTML);
				});

				tags('layout').each(function(el) {
					var k = el.getAttribute('name') || '_main';
					layouts[k] = unesc(el.innerHTML);
				});

				tags('head').each(function(el) {
					head = el.innerHTML;
				});

				next();

			}

			jsdom.env({
				html: html,
				done: domStuff
			});

		}());

	}

	function compile() {

		if (doc) return doc;

		var html;

		//The first render of the application is always server-side and static.
		function staticRender(body) {

			var base    = Brink.path('templates', 'application.html'),
			    content = fs.readFileSync(base, 'utf8');

			var data = {
				head: head
			};

			data.body = body;
			data.screen_name  = current_screen;
			data.app_js  = assets.getAppScripts();
			data.core_js = assets.getCoreScripts();

			data.body = Mustache.render(layouts._main, data);

			html = Mustache.render(content, data);

			return html;

		}

		doc = {
			render: staticRender
		};

		return doc;

	}

	function render(screen, data) {
		current_screen = screen;
		var content = Mustache.render(screens[screen], (data||{}), partials);
		return doc.render(content);
	}

	function update(data) {
		return render(current_screen, data);
	}

	function attach(router) {

		router.route('/js/app/_templates.js', function(req,res) {

			var data = "";

			data += "window.__brink_templates = ";

			data += JSON.stringify({
				screens: screens,
				layouts: layouts,
				partials: partials
			});

			data += ";";

			res.end(data);

		});

	}

	self = {
		render : render,
		update : update,
		attach : attach
	};

	return self;

}

module.exports = Reactor;