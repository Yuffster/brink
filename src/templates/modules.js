(new function() {

	(function() {

		//Nothing attached to window is going to go anywhere.
		var modules = {};

		function require(path) {
			if (modules[path+'.js']) return modules[path+'.js']();
			else console.error("Can't find module "+path);
		}

		function mod() {
			return {
				exports: {}
			};
		}

		modules = {

			{{{modules}}}

		};

		require('lib/brink');

		Brink.require('router');

	}());

}());