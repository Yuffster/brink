var Request  = Brink.require('request'),
    Response = Brink.require('response');

function HTTP(handler) {

	var handler = handler || function() { };

	window.onhashchange = function() {
		var url      = window.location.hash.substring(1),
		    data     = {};
		data.cookies = {};
		document.cookie.replace(/([^=]*)=([^;]*);?/g, function(m,k,v) {
			data.cookies[decodeURIComponent(k)] = decodeURIComponent(v);
		});
		handler(new Request(url, data), new Response());
	};

	return {
		listen: function() { },
		attach: function() { }
	};

}

module.exports = HTTP;