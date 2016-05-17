var _ = require('lodash');
var vitreumRender = require('vitreum/render');

module.exports = function(app){

	//Edit Page
	app.get('/tpk*', function(req, res){
		vitreumRender({
			page: './build/tpk/bundle.dot',
			globals:{},
			prerenderWith : './client/tpk/tpk.jsx',
			initialProps: {
				url: req.originalUrl,
			},
			clearRequireCache : !process.env.PRODUCTION,
		}, function (err, page) {
			return res.send(page)
		});
	});

	return app;
};