var _ = require('lodash');
var vitreumRender = require('vitreum/render');
var HomebrewModel = require('./homebrew.model.js').model;




module.exports = function(app){

	/*
	app.get('/homebrew/new', function(req, res){
		var newHomebrew = new HomebrewModel();
		newHomebrew.save(function(err, obj){
			return res.redirect('/homebrew/edit/' + obj.editId);
		})
	})
	*/


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
				clearRequireCache : !process.env.PRODUCTION,
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
				clearRequireCache : !process.env.PRODUCTION,
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

			var brew = null;
			if(objs.length){
				brew = objs[0];
			}

			var content = _.map(brew.text.split('\\page'), function(pageText){
				return '<div class="phb">' + Markdown(pageText) + '</div>';
			}).join('\n');

			var title = '<title>' + brew.text.split('\n')[0] + '</title>';
			var page = '<html><head>' + title + PHBStyle + '</head><body>' +  content +'</body></html>'

			return res.send(page)
		});
	});

	//Source page
	String.prototype.replaceAll = function(s,r){return this.split(s).join(r)}
	app.get('/homebrew/source/:id', function(req, res){
		HomebrewModel.find({shareId : req.params.id}, function(err, objs){
			if(err || !objs.length) return res.status(404).send('Could not find Homebrew with that id');
			var brew = null;
			if(objs.length) brew = objs[0];
			var text = brew.text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
			return res.send(`<code><pre>${text}</pre></code>`);
		});
	});

	//Home and 404, etc.
	var welcomeText = require('fs').readFileSync('./client/homebrew/pages/homePage/welcome_msg.txt', 'utf8');
	var changelogText = require('fs').readFileSync('./changelog.md', 'utf8');
	app.get('/homebrew*', function (req, res) {
		vitreumRender({
			page: './build/homebrew/bundle.dot',
			globals:{},
			prerenderWith : './client/homebrew/homebrew.jsx',
			initialProps: {
				url: req.originalUrl,
				welcomeText : welcomeText,
				changelog : changelogText
			},
			clearRequireCache : !process.env.PRODUCTION,
		}, function (err, page) {
			return res.send(page)
		});
	});

	return app;
}