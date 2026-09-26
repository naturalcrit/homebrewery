/*eslint max-lines: ["warn", {"max": 400, "skipBlankLines": true, "skipComments": true}]*/
// Set working directory to project root
import { dirname }       from 'path';
import { fileURLToPath } from 'url';
import packageJSON from './../package.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(`${__dirname}/..`);
const version = packageJSON.version;

import _       from 'lodash';
import jwt     from 'jwt-simple';
import express from 'express';
import config  from './config.js';
import path from 'path';
import fs      from 'fs-extra';
import { splitTextStyleAndMetadata } from '../shared/helpers.js';

import api from './homebrew.api.js';
const { homebrewApi, getBrew, getCSS } = api;
import adminApi                    from './admin.api.js';
import vaultApi                    from './vault.api.js';
import pageRoutes from './page-routes.js';

import serveCompressedStaticAssets from './static-assets.mv.js';
import asyncHandler                from 'express-async-handler';
import { model as HomebrewModel }   from './homebrew.model.js';

//==== Middleware Imports ====//
import contentNegotiation from './middleware/content-negotiation.js';
import bodyParser         from 'body-parser';
import cookieParser       from 'cookie-parser';
import forceSSL           from './forcessl.mw.js';

import Stream from './eventStreamSource.js';
import dbCheck            from './middleware/dbCheck.js';

import cors from 'cors';

export default async function createApp(vite) {
	const app = express();

	const nodeEnv = config.get('node_env');
	const isProd = nodeEnv === 'production';
	const isLocalEnvironment = config.get('local_environments').includes(nodeEnv);

	const sanitizeBrew = (brew, accessType)=>{
		brew._id = undefined;
		brew.__v = undefined;
		if(accessType !== 'edit' && accessType !== 'shareAuthor') {
			brew.editId = undefined;
		}
		return brew;
	};

	app.set('trust proxy', 1 /* number of proxies between user and server */);

	if(vite) {
		app.use(vite.middlewares);
	}

	app.use('/', serveCompressedStaticAssets('build'));
	app.use(contentNegotiation);
	app.use(bodyParser.json({ limit: '25mb' }));
	app.use(cookieParser());
	app.use(forceSSL);


	const corsOptions = {
		origin : (origin, callback)=>{

			const allowedOrigins = [
				'https://homebrewery.naturalcrit.com',
				'https://www.naturalcrit.com',
				'https://naturalcrit-stage.herokuapp.com',
				'https://homebrewery-stage.herokuapp.com',
			];

			const localNetworkRegex = /^http:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):\d+$/;

			const herokuRegex = /^https:\/\/(?:homebrewery-pr-\d+\.herokuapp\.com|naturalcrit-pr-\d+\.herokuapp\.com)$/; // Matches any Heroku app

			if(!origin || allowedOrigins.includes(origin) || herokuRegex.test(origin) || (isLocalEnvironment && localNetworkRegex.test(origin))) {
				callback(null, true);
			} else {
				console.log(origin, 'not allowed');
				callback(new Error('Not allowed by CORS, if you think this is an error, please contact us'));
			}
		},
		methods     : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		credentials : true,
	};

	app.use(cors(corsOptions));

	//Account Middleware
	app.use((req, res, next)=>{
		if(req.cookies && req.cookies.nc_session){
			try {
				req.account = jwt.decode(req.cookies.nc_session, config.get('secret'));
			//console.log("Just loaded up JWT from cookie:");
			//console.log(req.account);
			} catch (e){
				console.log(e);
			}
		}

		req.config = {
			google_client_id     : config.get('google_client_id'),
			google_client_secret : config.get('google_client_secret')
		};
		return next();
	});

	app.use(homebrewApi);
	app.use(adminApi(vite));
	app.use(vaultApi);

	String.prototype.replaceAll = function(s, r){return this.split(s).join(r);};

	const defaultMetaTags = {
		site_name   : 'The Homebrewery - Make your Homebrew content look legit!',
		title       : 'The Homebrewery',
		description : 'A NaturalCrit Tool for creating authentic Homebrews using Markdown.',
		image       : `${config.get('publicUrl')}/thumbnail.png`,
		type        : 'website'
	};

	app.use(pageRoutes({
		defaultMetaTags,
		HomebrewModel,
		sanitizeBrew,
	}));

	//Robots.txt
	app.get('/robots.txt', (req, res)=>{
		return res.sendFile(`robots.txt`, { root: process.cwd() });
	});
	//serve brew for sharepage rerender
	app.get('/api/fetch/:id', asyncHandler(getBrew('share')), asyncHandler(async (req, res) => {
		const { brew } = req;
		brew.authors.includes(req.account?.username)
			? sanitizeBrew(brew, 'shareAuthor')
			: sanitizeBrew(brew, 'share');
		splitTextStyleAndMetadata(brew);
		res.json({ brew });
	}));

	//Serve brew metadata
	app.get('/metadata/:id', asyncHandler(getBrew('share')), (req, res)=>{
		const { brew } = req;
		sanitizeBrew(brew, 'share');

		const fields = ['title', 'pageCount', 'description', 'authors', 'lang',
	  'published', 'views', 'shareId', 'createdAt', 'updatedAt',
	  'lastViewed', 'thumbnail', 'tags'
		];

		const metadata = fields.reduce((acc, field)=>{
	  if(brew[field] !== undefined) acc[field] = brew[field];
	  return acc;
		}, {});
		res.status(200).json(metadata);
	});

	//Serve brew styling
	app.get('/css/:id', asyncHandler(getBrew('share')), (req, res)=>{getCSS(req, res);});

	//Change author name on brews
	app.put('/api/user/rename', dbCheck, async (req, res)=>{
		const { username, newUsername } = req.body;
		const ownAccount = req.account && (req.account.username == newUsername);

		if(!username || !newUsername)
			return res.status(400).json({ error: 'Username and newUsername are required.' });
		if(!ownAccount)
			return res.status(403).json({ error: 'Must be logged in to change your username' });
		try {
			const brews = await HomebrewModel.getByUser(username, true, ['authors']);
			const renamePromises = brews.map(async (brew)=>{
				const updatedAuthors = brew.authors.map((author)=>author === username ? newUsername : author
				);
				return HomebrewModel.updateOne(
					{ _id: brew._id },
					{ $set: { authors: updatedAuthors } }
				);
			});
			await Promise.all(renamePromises);

			return res.json({ success: true, message: `Brews for ${username} renamed to ${newUsername}.` });
		} catch (error) {
			console.error('Error renaming brews:', error);
			return res.status(500).json({ error: 'Failed to rename brews.' });
		}
	});

	//Delete brews based on author
	app.delete('/api/user/delete', async (req, res)=>{
		const { username } = req.body;

		if(!req.account || req.account.username !== username) {
			return res.status(403).json({error : 'Must be logged in to delete your account'});
		}

		try {
			const result = await api.deleteUserBrews(username, req.account);

			if(!result.success) {
				return res.status(500).json({
					error    : 'Failed to delete brew.',
					brewId   : result.brewId,
					googleId : result.googleId
				});
			}

			return res.json({
				success : true,
				message : `All brews for ${username} have been processed.`
			});
		} catch (error) {
			console.error('Error deleting user brews:', error);

			return res.status(500).json({
				error : 'Failed to process user brews.'
			});
		}
	});

	// Create Event Stream source for pages to listen to
	app.get('/stream', (req, res)=>{
		res.writeHead(200, {
			'Content-Type'     : 'text/event-stream',
			'Cache-Control'    : 'no-cache',
			'Connection'       : 'keep-alive',
			'Content-Encoding' : 'none'
		});

		Stream.on('sendUpdate', (event, data)=>{
			console.log('Event:', event, '\nData:', data);
			res.write(`data: ${JSON.stringify({ ...data, eventType: event })}\n\n`);
		});
	});

	// After Stream starts, send initStream event
	setTimeout(()=>{
		Stream.emit('sendUpdate', 'initStream', { time: new Date });
	}, 1000);
	

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

	// Add Static Local Paths
	app.use('/staticImages', express.static(config.get('hb_images') && fs.existsSync(config.get('hb_images')) ? config.get('hb_images') :'staticImages'));
	app.use('/staticFonts', express.static(config.get('hb_fonts')  && fs.existsSync(config.get('hb_fonts')) ? config.get('hb_fonts'):'staticFonts'));

	//Send rendered page
	app.use(asyncHandler(async (req, res, next)=>{
		if(!req.route) return res.redirect('/'); // Catch-all for invalid routes

		const page = await renderPage(req, res);
		if(!page) return;
		res.send(page);
	}));

	//Render the page
	const renderPage = async (req, res)=>{

		// Create configuration object
		const configuration = {
			local            : isLocalEnvironment,
			publicUrl        : config.get('publicUrl') ?? '',
			baseUrl          : `${req.protocol}://${req.get('host')}`,
			environment      : nodeEnv,
			deployment       : config.get('heroku_app_name') ?? '',
			developmentStyle : config.get('development_style')
		};
		const props = {
			version     : version,
			url         : req.customUrl || req.originalUrl,
			brew        : req.brew,
			brews       : req.brews,
			googleBrews : req.googleBrews,
			account     : req.account,
			config      : configuration,
			ogMeta      : req.ogMeta,
			userThemes  : req.userThemes
		};

		const ogTags = [];
		const ogMeta = req.ogMeta ?? {};
		Object.entries(ogMeta).forEach(([key, value])=>{
			if(!value) return;
			const tag = `<meta property="og:${key}" content="${value}">`;
			ogTags.push(tag);
		});
		const ogMetaTags = ogTags.join('\n');

		const htmlPath = isProd ? path.resolve('build', 'index.html') : path.resolve('index.html');
		let html = fs.readFileSync(htmlPath, 'utf-8');

		if(!isProd && vite?.transformIndexHtml) {
			html = await vite.transformIndexHtml(req.originalUrl, html);
		}

		const safeProps = JSON.stringify(props).replace(/<(?=\/?script)/ig, '\\u003c');
		html = html.replace(
			'<head>',
			`<head>\n`
			+ `<script id="props">`
			+  `window.__INITIAL_PROPS__ = ` + safeProps
			+ `</script>\n`
			+ ogMetaTags
		);

		return html;
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

		if(err.originalUrl?.startsWith('/api')) {
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

	return app;
}
