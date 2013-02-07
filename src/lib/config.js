module.exports = function () {

	var _saved = {};

	return function(k,v) {
		if (typeof v === "undefined") return _saved[k] || null;
		_saved[k] = v;
	};

};