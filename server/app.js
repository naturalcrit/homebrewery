/*eslint max-lines: ["warn", {"max": 500, "skipBlankLines": true, "skipComments": true}]*/
// Set working directory to project root
process.chdir(`${__dirname}/..`);

const _ = require('lodash');
const jwt = require('jwt-simple');
const express = require('express');
const yaml = require('js-yaml');
const app = express();
const config = require('./config.js');

const { homebrewApi, getBrew, getUsersBrewThemes, getCSS } = require('./homebrew.api.js');
const GoogleActions = require('./googleActions.js');
const serveCompressedStaticAssets = require('./static-assets.mv.js');
const sanitizeFilename = require('sanitize-filename');
const asyncHandler = require('express-async-handler');
const templateFn = require('./../client/template.js');

const { DEFAULT_BREW } = require('./brewDefaults.js');

const { splitTextStyleAndMetadata } = require('../shared/helpers.js');


const sanitizeBrew = (brew, accessType)=>{
	brew._id = undefined;
	brew.__v = undefined;
	if(accessType !== 'edit' && accessType !== 'shareAuthor') {
		brew.editId = undefined;
	}
	return brew;
};

app.use('/', serveCompressedStaticAssets(`build`));
app.use(require('./middleware/content-negotiation.js'));
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

const HomebrewModel     = require('./homebrew.model.js').model;
const welcomeText       = require('fs').readFileSync('client/homebrew/pages/homePage/welcome_msg.md', 'utf8');
const welcomeTextLegacy = require('fs').readFileSync('client/homebrew/pages/homePage/welcome_msg_legacy.md', 'utf8');
const migrateText       = require('fs').readFileSync('client/homebrew/pages/homePage/migrate.md', 'utf8');
const changelogText     = require('fs').readFileSync('changelog.md', 'utf8');
const faqText           = require('fs').readFileSync('faq.md', 'utf8');

String.prototype.replaceAll = function(s, r){return this.split(s).join(r);};

const defaultMetaTags = {
	site_name   : 'The Homebrewery - Make your Homebrew content look legit!',
	title       : 'The Homebrewery',
	description : 'A NaturalCrit Tool for creating authentic Homebrews using Markdown.',
	image       : `${config.get('publicUrl')}/thumbnail.png`,
	type        : 'website'
};

//Robots.txt
app.get('/robots.txt', (req, res)=>{
	return res.sendFile(`robots.txt`, { root: process.cwd() });
});

//Home page
app.get('/', (req, res, next)=>{
	req.brew = {
		text     : welcomeText,
		renderer : 'V3',
		theme    : '5ePHB'
	},

	req.ogMeta = { ...defaultMetaTags,
		title       : 'Homepage',
		description : 'Homepage'
	};

	splitTextStyleAndMetadata(req.brew);
	return next();
});

//Home page Legacy
app.get('/legacy', (req, res, next)=>{
	req.brew = {
		text     : welcomeTextLegacy,
		renderer : 'legacy',
		theme    : '5ePHB'
	},

	req.ogMeta = { ...defaultMetaTags,
		title       : 'Homepage (Legacy)',
		description : 'Homepage'
	};

	splitTextStyleAndMetadata(req.brew);
	return next();
});

//Legacy/Other Document -> v3 Migration Guide
app.get('/migrate', (req, res, next)=>{
	req.brew = {
		text     : migrateText,
		renderer : 'V3',
		theme    : '5ePHB'
	},

	req.ogMeta = { ...defaultMetaTags,
		title       : 'v3 Migration Guide',
		description : 'A brief guide to converting Legacy documents to the v3 renderer.'
	};

	splitTextStyleAndMetadata(req.brew);
	return next();
});

//Changelog page
app.get('/changelog', async (req, res, next)=>{
	req.brew = {
		title    : 'Changelog',
		text     : changelogText,
		renderer : 'V3',
		theme    : '5ePHB'
	},

	req.ogMeta = { ...defaultMetaTags,
		title       : 'Changelog',
		description : 'Development changelog.'
	};

	splitTextStyleAndMetadata(req.brew);
	return next();
});

//FAQ page
app.get('/faq', async (req, res, next)=>{
	req.brew = {
		title    : 'FAQ',
		text     : faqText,
		renderer : 'V3',
		theme    : '5ePHB'
	},

	req.ogMeta = { ...defaultMetaTags,
		title       : 'FAQ',
		description : 'Frequently Asked Questions'
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

	const encodeRFC3986ValueChars = (str)=>{
		return (
			encodeURIComponent(str)
				.replace(/[!'()*]/g, (char)=>{`%${char.charCodeAt(0).toString(16).toUpperCase()}`;})
		);
	};

	let fileName = sanitizeFilename(`${prefix}${brew.title}`).replaceAll(' ', '');
	if(!fileName || !fileName.length) { fileName = `${prefix}-Untitled-Brew`; };
	res.set({
		'Cache-Control'       : 'no-cache',
		'Content-Type'        : 'text/plain',
		'Content-Disposition' : `attachment; filename*=UTF-8''${encodeRFC3986ValueChars(fileName)}.txt`
	});
	res.status(200).send(brew.text);
});

//Serve brew styling
app.get('/css/:id', asyncHandler(getBrew('share')), (req, res)=>{getCSS(req, res);});

//User Page
app.get('/user/:username', async (req, res, next)=>{
	const ownAccount = req.account && (req.account.username == req.params.username);

	req.ogMeta = { ...defaultMetaTags,
		title       : `${req.params.username}'s Collection`,
		description : 'View my collection of homebrew on the Homebrewery.'
		// type        :  could be 'profile'?
	};

	const fields = [
		'googleId',
		'title',
		'pageCount',
		'description',
		'authors',
		'lang',
		'published',
		'views',
		'shareId',
		'editId',
		'createdAt',
		'updatedAt',
		'lastViewed',
		'thumbnail',
		'tags'
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
					brew.webViewLink = googleBrews[match].webViewLink;
					googleBrews.splice(match, 1);
				}
			}

			googleBrews = googleBrews.map((brew)=>({ ...brew, authors: [req.account.username] }));
			brews = _.concat(brews, googleBrews);
		}
	}

	req.brews = _.map(brews, (brew)=>{
		// Clean up brew data
		brew.title = brew.title?.trim();
		brew.description = brew.description?.trim();
		return sanitizeBrew(brew, ownAccount ? 'edit' : 'share');
	});

	return next();
});

//Edit Page
app.get('/edit/:id', asyncHandler(getBrew('edit')), asyncHandler(async(req, res, next)=>{
	req.brew = req.brew.toObject ? req.brew.toObject() : req.brew;

	req.userThemes = await(getUsersBrewThemes(req.account?.username));

	req.ogMeta = { ...defaultMetaTags,
		title       : req.brew.title || 'Untitled Brew',
		description : req.brew.description || 'No description.',
		image       : req.brew.thumbnail || defaultMetaTags.image,
		type        : 'article'
	};

	sanitizeBrew(req.brew, 'edit');
	splitTextStyleAndMetadata(req.brew);
	res.header('Cache-Control', 'no-cache, no-store');	//reload the latest saved brew when pressing back button, not the cached version before save.
	return next();
}));

//New Page from ID
app.get('/new/:id', asyncHandler(getBrew('share')), asyncHandler(async(req, res, next)=>{
	sanitizeBrew(req.brew, 'share');
	splitTextStyleAndMetadata(req.brew);
	const brew = {
		shareId  : req.brew.shareId,
		title    : `CLONE - ${req.brew.title}`,
		text     : req.brew.text,
		style    : req.brew.style,
		renderer : req.brew.renderer,
		theme    : req.brew.theme,
		tags     : req.brew.tags,
	};
	req.brew = _.defaults(brew, DEFAULT_BREW);

	req.userThemes = await(getUsersBrewThemes(req.account?.username));

	req.ogMeta = { ...defaultMetaTags,
		title       : 'New',
		description : 'Start crafting your homebrew on the Homebrewery!'
	};

	return next();
}));

//New Page
app.get('/new', asyncHandler(async(req, res, next)=>{
	req.userThemes = await(getUsersBrewThemes(req.account?.username));

	req.ogMeta = { ...defaultMetaTags,
		title       : 'New',
		description : 'Start crafting your homebrew on the Homebrewery!'
	};

	return next();
}));

//Share Page
app.get('/share/:id', asyncHandler(getBrew('share')), asyncHandler(async (req, res, next)=>{
	const { brew } = req;
	req.ogMeta = { ...defaultMetaTags,
		title       : req.brew.title || 'Untitled Brew',
		description : req.brew.description || 'No description.',
		image       : req.brew.thumbnail || defaultMetaTags.image,
		type        : 'article'
	};

	// increase visitor view count, do not include visits by author(s)
	if(!brew.authors.includes(req.account?.username)){
		if(req.params.id.length > 12 && !brew._id) {
			const googleId = brew.googleId;
			const shareId = brew.shareId;
			await GoogleActions.increaseView(googleId, shareId, 'share', brew)
				.catch((err)=>{next(err);});
		} else {
			await HomebrewModel.increaseView({ shareId: brew.shareId });
		}
	};

	brew.authors.includes(req.account?.username) ? sanitizeBrew(req.brew, 'shareAuthor') : sanitizeBrew(req.brew, 'share');
	splitTextStyleAndMetadata(req.brew);
	return next();
}));

//Account Page
app.get('/account', asyncHandler(async (req, res, next)=>{
	const data = {};
	data.title = 'Account Information Page';
	
	if(!req.account) {
		res.set('WWW-Authenticate', 'Bearer realm="Authorization Required"');
		const error = new Error('No valid account');
		error.status = 401;
		error.HBErrorCode = '50';
		error.page = data.title;
		return next(error);
	};

	let auth;
	let googleCount = [];
	if(req.account) {
		if(req.account.googleId) {
			try {
				auth = await GoogleActions.authCheck(req.account, res, false);
			} catch (e) {
				auth = undefined;
				console.log('Google auth check failed!');
				console.log(e);
			}
			if(auth.credentials.access_token) {
				try {
					googleCount = await GoogleActions.listGoogleBrews(auth);
				} catch (e) {
					googleCount = undefined;
					console.log('List Google files failed!');
					console.log(e);
				}
			}
		}

		const query = { authors: req.account.username, googleId: { $exists: false } };
		const mongoCount = await HomebrewModel.countDocuments(query)
			.catch((err)=>{
				mongoCount = 0;
				console.log(err);
			});

		data.accountDetails = {
			username    : req.account.username,
			issued      : req.account.issued,
			googleId    : Boolean(req.account.googleId),
			authCheck   : Boolean(req.account.googleId && auth.credentials.access_token),
			mongoCount  : mongoCount,
			googleCount : googleCount?.length
		};
	}

	req.brew = data;

	req.ogMeta = { ...defaultMetaTags,
		title       : `Account Page`,
		description : null
	};

	return next();
}));

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

//Send rendered page
app.use(asyncHandler(async (req, res, next)=>{
	if (!req.route) return res.redirect('/'); // Catch-all for invalid routes
		
	const page = await renderPage(req, res);
	if(!page) return;
	res.send(page);
}));

//Render the page
const renderPage = async (req, res)=>{
	// Create configuration object
	const configuration = {
		local       : isLocalEnvironment,
		publicUrl   : config.get('publicUrl') ?? '',
		environment : nodeEnv
	};
	const props = {
		version       : require('./../package.json').version,
		url           : req.customUrl || req.originalUrl,
		brew          : req.brew,
		brews         : req.brews,
		googleBrews   : req.googleBrews,
		account       : req.account,
		enable_v3     : config.get('enable_v3'),
		enable_themes : config.get('enable_themes'),
		config        : configuration,
		ogMeta        : req.ogMeta,
		userThemes    : req.userThemes
	};
	const title = req.brew ? req.brew.title : '';
	const page = await templateFn('homebrew', title, props)
		.catch((err)=>{
			console.log(err);
		});
	return page;
};

//v=====----- Error-Handling Middleware -----=====v//
//Format Errors as plain objects so all fields will appear in the string sent
const formatErrors = (key, value)=>{
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
	return JSON.parse(JSON.stringify(error, formatErrors));
};

app.use(async (err, req, res, next)=>{
	err.originalUrl = req.originalUrl;
	console.error(err);

	if(err.originalUrl?.startsWith('/api/')) {
		// console.log('API error');
		res.status(err.status || err.response?.status || 500).send(err);
		return;
	}

	// console.log('non-API error');
	const status = err.status || err.code || 500;

	req.ogMeta = { ...defaultMetaTags,
		title       : 'Error Page',
		description : 'Something went wrong!'
	};
	req.brew = {
		...err,
		title       : 'Error - Something went wrong!',
		text        : err.errors?.map((error)=>{return error.message;}).join('\n\n') || err.message || 'Unknown error!',
		status      : status,
		HBErrorCode : err.HBErrorCode ?? '00',
		pureError   : getPureError(err)
	};
	req.customUrl= '/error';

	const page = await renderPage(req, res);
	if(!page) return;
	res.send(page);
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
