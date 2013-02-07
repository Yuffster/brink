/**
 * Translates an object matching the following described criteria patterns to
 * a filter which is understandable by the current data store.
 *
 * Note that the criteria interface is abstracted from MongoDB. This allows
 * for a lightweight client-side implementation and the adoption of alternate
 * database adapters in the future.
 *
 * Criteria forms:
 *
 *     Simple equals match:
 *
 *         { name: "Bob" }
 *         { name: ['equals', "Bob"] }
 *
 *     Field array search:
 *
 *         { tags: ['any_of', 'action', 'adventure'] }
 *         { tags: ['all_of', 'action', 'adventure'] }
 *
 *     Range search:
 *
 *         { cost: ['between', 10, 20] }
 *         { cost: ['more_than', 100 ] }
 *         { cost: ['less_than', 50 ] }
 *
 *     Exclude:
 *
 *         { name: ['not', 'joe'] }
 *
 *     Multiple constraints:
 *
 *     Default (AND):
 *
 *         //(Defaults to an AND operator)
 *         { name: "joe", "age": ['between', 10, 20 ] }
 *
 *     OR operator:
 *
 *         { $or: { name: "joe", "deceased": false } }
 *
 * If a function is given instead of an object, that function will be run
 * against each potential match item. This might have performance implications
 * depending on the database adapter being used.
 */

 function Criteria(criteria) {

 	var map = {
 		'all_of'   : '$all',
 		'contains' : '$all',
		'more_than': '$gt',
		'less_than': '$lt',
		'between'  : function(a,b) { return { $gt: a, $lt: b }; }
		'any_of'   : '$in',
		'none_of'  : '$nin',
		'not'      : '$ne'
 	};

 	if (typeof criteria==="function") {
 		return {
 			match: criteria,
 			translate: function() { return { $where: criteria }; }
 		}
 	}

 	/**
 	 * Runs the provided criteria against a given item.
 	 */
 	function match(item) {

 	}

 	/**
 	 * Returns a translation of the query method for the relevant database
 	 * adapter.
 	 */
 	function translate() {

 		var out = {}, field, op, args;

 		for (var field in criteria) {

 			if (field.match(/^\$or/)) {
 				out[field] = translate(criteria[field]);
 			}

 			op   = map[op][0];
 			args = map[op].slice(1);

 			if (args.length==1) args = args[0];

 			if (map[op]) {
 				if (typeof map[op]==='function') {
 					args = map[op].apply(this, args);
 				}
 				out[field][map[op]] = args;
 			} else {
 				throw "Can't find mapping for criteria keyword '"+field+"'";
 			}

 		}

 		return out;

 	}

 	return {
 		match: match,
 		translate: translate
 	}

 }

 module.exports = Criteria;