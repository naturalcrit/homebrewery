var _ = require('lodash');
var vitreumRender = require('vitreum/render');


module.exports = function(app){
	app.get('/spellsort*', (req, res)=>{
		vitreumRender({
			page: './build/spellsort/bundle.dot',
			globals:{},
			prerenderWith : './client/spellsort/spellsort.jsx',
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