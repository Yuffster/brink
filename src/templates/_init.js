(function(Brink) {

	var modules = {};

	Brink._cexp = function(path, mod) {
		modules[path] = mod;
	};

	Brink._creq = function(path,relative) {
		if (modules[path+'.js']) {
			return modules[path+'.js'](Brink._creq);
		} else if (modules['client/'+path+'.js']) {
			return modules['client/'+path+'.js'](Brink._creq);
		} else if (modules['node_modules/'+path+'.js']) {
			return modules['node_modules/'+path+'.js'](Brink._creq);
		} else {
			console.log("Can't find module "+path);
		}
	}

	window.mods = modules;

	window.Brink = Brink;

})(window.Brink||{});