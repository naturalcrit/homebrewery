var _ = require('lodash');
var vitreumRender = require('vitreum/render');
var HomebrewModel = require('./homebrew.model.js').model;


var getTopBrews = function(cb){
	HomebrewModel.find().sort({views: -1}).limit(5).exec(function(err, brews) {
		cb(brews);
	});
}



module.exports = function(app){

	app.get('/homebrew/top', function(req, res){
		getTopBrews(function(topBrews){
			return res.json(topBrews);
		});
	})


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

	app.get('/homebrew/clear', function(req, res){
		//if(req.query && req.query.admin_key == process.env.ADMIN_KEY){



			HomebrewModel.find({text : ''}, function(err, objs){

				return res.json(objs);


				if(!objs.length || err) return res.status(404).send("Can not find homebrew with that id");
				var resEntry = objs[0];
				resEntry.remove(function(err){
					if(err) return res.status(500).send("Error while removing");
					return res.status(200).send();
				})
			});
		//}else{
		//	return res.status(401).send('Access denied');
		//}
	});


	//Edit Page
	app.get('/homebrew/edit/:id', function(req, res){
		HomebrewModel.find({editId : req.params.id}, function(err, objs){
			if(err || !objs.length) return res.status(404).send('Could not find Homebrew with that id');

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
			if(err || !objs.length) return res.status(404).send('Could not find Homebrew with that id');

			var resObj = null;
			var errObj = {text: "# oops\nCould not find the homebrew."}

			if(objs.length){
				resObj = objs[0];
				resObj.lastViewed = new Date();
				resObj.views = resObj.views + 1;
				resObj.save();
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

	//Print Page
	var Markdown = require('marked');
	var PHBStyle = '<style>' + require('fs').readFileSync('./phb.standalone.css', 'utf8') + '</style>'
	app.get('/homebrew/print/:id', function(req, res){
		HomebrewModel.find({shareId : req.params.id}, function(err, objs){
			if(err || !objs.length) return res.status(404).send('Could not find Homebrew with that id');

			var resObj = null;
			if(objs.length){
				resObj = objs[0];
			}

			var content = _.map(resObj.text.split('\\page'), function(pageText){
				return '<div class="phb">' + Markdown(pageText) + '</div>';
			}).join('\n');

			var title = '<title>' + resObj.text.split('\n')[0] + '</title>';
			var page = '<html><head>' + title + PHBStyle + '</head><body>' +  content +'</body></html>'

			return res.send(page)
		});
	});

	//Home and 404, etc.
	var welcomeText = require('fs').readFileSync('./client/homebrew/homePage/welcome_msg.txt', 'utf8');

	app.get('/homebrew*', function (req, res) {
		vitreumRender({
			page: './build/homebrew/bundle.dot',
			globals:{},
			prerenderWith : './client/homebrew/homebrew.jsx',
			initialProps: {
				url: req.originalUrl,
				welcomeText : welcomeText
			},
			clearRequireCache : true,
		}, function (err, page) {
			return res.send(page)
		});
	});

	return app;
}