require('app-module-path').addPath('./shared');

const _ = require('lodash');

const vitreumRender = require('vitreum/render');
const bodyParser = require('body-parser')
const express = require("express");
const app = express();
app.use(express.static(__dirname + '/build'));
app.use(bodyParser.json({limit: '25mb'}));



//Mongoose
//TODO: Celean up
const mongoose = require('mongoose');
const mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/naturalcrit';
require('mongoose').connect(mongoUri);
mongoose.connection.on('error', function(){
	console.log(">>>ERROR: Run Mongodb.exe ya goof!");
});


app.use(require('./server/homebrew.api.js'));
app.use(require('./server/admin.api.js'));


const HomebrewModel = require('./server/homebrew.model.js').model;
const welcomeText = require('fs').readFileSync('./client/homebrew/pages/homePage/welcome_msg.md', 'utf8');
const changelogText = require('fs').readFileSync('./changelog.md', 'utf8');


var sanitizeBrew = function(brew){
	var cleanBrew = _.assign({}, brew);
	delete cleanBrew.editId;
	return cleanBrew;
};


app.get('/edit/:id', (req, res, next)=>{
	HomebrewModel.find({editId : req.params.id}, (err, brews)=>{
		if(err || !brews.length){
			return res.status(400).send(`Can't get that`);
		}
		req.brew = brews[0].toJSON();
		return next();
	})
});


//Share Page
app.get('/share/:id', (req, res, next)=>{
	HomebrewModel.find({shareId : req.params.id}, (err, brews)=>{
		if(err || !brews.length){
			return res.status(400).send(`Can't get that`);
		}
		const brew = brews[0];
		brew.lastViewed = new Date();
		brew.views = brew.views + 1;
		brew.save();

		req.brew = sanitizeBrew(brew);
		return next();
	})
});

//Print Page
var Markdown = require('naturalcrit/markdown.js');
var PHBStyle = '<style>' + require('fs').readFileSync('./phb.standalone.css', 'utf8') + '</style>'
app.get('/print/:id', function(req, res){
	HomebrewModel.find({shareId : req.params.id}, function(err, objs){
		var brew = {};
		if(objs.length){
			brew = objs[0];
		}

		if(err || !objs.length){
			brew.text = '# Oops \n We could not find a brew with that id. **Sorry!**';
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


/*
//Home and 404, etc.

app.get('*', function (req, res) {
	vitreumRender({
		page: './build/homebrew/bundle.dot',
		globals:{},
		prerenderWith : './client/homebrew/homebrew.jsx',
		initialProps: {
			url: req.originalUrl,
			welcomeText : welcomeText,
			changelog : changelogText,
			version : projectVersion
		},
		clearRequireCache : !process.env.PRODUCTION,
	}, function (err, page) {
		return res.send(page)
	});
});
*/


//Render Page
app.use((req, res) => {
	vitreumRender({
		page: './build/homebrew/bundle.dot',
		globals:{
			version : require('./package.json').version
		},
		prerenderWith : './client/homebrew/homebrew.jsx',
		initialProps: {
			url: req.originalUrl,

			welcomeText : welcomeText,
			changelog : changelogText,
			brew : req.brew
		},
		clearRequireCache : !process.env.PRODUCTION,
	}, (err, page) => {
		return res.send(page)
	});
});





var port = process.env.PORT || 8000;
app.listen(port);
console.log('Listening on localhost:' + port);