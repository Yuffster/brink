function Request(url, data) {

	var post=data.body, path, get = {}, m;

	if (!url) {
		url = window.location.toString();
	}

	if (!url.match(/^\//)) url = "/"+url;

	m = url.split('?');

	path = m[0];
		
	if (m[1]) {

		m[1].replace(
		    /([^&?=]+)=([^&]*)?/g,
		    function(m, k, val) { get[k] = decodeURIComponent(val); }
		);

	}

	return {
		get    : get,
		post   : post,
		params : {},
		path   : path,
		files  : null,
		user   : data.user,
		method : (data.method) ? data.method.toLowerCase() : 'get',
		headers: data.headers || {}
	};

}

module.exports = Request;