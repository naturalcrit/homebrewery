var vitreumRender = require('vitreum/render');
var HomebrewModel = require('./homebrew.model.js').model;

module.exports = function(app){


	app.get('/homebrew/new', function(req, res){
		var newHomebrew = new HomebrewModel();
		newHomebrew.save(function(err, obj){
			return res.redirect('/homebrew/edit/' + obj.editId);
		})
	})


	//Updating
	app.put('/homebrew/update/:id', function(req, res){
		HomebrewModel.find({editId : req.params.id}, function(err, objs){
			if(!objs.length || err) return res.status(404).send("Can not find homebrew with that id");
			var resEntry = objs[0];
			resEntry.text = req.body.text;
			resEntry.updatedAt = new Date();
			resEntry.save(function(err, obj){
				if(err) return res.status(500).send("Error while saving");
				return res.status(200).send(obj);
			})
		});
	});

	app.get('/homebrew/remove/:id', function(req, res){
		if(req.query && req.query.admin_key == process.env.ADMIN_KEY){
			HomebrewModel.find({editId : req.params.id}, function(err, objs){
				if(!objs.length || err) return res.status(404).send("Can not find homebrew with that id");
				var resEntry = objs[0];
				resEntry.remove(function(err){
					if(err) return res.status(500).send("Error while removing");
					return res.status(200).send();
				})
			});
		}else{
			return res.status(401).send('Access denied');
		}
	});




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
					brew : resObj || errObj
				},
				clearRequireCache : true,
			}, function (err, page) {
				return res.send(page)
			});
		})
	});


	//Share Page
	app.get('/homebrew/share/:id', function(req, res){
		HomebrewModel.find({shareId : req.params.id}, function(err, objs){
			var resObj = null;
			var errObj = {text: "# oops\nCould not find the homebrew."}
			if(objs.length){
				resObj = objs[0];
			}

			resObj.lastViewed = new Date();
			resObj.views = resObj.views + 1;
			resObj.save();

			vitreumRender({
				page: './build/homebrew/bundle.dot',
				globals:{},
				prerenderWith : './client/homebrew/homebrew.jsx',
				initialProps: {
					url: req.originalUrl,
					brew : resObj || errObj
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