(function(Brink) {

	var modules = {};
	
	Brink._cexp = function(path, mod) {
		modules[path] = mod;
	};

	Brink._creq = function(path) {
		if (modules[path+'.js']) {
			return modules[path+'.js']();
		} else if (modules['client/'+path+'.js']) {
			return modules['client/'+path+'.js']();
		} else {
			console.log("Can't find module "+path);
		}
	}

	window.Brink = Brink;

})(window.Brink||{});