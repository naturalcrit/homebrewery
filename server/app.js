/*eslint max-lines: ["warn", {"max": 500, "skipBlankLines": true, "skipComments": true}]*/
// Set working directory to project root
process.chdir(`${__dirname}/..`);

const _ = require('lodash');
const jwt = require('jwt-simple');
const express = require('express');
const yaml = require('js-yaml');
const app = express();
const config = require('./config.js');

const { homebrewApi, getBrew } = require('./homebrew.api.js');
const serveCompressedStaticAssets = require('./static-assets.mv.js');
const sanitizeFilename = require('sanitize-filename');
const asyncHandler = require('express-async-handler');

const { DEFAULT_BREW } = require('./brewDefaults.js');

const splitTextStyleAndMetadata = (brew)=>{
	brew.text = brew.text.replaceAll('\r\n', '\n');
	if(brew.text.startsWith('```metadata')) {
		const index = brew.text.indexOf('```\n\n');
		const metadataSection = brew.text.slice(12, index - 1);
		const metadata = yaml.load(metadataSection);
		Object.assign(brew, _.pick(metadata, ['title', 'description', 'tags', 'systems', 'renderer', 'theme', 'lang']));
		brew.text = brew.text.slice(index + 5);
	}
	if(brew.text.startsWith('```css')) {
		const index = brew.text.indexOf('```\n\n');
		brew.style = brew.text.slice(7, index - 1);
		brew.text = brew.text.slice(index + 5);
	}
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
app.use(require('./middleware/content-negotiation.js'));
app.use(require('body-parser').json({ limit: '25mb' }));
app.use(require('cookie-parser')());
app.use(require('./forcessl.mw.js'));

//Account Middleware
app.use((req, res, next)=>{
	if(req.cookies && req.cookies.nc_session){
		try {
			req.account = jwt.decode(req.cookies.nc_session, config.get('secret'));
		} catch (e){}
	}
	return next();
});

app.use(homebrewApi);
app.use(require('./admin.api.js'));

const HomebrewModel     = require('./homebrew.model.js').model;
const welcomeText       = require('fs').readFileSync('client/homebrew/pages/homePage/welcome_msg.md', 'utf8');
const changelogText     = require('fs').readFileSync('changelog.md', 'utf8');
const faqText           = require('fs').readFileSync('faq.md', 'utf8');

String.prototype.replaceAll = function(s, r){return this.split(s).join(r);};

const defaultMetaTags = {
	site_name   : 'Ilaris Brauerei - Erstelle Dokumente im Ilaris-Look!',
	title       : 'Ilaris Brauerei',
	description : 'Ein Online-Editor für das Erstellen von Abenteuern und Spielhilfen.',
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
		renderer : 'V3'
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
		renderer : 'legacy'
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
		renderer : 'V3'
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
		renderer : 'V3'
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
		renderer : 'V3'
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

//User Page
app.get('/user/:username', async (req, res, next)=>{
	const ownAccount = req.account && (req.account.username == req.params.username);

	req.ogMeta = { ...defaultMetaTags,
		title       : `${req.params.username}'s Collection`,
		description : 'View my collection of homebrew on the Homebrewery.'
		// type        :  could be 'profile'?
	};

	const fields = [
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

	req.brews = _.map(brews, (brew)=>{
		return sanitizeBrew(brew, ownAccount ? 'edit' : 'share');
	});

	return next();
});

//Edit Page
app.get('/edit/:id', asyncHandler(getBrew('edit')), (req, res, next)=>{
	req.brew = req.brew.toObject ? req.brew.toObject() : req.brew;

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
});

//New Page
app.get('/new/:id', asyncHandler(getBrew('share')), (req, res, next)=>{
	sanitizeBrew(req.brew, 'share');
	splitTextStyleAndMetadata(req.brew);
	const brew = {
		shareId  : req.brew.shareId,
		title    : `CLONE - ${req.brew.title}`,
		text     : req.brew.text,
		style    : req.brew.style,
		renderer : req.brew.renderer,
		theme    : req.brew.theme
	};
	req.brew = _.defaults(brew, DEFAULT_BREW);

	req.ogMeta = { ...defaultMetaTags,
		title       : 'Neu',
		description : 'Köchel dir ein neues Gebräu zusammen!'
	};

	return next();
});

//Share Page
app.get('/share/:id', asyncHandler(getBrew('share')), asyncHandler(async (req, res, next)=>{
	const { brew } = req;

	req.ogMeta = { ...defaultMetaTags,
		title       : req.brew.title || 'Unbenanntes Gebräu',
		description : req.brew.description || 'Keine Beschreibung',
		image       : req.brew.thumbnail || defaultMetaTags.image,
		type        : 'article'
	};

	await HomebrewModel.increaseView({ shareId: brew.shareId });
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

//Account Page
app.get('/account', asyncHandler(async (req, res, next)=>{
	const data = {};
	data.title = 'Account Information Page';

	let auth;
	if(req.account) {
		const query = { authors: req.account.username };
		const mongoCount = await HomebrewModel.countDocuments(query)
			.catch((err)=>{
				mongoCount = 0;
				console.log(err);
			});

		data.uiItems = {
			username    : req.account.username,
			issued      : req.account.issued,
			authCheck   : Boolean(auth.credentials.access_token),
			mongoCount  : mongoCount,
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

//Render the page
const templateFn = require('./../client/template.js');
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
		account       : req.account,
		enable_v3     : config.get('enable_v3'),
		enable_themes : config.get('enable_themes'),
		config        : configuration,
		ogMeta        : req.ogMeta
	};
	const title = req.brew ? req.brew.title : '';
	const page = await templateFn('homebrew', title, props)
		.catch((err)=>{
			console.log(err);
		});
	return page;
};

//Send rendered page
app.use(asyncHandler(async (req, res, next)=>{
	const page = await renderPage(req, res);
	if(!page) return;
	res.send(page);
}));

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
	const status = err.status || err.code || 500;
	console.error(err);

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
		res.status(500).send('Es ist ein Fehler aufgetreten. Der Server antwortet nicht. Wenn der Fehler erneut auftritt kontaktiere einen Entwickler.');
	}
});
//^=====--------------------------------------=====^//

module.exports = {
	app : app
};
