var _ = require('lodash');
var Moment = require('moment');
var vitreumRender = require('vitreum/render');




module.exports = function(app){

	app.get('/splatsheet', function(req, res){
		vitreumRender({
			page: './build/splatsheet/bundle.dot',
			globals:{},
			prerenderWith : './client/splatsheet/splatsheet.jsx',
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