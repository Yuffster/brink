/* Loads scripts and CSS from the library. */

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
	
	function attachScripts(app, cb) {

		var scripts = [];
		getModuleTemplate(function(e,template) {
			getModules(function(e, modules) {
				modules.forEach(function(module) {
					scripts.push(module.path);
					module.content = module.content;
					app.route(module.path, function(req, res) {
						res.writeHead(200, {'Content-Type': 'application/javascript'});
						res.end(Mustache.render(template, module));
						cb(null);
					});
				});
				cb(null,scripts);
			});
		});

	}

	function packJs(cb) {

		var content = [];

		getModules(function(e, modules) {

			fs.readFile(Brink.path('templates/_module.js'), 'utf-8',  function(e,_module) {

				fs.readFile(Brink.path('templates/modules.js'), 'utf-8', function(e,tmp){
					
					modules.forEach(function(mod){
						content.push(Mustache.render(_module, mod));
					});

					cb(null, Mustache.render(tmp, {modules:content.join(',')}));

				});

			});

		});

	}

	function getModules(cb) {

		var files = [], modules = [];

		function next() {

			var file = files.shift();

			if (!file) return cb(null, modules);

			if (!file) {
				cb(null, modules);
			}

			fs.readFile(file, 'utf-8', function (err, f) {
				modules.push({
					path:path.relative(Brink.path(),file),
					content:f,
					name:path.basename(file, '.js')
				});
				next();
			});

		}

		glob(Brink.path('lib', '*.js'), function(e,f) {
			files = f;
			next();
		});

	}

	function attach(app) {

		attachScripts(app,function(scripts) {
			app.route('/brink/brink.js', function(req, res) {
				res.writeHead(200, {'Content-Type': 'application/javascript'});
				packJs(function(e,d) { res.end(d); });
			});
		});


	}

	return {
		attach: attach
	};

}

module.exports = Assets;