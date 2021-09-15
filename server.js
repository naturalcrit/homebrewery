/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
const _ = require('lodash');
const jwt = require('jwt-simple');
const express = require('express');
const app = express();

const homebrewApi = require('./server/homebrew.api.js');
const GoogleActions = require('./server/googleActions.js');
const serveCompressedStaticAssets = require('./server/static-assets.mv.js');
const sanitizeFilename = require('sanitize-filename');
const asyncHandler = require('express-async-handler');

const brewAccessTypes = ['edit', 'share', 'raw'];

//Get the brew object from the HB database or Google Drive
const getBrewFromId = asyncHandler(async (id, accessType)=>{
	if(!brewAccessTypes.includes(accessType))
		throw ('Invalid Access Type when getting brew');
	let brew;
	if(id.length > 12) {
		const googleId = id.slice(0, -12);
		id             = id.slice(-12);
		brew = await GoogleActions.readFileMetadata(config.get('google_api_key'), googleId, id, accessType);
	} else {
		brew = await HomebrewModel.get(accessType == 'edit' ? { editId: id } : { shareId: id });
		brew = brew.toObject(); // Convert MongoDB object to standard Javascript Object
	}

	brew = sanitizeBrew(brew, accessType === 'edit' ? false : true);
	//Split brew.text into text and style
	//unless the Access Type is RAW, in which case return immediately
	if(accessType == 'raw') {
		return brew;
	}
	splitTextAndStyle(brew);
	return brew;
});

const sanitizeBrew = (brew, full=false)=>{
	delete brew._id;
	delete brew.__v;
	if(full){
		delete brew.editId;
	}
	return brew;
};

const splitTextAndStyle = (brew)=>{
	brew.text = brew.text.replaceAll('\r\n', '\n');
	if(brew.text.startsWith('```css')) {
		const index = brew.text.indexOf('```\n\n');
		brew.style = brew.text.slice(7, index - 1);
		brew.text = brew.text.slice(index + 5);
	}
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

const HomebrewModel  = require('./server/homebrew.model.js').model;
const welcomeText    = require('fs').readFileSync('./client/homebrew/pages/homePage/welcome_msg.md', 'utf8');
const welcomeTextV3  = require('fs').readFileSync('./client/homebrew/pages/homePage/welcome_msg_v3.md', 'utf8');
const changelogText  = require('fs').readFileSync('./changelog.md', 'utf8');
const faqText        = require('fs').readFileSync('./faq.md', 'utf8');

String.prototype.replaceAll = function(s, r){return this.split(s).join(r);};

//Robots.txt
app.get('/robots.txt', (req, res)=>{
	return res.sendFile(`${__dirname}/robots.txt`);
});

//Home page
app.get('/', async (req, res, next)=>{
	const brew = {
		text : welcomeText
	};
	req.brew = brew;
	return next();
});

//Home page v3
app.get('/v3_preview', async (req, res, next)=>{
	const brew = {
		text     : welcomeTextV3,
		renderer : 'V3'
	};
	splitTextAndStyle(brew);
	req.brew = brew;
	return next();
});

//Changelog page
app.get('/changelog', async (req, res, next)=>{
	const brew = {
		title    : 'Changelog',
		text     : changelogText,
		renderer : 'V3'
	};
	splitTextAndStyle(brew);
	req.brew = brew;
	return next();
});

//FAQ page
app.get('/faq', async (req, res, next)=>{
	const brew = {
		title    : 'FAQ',
		text     : faqText,
		renderer : 'V3'
	};
	splitTextAndStyle(brew);
	req.brew = brew;
	return next();
});

//Source page
app.get('/source/:id', asyncHandler(async (req, res)=>{
	const brew = await getBrewFromId(req.params.id, 'raw');

	const replaceStrings = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
	let text = brew.text;
	for (const replaceStr in replaceStrings) {
		text = text.replaceAll(replaceStr, replaceStrings[replaceStr]);
	}
	text = `<code><pre style="white-space: pre-wrap;">${text}</pre></code>`;
	res.status(200).send(text);
}));

//Download brew source page
app.get('/download/:id', asyncHandler(async (req, res)=>{
	const brew = await getBrewFromId(req.params.id, 'raw');
	const prefix = 'HB - ';

	let fileName = sanitizeFilename(`${prefix}${brew.title}`).replaceAll(' ', '');
	if(!fileName || !fileName.length) { fileName = `${prefix}-Untitled-Brew`; };
	res.set({
		'Cache-Control'       : 'no-cache',
		'Content-Type'        : 'text/plain',
		'Content-Disposition' : `attachment; filename="${fileName}.txt"`
	});
	res.status(200).send(brew.text);
}));

//User Page
app.get('/user/:username', async (req, res, next)=>{
	const ownAccount = req.account && (req.account.username == req.params.username);

	let brews = await HomebrewModel.getByUser(req.params.username, ownAccount)
	.catch((err)=>{
		console.log(err);
	});

	if(ownAccount && req?.account?.googleId){
		const googleBrews = await GoogleActions.listGoogleBrews(req, res)
		.catch((err)=>{
			console.error(err);
		});

		if(googleBrews)
			brews = _.concat(brews, googleBrews);
	}

	req.brews = _.map(brews, (brew)=>{
		return sanitizeBrew(brew, !ownAccount);
	});

	return next();
});

//Edit Page
app.get('/edit/:id', asyncHandler(async (req, res, next)=>{
	res.header('Cache-Control', 'no-cache, no-store');	//reload the latest saved brew when pressing back button, not the cached version before save.
	const brew = await getBrewFromId(req.params.id, 'edit');
	req.brew = brew;
	return next();
}));

//New Page
app.get('/new/:id', asyncHandler(async (req, res, next)=>{
	const brew = await getBrewFromId(req.params.id, 'share');
	brew.title = `CLONE - ${brew.title}`;
	req.brew = brew;
	return next();
}));

//Share Page
app.get('/share/:id', asyncHandler(async (req, res, next)=>{
	const brew = await getBrewFromId(req.params.id, 'share');

	if(req.params.id.length > 12) {
		const googleId = req.params.id.slice(0, -12);
		const shareId = req.params.id.slice(-12);
		await GoogleActions.increaseView(googleId, shareId, 'share', brew)
					.catch((err)=>{next(err);});
	} else {
		await HomebrewModel.increaseView({ shareId: brew.shareId });
	}

	req.brew = brew;
	return next();
}));

//Print Page
app.get('/print/:id', asyncHandler(async (req, res, next)=>{
	const brew = await getBrewFromId(req.params.id, 'share');
	req.brew = brew;
	return next();
}));

//Render the page
const templateFn = require('./client/template.js');
app.use((req, res)=>{
	const props = {
		version     : require('./package.json').version,
		url         : req.originalUrl,
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

//v=====----- Error-Handling Middleware -----=====v//
//Format Errors so all fields will be sent
const replaceErrors = (key, value)=>{
	if(value instanceof Error) {
		const error = {};
		Object.getOwnPropertyNames(value).forEach(function (key) {
			error[key] = value[key];
		});
		return error;
	}
	return value;
};

const getPureError = (error)=>{
	return JSON.parse(JSON.stringify(error, replaceErrors));
};

app.use((err, req, res, next)=>{
	const status = err.status || 500;
	console.error(err);
	res.status(status).send(getPureError(err));
});
//^=====--------------------------------------=====^//

const PORT = process.env.PORT || config.get('web_port') || 8000;
app.listen(PORT);
console.log(`server on port:${PORT}`);
