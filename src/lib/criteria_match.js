/**
 * Matches a Collection item against given Brink Criteria object.
 */
function match(criteria, item) {

	var array_comparisons = {

		/**
		 * Object:
		 *
		 *    { my_field: ['one', 'two', 'three'] }
		 *
		 * Matched by:
		 * 
		 *    { my_field: ['two', 'one', 'three'] }
		 *    { my_field: ['one', 'two', 'three'] }
		 */
		equals: function(v, args) {

		},

		/**
		 * Object:
		 *
		 *    { my_field: ['one', 'two', 'three', 'four'] }
		 *
		 * Matched by:
		 * 
		 *    { my_field: ['all_of', two', 'one', 'three'] }
		 */
		all_of: function(v, args) {
			var success = true;
			for (var i in args) if (args[i] != item) return true;
		},

		/**
		 * Object:
		 *
		 *    { my_field: ['one', 'two', 'three'] }
		 *
		 * Matched by:
		 * 
		 *    { my_field: ['any_of', two', 'four'] }
		 */
 		any_of: function(v, args) {
 			for (var i in args) if (args[i] == item) return true;
 		},

		/**
		 * Object:
		 *
		 *    { my_field: ['one', 'two', 'three'] }
		 *
		 * Matched by:
		 * 
		 *    { my_field: ['none_of', four', 'five'] }
		 */
 		none_of: function(v, args) {

 		}

 	};


 	var number_comparisons = {

		/**
		 * Object:
		 *
		 *    { my_field: 15 }
		 *
		 * Matched by:
		 * 
		 *    { my_field: ['more_than', 14] }
		 */
		more_than: function(v, args) {

		},

		/**
		 * Object:
		 *
		 *    { my_field: 13 }
		 *
		 * Matched by:
		 * 
		 *    { my_field: ['less_than', 14] }
		 */
		less_than: function(v, args) {

		},

		/**
		 * Object:
		 *
		 *    { my_field: 25 }
		 *
		 * Matched by:
		 * 
		 *    { my_field: ['between', 25, 50] }
		 */
		between: function(v, args) {

		},

		/**
		 * Object:
		 *
		 *    { my_field: 25 }
		 *
		 * Matched by:
		 * 
		 *    { my_field: ['none_of', 14, 20, 30] }
		 */
		none_of: function(v, args) {

		},

		/**
		 * Object:
		 *
		 *    { my_field: 25 }
		 *
		 * Matched by:
		 * 
		 *    { my_field: ['any_of', 25, 20, 30] }
		 */
		any_of: function(v, args) {

		}

 	};

 	var string_comparisons = {

		/**
		 * Object:
		 *
		 *    { my_field: 'foo' }
		 *
		 * Matched by:
		 * 
		 *    { my_field: ['any_of', 'foo', 'bar'] }
		 */
 		equals: function(v, args) {

 		},

		/**
		 * Object:
		 *
		 *    { my_field: 'foo' }
		 *
		 * Matched by:
		 * 
		 *    { my_field: ['any_of', 'foo', 'bar'] }
		 */
 		any_of: function(v, args) {
 			for (var i in args) if (args[i] == v) return true;
 		},

		/**
		 * Object:
		 *
		 *    { my_field: 'bizz' }
		 *
		 * Matched by:
		 * 
		 *    { my_field: ['none_of', 'foo', 'bar'] }
		 */
 		none_of: function(v, args) {

 		}

 	};

 	var date_comparisons = {

 		seconds_ago: function() { },

 		minutes_ago: function() { },

 		hours_ago: function() { },

 		days_ago: function() { },

 		months_ago: function() { },

 		years_ago: function() { }

 	};

}

module.exports = match;