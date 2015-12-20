var vitreumRender = require('vitreum/render');



module.exports = function(app){





	app.get('/homebrew/edit/:id', function(req, res){

		console.log(req.params.id);


		vitreumRender({
			page: './build/homebrew/bundle.dot',
			globals:{},
			prerenderWith : './client/homebrew/homebrew.jsx',
			initialProps: {
				url: req.originalUrl,
			},
			clearRequireCache : true,
		}, function (err, page) {
			return res.send(page)
		});
	});


	app.get('/homebrew*', function (req, res) {
		vitreumRender({
			page: './build/homebrew/bundle.dot',
			globals:{},
			prerenderWith : './client/homebrew/homebrew.jsx',
			initialProps: {
				url: req.originalUrl,
			},
			clearRequireCache : true,
		}, function (err, page) {
			return res.send(page)
		});
	});










	return app;
}