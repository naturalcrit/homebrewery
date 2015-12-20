var vitreumRender = require('vitreum/render');



var HomebrewModel = require('./homebrew.model.js').model;




module.exports = function(app){


	app.get('/homebrew/new', function(req, res){
		var newHomebrew = new HomebrewModel();
		newHomebrew.save(function(err, obj){
			return res.redirect('/homebrew/edit/' + obj.editId);
		})
	})


	//Edit Page
	app.get('/homebrew/edit/:id', function(req, res){
		HomebrewModel.find({editId : req.params.id}, function(err, objs){
			var resObj = null;
			var errObj = {text: "# oops\nCould not find the homebrew."}
			if(objs.length){
				resObj = objs[0];
			}

			vitreumRender({
				page: './build/homebrew/bundle.dot',
				globals:{},
				prerenderWith : './client/homebrew/homebrew.jsx',
				initialProps: {
					url: req.originalUrl,
					entry : resObj || errObj
				},
				clearRequireCache : true,
			}, function (err, page) {
				return res.send(page)
			});
		})
	});


	//Updating
	app.put('/homebrew/update/:id', function(req, res){
		HomebrewModel.find({editId : req.params.id}, function(err, objs){
			if(!objs.length || err) return res.send(400);
			var resEntry = objs[0];
			resEntry.text = req.body.text;
			resEntry.save(function(err, obj){
				if(!err) return res.sendStatus(500);
				return res.send(200);
			})
		});
	});



	//Share Page
	app.get('/homebrew/share/:id', function(req, res){
		HomebrewModel.find({shareId : req.params.id}, function(err, objs){
			var resObj = null;
			var errObj = {text: "# oops\nCould not find the homebrew."}
			if(objs.length){
				resObj = objs[0];
			}

			resObj.editId = null;

			vitreumRender({
				page: './build/homebrew/bundle.dot',
				globals:{},
				prerenderWith : './client/homebrew/homebrew.jsx',
				initialProps: {
					url: req.originalUrl,
					entry : resObj || errObj
				},
				clearRequireCache : true,
			}, function (err, page) {
				return res.send(page)
			});
		})
	});




	//Home and 404, etc.
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