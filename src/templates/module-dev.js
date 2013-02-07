(function() {

	var require = Brink._creq;

	var module = { exports: {} };

	Brink._cexp("{{{path}}}", function() {

		return (new function(module) {

			{{{content}}}

			return module.exports;

		}(module));

	});


}());