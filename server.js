'use strict';
var _ = require('lodash');
require('app-module-path').addPath('./shared');
var vitreumRender = require('vitreum/render');
var bodyParser = require('body-parser')
var express = require("express");
var app = express();
app.use(express.static(__dirname + '/build'));
app.use(bodyParser.json({limit: '25mb'}));

//Mongoose
var mongoose = require('mongoose');
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/naturalcrit';
mongoose.connect(mongoUri);
mongoose.connection.on('error', function(){
	console.log(">>>ERROR: Run Mongodb.exe ya goof!");
});

//Admin route
process.env.ADMIN_USER = process.env.ADMIN_USER || 'admin';
process.env.ADMIN_PASS = process.env.ADMIN_PASS || 'password';
process.env.ADMIN_KEY  = process.env.ADMIN_KEY  || 'admin_key';
var auth = require('basic-auth');
app.get('/admin', function(req, res){
	var credentials = auth(req)
	if (!credentials || credentials.name !== process.env.ADMIN_USER || credentials.pass !== process.env.ADMIN_PASS) {
		res.setHeader('WWW-Authenticate', 'Basic realm="example"')
		return res.status(401).send('Access denied')
	}
	vitreumRender({
		page: './build/admin/bundle.dot',
		prerenderWith : './client/admin/admin.jsx',
		clearRequireCache : !process.env.PRODUCTION,
		initialProps: {
			url: req.originalUrl,
			admin_key : process.env.ADMIN_KEY,
		},
	}, function (err, page) {
		return res.send(page)
	});
});


//Populate homebrew routes
app = require('./server/homebrew.api.js')(app);
//app = require('./server/homebrew.server.js')(app);

var HomebrewModel = require('./server/homebrew.model.js').model;




//Edit Page
app.get('/edit/:id', function(req, res){
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
app.get('/share/:id', function(req, res){
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
var Markdown = require('naturalcrit/markdown.js');
var PHBStyle = '<style>' + require('fs').readFileSync('./phb.standalone.css', 'utf8') + '</style>'
app.get('/print/:id', function(req, res){
	HomebrewModel.find({shareId : req.params.id}, function(err, objs){
		if(err || !objs.length) return res.status(404).send('Could not find Homebrew with that id');

		var brew = null;
		if(objs.length){
			brew = objs[0];
		}

		var content = _.map(brew.text.split('\\page'), function(pageText, index){
			return `<div class="phb print" id="p${index+1}">` + Markdown.render(pageText) + '</div>';
		}).join('\n');

		var dialog = '';
		if(req.query && req.query.dialog) dialog = 'onload="window.print()"';

		var title = '<title>' + brew.title + '</title>';
		var page = `<html><head>${title} ${PHBStyle}</head><body ${dialog}>${content}</body></html>`

		return res.send(page)
	});
});

//Source page
String.prototype.replaceAll = function(s,r){return this.split(s).join(r)}
app.get('/source/:id', function(req, res){
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
app.get('*', function (req, res) {
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




var port = process.env.PORT || 8000;
app.listen(port);
console.log('Listening on localhost:' + port);