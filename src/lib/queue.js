function Queue() {
	
	var triggered = false, funs = [];

	function trigger() {
		var args = arguments;
		triggered = true;
		funs.forEach(function(fun) {
		  fun.apply(this, args);
		});
	}

	function push(fun, args) {
		if (!args) {
			args = Array.prototype.slice.call(arguments);
			args.shift();
		}
		Array.prototype.slice.call(args);
		function exec() {
			fun.apply(fun, args);
		}
		if (triggered) exec();
		else funs.push(exec);
	}

	return {
		trigger: trigger,
		push: push
	};

}

module.exports = Queue;