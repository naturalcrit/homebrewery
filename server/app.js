/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
// Set working directory to project root
process.chdir(`${__dirname}/..`);

const _ = require('lodash');
const jwt = require('jwt-simple');
const express = require('express');
const yaml = require('js-yaml');
const app = express();
const config = require('./config.js');

const { homebrewApi, getBrew } = require('./homebrew.api.js');
const GoogleActions = require('./googleActions.js');
const serveCompressedStaticAssets = require('./static-assets.mv.js');
const sanitizeFilename = require('sanitize-filename');
const asyncHandler = require('express-async-handler');

const splitTextStyleAndMetadata = (brew)=>{
	brew.text = brew.text.replaceAll('\r\n', '\n');
	if(brew.text.startsWith('```metadata')) {
		const index = brew.text.indexOf('```\n\n');
		const metadataSection = brew.text.slice(12, index - 1);
		const metadata = yaml.load(metadataSection);
		Object.assign(brew, _.pick(metadata, ['title', 'description', 'tags', 'systems', 'renderer', 'theme']));
		brew.text = brew.text.slice(index + 5);
	}
	if(brew.text.startsWith('```css')) {
		const index = brew.text.indexOf('```\n\n');
		brew.style = brew.text.slice(7, index - 1);
		brew.text = brew.text.slice(index + 5);
	}
	_.defaults(brew, { 'renderer': 'legacy', 'theme': '5ePHB' });
};

const sanitizeBrew = (brew, accessType)=>{
	brew._id = undefined;
	brew.__v = undefined;
	if(accessType !== 'edit'){
		brew.editId = undefined;
	}
	return brew;
};

app.use('/', serveCompressedStaticAssets(`build`));

//app.use(express.static(`${__dirname}/build`));
app.use(require('body-parser').json({ limit: '25mb' }));
app.use(require('cookie-parser')());
app.use(require('./forcessl.mw.js'));

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
app.use(require('./admin.api.js'));

const HomebrewModel  = require('./homebrew.model.js').model;
const welcomeText    = require('fs').readFileSync('client/homebrew/pages/homePage/welcome_msg.md', 'utf8');
const welcomeTextV3  = require('fs').readFileSync('client/homebrew/pages/homePage/welcome_msg_v3.md', 'utf8');
const migrateText    = require('fs').readFileSync('client/homebrew/pages/homePage/migrate.md', 'utf8');
const changelogText  = require('fs').readFileSync('changelog.md', 'utf8');
const faqText        = require('fs').readFileSync('faq.md', 'utf8');

String.prototype.replaceAll = function(s, r){return this.split(s).join(r);};

//Robots.txt
app.get('/robots.txt', (req, res)=>{
	return res.sendFile(`robots.txt`, { root: process.cwd() });
});

//Home page
app.get('/', (req, res, next)=>{
	req.brew = {
		text : welcomeText
	};
	return next();
});

//Home page v3
app.get('/v3_preview', (req, res, next)=>{
	req.brew = {
		text     : welcomeTextV3,
		renderer : 'V3'
	};
	splitTextStyleAndMetadata(req.brew);
	return next();
});

//Legacy/Other Document -> v3 Migration Guide
app.get('/migrate', (req, res, next)=>{
	req.brew = {
		text     : migrateText,
		renderer : 'V3'
	};
	splitTextStyleAndMetadata(req.brew);
	return next();
});

//Changelog page
app.get('/changelog', async (req, res, next)=>{
	req.brew = {
		title    : 'Changelog',
		text     : changelogText,
		renderer : 'V3'
	};
	splitTextStyleAndMetadata(req.brew);
	return next();
});

//FAQ page
app.get('/faq', async (req, res, next)=>{
	req.brew = {
		title    : 'FAQ',
		text     : faqText,
		renderer : 'V3'
	};
	splitTextStyleAndMetadata(req.brew);
	return next();
});

//Source page
app.get('/source/:id', asyncHandler(getBrew('share')), (req, res)=>{
	const { brew } = req;

	const replaceStrings = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
	let text = brew.text;
	for (const replaceStr in replaceStrings) {
		text = text.replaceAll(replaceStr, replaceStrings[replaceStr]);
	}
	text = `<code><pre style="white-space: pre-wrap;">${text}</pre></code>`;
	res.status(200).send(text);
});

//Download brew source page
app.get('/download/:id', asyncHandler(getBrew('share')), (req, res)=>{
	const { brew } = req;
	sanitizeBrew(brew, 'share');
	const prefix = 'HB - ';

	let fileName = sanitizeFilename(`${prefix}${brew.title}`).replaceAll(' ', '');
	if(!fileName || !fileName.length) { fileName = `${prefix}-Untitled-Brew`; };
	res.set({
		'Cache-Control'       : 'no-cache',
		'Content-Type'        : 'text/plain',
		'Content-Disposition' : `attachment; filename="${fileName}.txt"`
	});
	res.status(200).send(brew.text);
});

//User Page
app.get('/user/:username', async (req, res, next)=>{
	const ownAccount = req.account && (req.account.username == req.params.username);

	const fields = [
		'googleId',
		'title',
		'pageCount',
		'description',
		'authors',
		'published',
		'views',
		'shareId',
		'editId',
		'createdAt',
		'updatedAt',
		'lastViewed'
	];

	let brews = await HomebrewModel.getByUser(req.params.username, ownAccount, fields)
	.catch((err)=>{
		console.log(err);
	});

	if(ownAccount && req?.account?.googleId){
		const auth = await GoogleActions.authCheck(req.account, res);
		let googleBrews = await GoogleActions.listGoogleBrews(auth)
			.catch((err)=>{
				console.error(err);
			});

		if(googleBrews && googleBrews.length > 0) {
			for (const brew of brews.filter((brew)=>brew.googleId)) {
				const match = googleBrews.findIndex((b)=>b.editId === brew.editId);
				if(match !== -1) {
					brew.googleId = googleBrews[match].googleId;
					brew.stubbed = true;
					brew.pageCount = googleBrews[match].pageCount;
					brew.renderer = googleBrews[match].renderer;
					brew.version = googleBrews[match].version;
					googleBrews.splice(match, 1);
				}
			}

			googleBrews = googleBrews.map((brew)=>({ ...brew, authors: [req.account.username] }));
			brews = _.concat(brews, googleBrews);
		}
	}

	req.brews = _.map(brews, (brew)=>{
		return sanitizeBrew(brew, ownAccount ? 'edit' : 'share');
	});

	return next();
});

//Edit Page
app.get('/edit/:id', asyncHandler(getBrew('edit')), (req, res, next)=>{
	req.brew = req.brew.toObject ? req.brew.toObject() : req.brew;
	sanitizeBrew(req.brew, 'edit');
	splitTextStyleAndMetadata(req.brew);
	res.header('Cache-Control', 'no-cache, no-store');	//reload the latest saved brew when pressing back button, not the cached version before save.
	return next();
});

//New Page
app.get('/new/:id', asyncHandler(getBrew('share')), (req, res, next)=>{
	sanitizeBrew(req.brew, 'share');
	splitTextStyleAndMetadata(req.brew);
	req.brew.title = `CLONE - ${req.brew.title}`;
	return next();
});

//Share Page
app.get('/share/:id', asyncHandler(getBrew('share')), asyncHandler(async (req, res, next)=>{
	const { brew } = req;

	if(req.params.id.length > 12 && !brew._id) {
		const googleId = req.params.id.slice(0, -12);
		const shareId = req.params.id.slice(-12);
		await GoogleActions.increaseView(googleId, shareId, 'share', brew)
			.catch((err)=>{next(err);});
	} else {
		await HomebrewModel.increaseView({ shareId: brew.shareId });
	}
	sanitizeBrew(req.brew, 'share');
	splitTextStyleAndMetadata(req.brew);
	return next();
}));

//Print Page
app.get('/print/:id', asyncHandler(getBrew('share')), (req, res, next)=>{
	sanitizeBrew(req.brew, 'share');
	splitTextStyleAndMetadata(req.brew);
	next();
});

const nodeEnv = config.get('node_env');
const isLocalEnvironment = config.get('local_environments').includes(nodeEnv);
// Local only
if(isLocalEnvironment){
	// Login
	app.post('/local/login', (req, res)=>{
		const username = req.body.username;
		if(!username) return;

		const payload = jwt.encode({ username: username, issued: new Date }, config.get('secret'));
		return res.json(payload);
	});
}



//Render the page
const templateFn = require('./../client/template.js');
app.use(asyncHandler(async (req, res, next)=>{
	// Create configuration object
	const configuration = {
		local       : isLocalEnvironment,
		publicUrl   : config.get('publicUrl') ?? '',
		environment : nodeEnv
	};
	const props = {
		version     : require('./../package.json').version,
		url         : req.originalUrl,
		brew        : req.brew,
		brews       : req.brews,
		googleBrews : req.googleBrews,
		account     : req.account,
		enable_v3   : config.get('enable_v3'),
		config      : configuration
	};
	const title = req.brew ? req.brew.title : '';
	const page = await templateFn('homebrew', title, props)
		.catch((err)=>{
			console.log(err);
			return res.sendStatus(500);
		});
	if(!page) return;
	res.send(page);
}));

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

app.use((req, res)=>{
	if(!res.headersSent) {
		console.error('Headers have not been sent, responding with a server error.', req.url);
		res.status(500).send('An error occurred and the server did not send a response. The error has been logged, please note the time this occurred and report this issue.');
	}
});
//^=====--------------------------------------=====^//

module.exports = {
	app : app
};
