/* Loads scripts and CSS from the library. */


function Assets() {	

	function listen(app) {

		Brink.route('/assets/application.js', function(req, res) {

			res.end('Ok.');
		
		});

		Brink.route('/assets/css/:path', function(req, res) {

		});

	}

	return {
		listen: listen
	}

}

module.exports = Assets;