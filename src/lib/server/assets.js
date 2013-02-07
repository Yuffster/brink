/*
 * Loads scripts and CSS from the library.
 *
 * This file is super ugly. If you want to contribute, here's a great place
 * to start!
 */

var glob = require('glob'),
    fs   = require('fs'),
    path = require('path'),
    Mustache = require('mustache');

function Assets() {	

	var module_template = '';

	function getModuleTemplate(cb) {

		if (module_template) return cb(null, module_template);

		var file = Brink.path('templates/module-dev.js');

		fs.readFile(file, 'utf-8',  function(e,template) {
			module_template = (template.replace(/\s+/g, " "));
			cb(null, module_template);
		});

	}

	// In development mode, we'll want to create a listener for each module 
	// and output it each time the browser is reloaded.
	function attachScripts(modules, base, app, cb) {

// THIS WHOLE THING IS CRAP.
// I NEED TO ADD THE * WILDCARD OPERATOR TO THE ROUTER AND THEN JUST GRAB THE
// FILES WHEN THEY'RE REQUESTED.

		var scripts = [];
		getModuleTemplate(function(e,template) {
			modules.forEach(function(module) {
				scripts.push(module.path);
				module.content = "\n"+module.content+"\n";
				app.route(path.join(base, module.path), function(req, res) {
					res.writeHead(200, {'Content-Type': 'application/javascript'});
					res.end(Mustache.render(template, module));
					if (cb) cb(null);
				});
			});
			if (cb) cb(null,scripts);
		});

	}

	// In production, we'll prepack each JavaScript file.
	function packJs(modules, cb) {

		var content = [];

		fs.readFile(Brink.path('templates/_module.js'), 'utf-8',  function(e,_module) {

			fs.readFile(Brink.path('templates/modules.js'), 'utf-8', function(e,tmp){

				modules.forEach(function(mod){
					if (mod.path.match(/\/?server\//)) return;
					content.push(Mustache.render(_module, mod));
				});

				var data = {
					modules: content.join(';')
				};

				cb(null, Mustache.render(tmp, data));

			});

		});

	}

	function getModules(p, cb) {

		var files = [], modules = [];

		function next() {

			var file = files.shift();

			if (!file) return cb(null, modules);

			if (!file) {
				cb(null, modules);
			}

			fs.readFile(file, 'utf-8', function (err, f) {
				modules.push({
					path:path.relative(p,file),
					content:f,
					name:path.basename(file, '.js')
				});
				next();
			});

		}

		glob(path.join(p, '**', '*.js'), function(e,f) {
			files = f;
			next();
		});

	}

	function getAllModules(cb) {
		var mods = [];
		getCoreModules(function(e,d) {
			mods = d;
			getAppModules(function(e,d) {
				for (var i in d) mods.push(d[i]);
			});
			cb(null, mods);
		});
	}

	function getAppModules(cb) {
		getModules(Brink.application_path(), cb);
	}

	function getCoreModules(cb) {
		getModules(Brink.path('lib'), cb);
	}

	function getCoreScripts() {
		if (Brink.config('env')=="production") {
			return [{src:'js/brink.js'}];
		}
		var s = getScripts(Brink.path('lib'), 'js/brink');
		s.unshift({src:'js/core/_init.js'});
		s.push({src:'js/app/_templates.js'});
		s.push({src:'socket.io/socket.io.js'});
		s.push({src:'js/core/_brink.js'});
		return s;
	}

	function getAppScripts() {
		if (Brink.config('env')=="production") {
			return [{src:'js/application.js'}];
		}
		var s = getScripts(Brink.application_path(), 'js/app');
		s.push({src:'js/app/_init.js'});
		return s;
	}

	function getScripts(p,web_root) {
		var modules = [];
		glob.sync(path.join(p, "**", "*.js")).forEach(function(file) {
			if (file.match(/\/server\//)) return;
			var base = path.relative(p, file);
			modules.push({
				src:path.join(web_root, base),
				name:base+'.js'
			});
		});
		return modules;
	}

	function attach(app) {

		if (Brink.config('env')=='development') {

			getAppModules(function(e,modules) {
				attachScripts(modules, '/js/app', app);
			});

			getCoreModules(function(e,modules) {
				attachScripts(modules, '/js/brink', app);
			});

			app.route('/js/app/_init.js', function(req, res) {
				var f = path.relative(Brink.application_path(), Brink.config('root_file'));
				res.writeHead(200, {'Content-Type': 'application/javascript'});
				res.write("Brink._creq('"+f+"');");
				res.end();
			});

			app.route('/js/core/_init.js', function(req,res) {
				res.writeHead(200, {'Content-Type': 'application/javascript'});
				fs.readFile(Brink.path('templates/_init.js'), 'utf-8',  function(e,data) {
					res.end(data);
				});
			});

			app.route('/js/core/_brink.js', function(req, res) {
				res.writeHead(200, {'Content-Type': 'application/javascript'});
				res.write("Brink = Brink._creq('brink');");
				res.end();
			});


		} else {

			app.route('/js/brink.js', function(req, res) {
				res.writeHead(200, {'Content-Type': 'application/javascript'});
				getCoreModules(function(e,d) {
					fs.readFile(Brink.path('templates/_init.js'), 'utf-8',  function(e,data) {
						res.write(data);
						packJs(d, function(e,d) {
							res.write(d);
							res.write("Brink = Brink._creq('brink');")
							res.end();
						});
					});
				});
			});

			app.route('/js/application.js', function(req, res) {
				res.writeHead(200, {'Content-Type': 'application/javascript'});
				getAppModules(function(e,d) {
					packJs(d, function(e,d) { res.end(d); });
				});
			});

		}


	}

	return {
		attach: attach,
		getAppScripts: getAppScripts,
		getCoreScripts: getCoreScripts
	};

}

module.exports = Assets;