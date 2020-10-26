const _ = require('lodash');
const jwt = require('jwt-simple');
const express = require('express');
const app = express();

const homebrewApi = require('./server/homebrew.api.js');
const GoogleActions = require('./server/googleActions.js');

app.use(express.static(`${__dirname}/build`));
app.use(require('body-parser').json({ limit: '25mb' }));
app.use(require('cookie-parser')());
app.use(require('./server/forcessl.mw.js'));

const config = require('nconf')
	.argv()
	.env({ lowerCase: true })
	.file('environment', { file: `config/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: 'config/default.json' });

//DB
const mongoose = require('mongoose');
mongoose.connect(config.get('mongodb_uri') || config.get('mongolab_uri') || 'mongodb://localhost/naturalcrit',
	{ retryWrites: false, useNewUrlParser: true });
mongoose.connection.on('error', ()=>{
	console.log('Error : Could not connect to a Mongo Database.');
	console.log('        If you are running locally, make sure mongodb.exe is running.');
	throw 'Can not connect to Mongo';
});

//Account Middleware
app.use((req, res, next)=>{
	if(req.cookies && req.cookies.nc_session){
		try {
			req.account = jwt.decode(req.cookies.nc_session, config.get('secret'));
			//console.log("Just loaded up JWT from cookie:");
			//console.log(req.account);
		} catch (e){}
	}

	req.config = {
		google_client_id     : config.get('google_client_id'),
		google_client_secret : config.get('google_client_secret')
	};
	return next();
});


app.use(homebrewApi);

app.use(require('./server/admin.api.js'));

//app.use('/user',require('./server/user.routes.js'));


const HomebrewModel = require('./server/homebrew.model.js').model;
const welcomeText = require('fs').readFileSync('./client/homebrew/pages/homePage/welcome_msg.md', 'utf8');
const changelogText = require('fs').readFileSync('./changelog.md', 'utf8');

String.prototype.replaceAll = function(s, r){return this.split(s).join(r);};

//Robots.txt
app.get('/robots.txt', (req, res)=>{
	return res.sendFile(`${__dirname}/robots.txt`);
});

//Source page
app.get('/source/:id', (req, res)=>{
	if(req.params.id.length > 12) {
		const googleId = req.params.id.slice(0, -12);
		const shareId = req.params.id.slice(-12);
		GoogleActions.readFileMetadata(config.get('google_api_key'), googleId, shareId, 'share')
		.then((brew)=>{
			const text = brew.text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
			return res.send(`<code><pre style="white-space: pre-wrap;">${text}</pre></code>`);
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send('Can\'t get brew from Google');
		});
	} else {
		HomebrewModel.get({ shareId: req.params.id })
			.then((brew)=>{
				const text = brew.text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
				return res.send(`<code><pre style="white-space: pre-wrap;">${text}</pre></code>`);
			})
			.catch((err)=>{
				console.log(err);
				return res.status(404).send('Could not find Homebrew with that id');
			});
	}
});

//User Page
app.get('/user/:username', async (req, res, next)=>{
	const fullAccess = req.account && (req.account.username == req.params.username);

	let googleBrews = [];

	if(req.account && req.account.googleId){
		googleBrews = await GoogleActions.listGoogleBrews(req, res)
		.catch((err)=>{
			console.error(err);
		});
	}

	const brews = await HomebrewModel.getByUser(req.params.username, fullAccess)
	.catch((err)=>{
		console.log(err);
	});

	if(googleBrews) {
		req.brews = _.concat(brews, googleBrews);
	} else {req.brews = brews;}

	return next();
});

//Edit Page
app.get('/edit/:id', (req, res, next)=>{
	res.header('Cache-Control', 'no-cache, no-store');	//reload the latest saved brew when pressing back button, not the cached version before save.
	if(req.params.id.length > 12) {
		const googleId = req.params.id.slice(0, -12);
		const editId = req.params.id.slice(-12);
		GoogleActions.readFileMetadata(config.get('google_api_key'), googleId, editId, 'edit')
		.then((brew)=>{
			req.brew = brew; //TODO Need to sanitize later
			return next();
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send('Can\'t get brew from Google');
		});
	} else {
		HomebrewModel.get({ editId: req.params.id })
			.then((brew)=>{
				req.brew = brew.sanatize();
				return next();
			})
			.catch((err)=>{
				console.log(err);
				return res.status(400).send(`Can't get that`);
			});
	}
});

//Share Page
app.get('/share/:id', (req, res, next)=>{
	if(req.params.id.length > 12) {
		const googleId = req.params.id.slice(0, -12);
		const shareId = req.params.id.slice(-12);
		GoogleActions.readFileMetadata(config.get('google_api_key'), googleId, shareId, 'share')
		.then((brew)=>{
			req.brew = brew; //TODO Need to sanitize later
			return next();
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send('Can\'t get brew from Google');
		});
	} else {
		HomebrewModel.get({ shareId: req.params.id })
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
	}
});

//Print Page
app.get('/print/:id', (req, res, next)=>{
	if(req.params.id.length > 12) {
		const googleId = req.params.id.slice(0, -12);
		const shareId = req.params.id.slice(-12);
		GoogleActions.readFileMetadata(config.get('google_api_key'), googleId, shareId, 'share')
		.then((brew)=>{
			req.brew = brew; //TODO Need to sanitize later
			return next();
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send('Can\'t get brew from Google');
		});
	} else {
		HomebrewModel.get({ shareId: req.params.id })
			.then((brew)=>{
				req.brew = brew.sanatize(true);
				return next();
			})
			.catch((err)=>{
				console.log(err);
				return res.status(400).send(`Can't get that`);
			});
	}
});

app.get('/source/:id', (req, res)=>{

});


//Render the page
//const render = require('.build/render');
const templateFn = require('./client/template.js');
app.use((req, res)=>{
	const props = {
		version     : require('./package.json').version,
		url         : req.originalUrl,
		welcomeText : welcomeText,
		changelog   : changelogText,
		brew        : req.brew,
		brews       : req.brews,
		googleBrews : req.googleBrews,
		account     : req.account,
	};
	templateFn('homebrew', title = req.brew ? req.brew.title : '', props)
        .then((page)=>{ res.send(page); })
        .catch((err)=>{
        	console.log(err);
        	return res.sendStatus(500);
        });
});


const PORT = process.env.PORT || 8000;
app.listen(PORT);
console.log(`server on port:${PORT}`);
