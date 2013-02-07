/**
 * The enqueued pattern helps make development easier by allowing for internally
 * defered objects which maintain a consistent synchronous-like interface and
 * only require a callback when accessing data.
 *
 * Additionally, if we use Brink.callback consistently, we don't have to 
 * handle error conditions manually with each asynchronous callback operation.
 */

var Queue = Brink.require("queue");

function callback(e, d) {
	var i, args = [], fn;
	if (e) Brink.fireEvent('error', e);
	for (i in arguments) args.push(arguments[i]);
	fn = args.shift();
	if (fn&&fn.trigger) fn = fn.trigger;
	if (fn) fn.apply(fn, args);
};

function enqueue(wrap,face,q) {
	// The interface is an optional parameter.
	if (!q) {
		q = face;
		face = {};
	}
	var q = q || new Queue(), old = {};
	for (var k in wrap) {
		(function(k) {
			var out, standin = {};
			old[k]    = wrap[k];
			wrap[k]   = (function() {
				var a = arguments;			 
				q.push(function() { out = old[k].apply(old, a); });
				return standin;
			});
			if (!face[k]) return;
			// Return any interface the returning function may have.
			for (var f in face[k]) {
			    (function(name) {
				    standin[name] = (function() {
				        var a = arguments;
					    q.push(function() { out[name].apply(out, a); })
				    });
				})(face[k][f]);
			}
		})(k);
	} return q;
}

module.exports = {
	enqueue: enqueue,
	callback: callback
};