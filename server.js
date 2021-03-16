/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
const _ = require('lodash');
const jwt = require('jwt-simple');
const express = require('express');
const app = express();

const homebrewApi = require('./server/homebrew.api.js');
const GoogleActions = require('./server/googleActions.js');
const serveCompressedStaticAssets = require('./server/static-assets.mv.js');
const sanitizeFilename = require('sanitize-filename');

// //Custom Error
// class ErrorHandler extends Error {
// 	constructor(statusCode, message) {
// 		super();
// 		this.statusCode = statusCode;
// 		this.message = message;
// 	}
// }

//Format brew source for viewing in the browser as plain text
// const sanitizeSource = (text)=>{
// 	const replaceStrings = { '&' : '&amp;',
// 													 '<' : '&lt;',
// 													 '>' : '&gt;' };
// 	for (const replaceStr in replaceStrings) {
// 		text = text.replaceAll(replaceStr, replaceStrings[replaceStr]);
// 	}
// 	return `<code><pre style="white-space: pre-wrap;">${text}</pre></code>`;
// };

//Get the brew object from the HB database or Google Drive
const getBrewFromId = async (id, accessType)=>{
	if(accessType !== 'edit' && accessType !== 'share')
		throw ('Invalid Access Type when getting brew');
	let brew;
	if(id.length > 12) {
		const googleId = id.slice(0, -12);
		id             = id.slice(-12);
		brew = await GoogleActions.readFileMetadata(config.get('google_api_key'), googleId, id, accessType)
					.catch((err)=>{throw err;});
	} else {
		brew = await HomebrewModel.get(accessType == 'edit' ? { editId: id } : { shareId: id })
					.catch((err)=>{throw err;});
		brew.sanatize(true);
	}

	return brew;
};

app.use('/', serveCompressedStaticAssets(`${__dirname}/build`));

process.chdir(__dirname);

//app.use(express.static(`${__dirname}/build`));
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
	{ retryWrites: false, useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
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

const HomebrewModel = require('./server/homebrew.model.js').model;
const welcomeText = require('fs').readFileSync('./client/homebrew/pages/homePage/welcome_msg.md', 'utf8');
const changelogText = require('fs').readFileSync('./changelog.md', 'utf8');

String.prototype.replaceAll = function(s, r){return this.split(s).join(r);};

//Robots.txt
app.get('/robots.txt', (req, res)=>{
	return res.sendFile(`${__dirname}/robots.txt`);
});

// app.get('/error', (req, res)=>{
// 	throw new ErrorHandler(404, 'User with the specified email does not exist');
// });


//Source page
app.get('/source/:id', (req, res)=>{
	if(req.params.id.length > 12) {
		const googleId = req.params.id.slice(0, -12);
		const shareId = req.params.id.slice(-12);
		GoogleActions.readFileMetadata(config.get('google_api_key'), googleId, shareId, 'share')
		.then((brew)=>{
			const replaceStrings = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
			let text = brew.text;
			for (const replaceStr in replaceStrings) {
				text = text.replaceAll(replaceStr, replaceStrings[replaceStr]);
			}
			text = `<code><pre style="white-space: pre-wrap;">${text}</pre></code>`;
			res.status(200).send(text);
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send('Can\'t get brew from Google');
		});
	} else {
		HomebrewModel.get({ shareId: req.params.id })
		.then((brew)=>{
			const replaceStrings = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
			let text = brew.text;
			for (const replaceStr in replaceStrings) {
				text = text.replaceAll(replaceStr, replaceStrings[replaceStr]);
			}
			text = `<code><pre style="white-space: pre-wrap;">${text}</pre></code>`;
			res.status(200).send(text);
		})
		.catch((err)=>{
			console.log(err);
			return res.status(404).send('Could not find Homebrew with that id');
		});
	}
});

//Download brew source page
app.get('/download/:id', (req, res)=>{
	const prefix = 'HB - ';

	if(req.params.id.length > 12) {
		const googleId = req.params.id.slice(0, -12);
		const shareId = req.params.id.slice(-12);
		GoogleActions.readFileMetadata(config.get('google_api_key'), googleId, shareId, 'share')
		.then((brew)=>{
			let fileName = sanitizeFilename(`${prefix}${brew.title}`).replaceAll(' ', '');
			if(!fileName || !fileName.length) { fileName = `${prefix}-Untitled-Brew`; };
			res.set({
				'Cache-Control'       : 'no-cache',
				'Content-Type'        : 'text/plain',
				'Content-Disposition' : `attachment; filename="${fileName}.txt"`
			});
			res.status(200).send(brew.text);
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send('Can\'t get brew from Google');
		});
	} else {
		HomebrewModel.get({ shareId: req.params.id })
		.then((brew)=>{
			let fileName = sanitizeFilename(`${prefix}${brew.title}`).replaceAll(' ', '');
			if(!fileName || !fileName.length) { fileName = `${prefix}-Untitled-Brew`; };
			res.set({
				'Cache-Control'       : 'no-cache',
				'Content-Type'        : 'text/plain',
				'Content-Disposition' : `attachment; filename="${fileName}.txt"`
			});
			res.status(200).send(brew.text);
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
app.get('/edit/:id', async (req, res, next)=>{
	res.header('Cache-Control', 'no-cache, no-store');	//reload the latest saved brew when pressing back button, not the cached version before save.
	const brew = await getBrewFromId(req.params.id, 'edit')
						.catch((err)=>{next(err);});

	req.brew = brew;
	return next();
});

//New Page
app.get('/new/:id', async (req, res, next)=>{
	const brew = await getBrewFromId(req.params.id, 'share')
						.catch((err)=>{next(err);});

	req.brew = brew;
	return next();
});

//Share Page
app.get('/share/:id', async (req, res, next)=>{
	const brew = await getBrewFromId(req.params.id, 'share')
						.catch((err)=>{next(err);});

	if(req.params.id.length > 12) {
		const googleId = req.params.id.slice(0, -12);
		const shareId = req.params.id.slice(-12);
		await GoogleActions.increaseView(googleId, shareId, 'share', brew)
					.catch((err)=>{next(err);});
	} else {
		await brew.increaseView();
	}

	req.brew = brew;
	return next();
});

//Print Page
app.get('/print/:id', async (req, res, next)=>{
	const brew = await getBrewFromId(req.params.id, 'share');

	req.brew = brew;
	return next();
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
		enable_v3   : config.get('enable_v3')
	};
	templateFn('homebrew', title = req.brew ? req.brew.title : '', props)
        .then((page)=>{ res.send(page); })
        .catch((err)=>{
        	console.log(err);
        	return res.sendStatus(500);
        });
});

//Error Handling Middleware
app.use((err, req, res, next)=>{
	const { statusCode, message } = err;
	console.log('CUSTOM ERROR HANDLER');
	console.error(err);
	res.status(statusCode).json({
		status : 'error',
		statusCode,
		message
	});
});

const PORT = process.env.PORT || config.get('web_port') || 8000;
app.listen(PORT);
console.log(`server on port:${PORT}`);
