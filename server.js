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



//Source page
String.prototype.replaceAll = function(s,r){return this.split(s).join(r)}
app.get('/source/:id', (req, res)=>{
	HomebrewModel.get({shareId : req.params.id})
		.then((brew)=>{
			const text = brew.text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
			return res.send(`<code><pre>${text}</pre></code>`);
		})
		.catch((err)=>{
			console.log(err);
			return res.status(404).send('Could not find Homebrew with that id');
		})
});


app.get('/edit/:id', (req, res, next)=>{
	HomebrewModel.get({editId : req.params.id})
		.then((brew)=>{
			req.brew = brew.sanatize();
			return next();
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send(`Can't get that`);
		});
});

//Share Page
app.get('/share/:id', (req, res, next)=>{
	HomebrewModel.get({shareId : req.params.id})
		.then((brew)=>{
			return brew.increaseView();
		})
		.then((brew)=>{
			req.brew = brew.sanatize(true);
			return next();
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send(`Can't get that`);
		});
});

//Print Page
app.get('/print/:id', (req, res, next)=>{
	HomebrewModel.get({shareId : req.params.id})
		.then((brew)=>{
			req.brew = brew.sanatize(true);
			return next();
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send(`Can't get that`);
		});
});




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