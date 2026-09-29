/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
// page-routes.js

import { dirname }       from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(`${__dirname}/..`);

import _       from 'lodash';
import express from 'express';
import asyncHandler from 'express-async-handler';
import fs from 'fs';

//==== Middleware Imports ====//
import dbCheck                       from './middleware/dbCheck.js';
import sanitizeFilename              from 'sanitize-filename';
import { DEFAULT_BREW }              from './brewDefaults.js';
import { splitTextStyleAndMetadata } from '../shared/helpers.js';
import GoogleActions                 from './googleActions.js';

import api from './homebrew.api.js';
const { getBrew, getUsersBrewThemes } = api;

const welcomeText       = fs.readFileSync('./client/homebrew/pages/homePage/welcome_msg.md', 'utf8');
const welcomeTextLegacy = fs.readFileSync('./client/homebrew/pages/homePage/welcome_msg_legacy.md', 'utf8');
const migrateText       = fs.readFileSync('./client/homebrew/pages/homePage/migrate.md', 'utf8');
const changelogText     = fs.readFileSync('changelog.md', 'utf8');
const faqText           = fs.readFileSync('faq.md', 'utf8');

export default function pageRoutes({
	defaultMetaTags,
	HomebrewModel,
	sanitizeBrew,
}) {
	const app = express.Router();

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

	//User Page
	app.get('/user/:username', dbCheck, async (req, res, next)=>{
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

		brews.forEach((brew)=>brew.stubbed = true); //All brews from MongoDB are "stubbed"

		if(ownAccount && req?.account?.googleId){
			const auth = await GoogleActions.authCheck(req.account, res);
			let googleBrews = await GoogleActions.listGoogleBrews(auth)
                .catch((err)=>{
                	console.error(err);
                });

			// If stub matches file from Google, use Google metadata over stub metadata
			if(googleBrews && googleBrews.length > 0) {
				for (const brew of brews.filter((brew)=>brew.googleId)) {
					const match = googleBrews.findIndex((b)=>b.editId === brew.editId);
					if(match !== -1) {
						brew.googleId = googleBrews[match].googleId;
						brew.pageCount = googleBrews[match].pageCount;
						brew.renderer = googleBrews[match].renderer;
						brew.version = googleBrews[match].version;
						brew.webViewLink = googleBrews[match].webViewLink;
						googleBrews.splice(match, 1);
					}
				}

				//Remaining unstubbed google brews display current user as author
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
			locale      : req.brew.lang,
			type        : 'article'
		};

		sanitizeBrew(req.brew, 'edit');
		res.header('Cache-Control', 'no-cache, no-store');	//reload the latest saved brew when pressing back button, not the cached version before save.
		return next();
	}));

	//New Page from ID
	app.get('/new/:id', asyncHandler(getBrew('share')), asyncHandler(async(req, res, next)=>{
		sanitizeBrew(req.brew, 'share');
		const brew = {
			shareId  : req.brew.shareId,
			title    : `CLONE - ${req.brew.title}`,
			text     : req.brew.text,
			style    : req.brew.style,
			renderer : req.brew.renderer,
			theme    : req.brew.theme,
			tags     : req.brew.tags,
			snippets : req.brew.snippets
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
	app.get('/share/:id', dbCheck, asyncHandler(getBrew('share')), asyncHandler(async (req, res, next)=>{
		const { brew } = req;
		req.ogMeta = { ...defaultMetaTags,
			title       : `${req.brew.title || 'Untitled Brew'} - ${req.brew.authors[0] || 'No author.'}`,
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
		return next();
	}));

	//Account Page
	app.get('/account', dbCheck, asyncHandler(async (req, res, next)=>{
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
				auth = await GoogleActions.authCheck(req.account, res, false);

				googleCount = await GoogleActions.listGoogleBrews(auth)
                    .catch((err)=>{
                    	console.error(err);
                    });
			}

			const query = { authors: req.account.username, googleId: { $exists: false } };
			const mongoCount = await HomebrewModel.countDocuments(query)
                .catch((err)=>{
                	console.log(err);
                	return 0;
                });

			data.accountDetails = {
				username    : req.account.username,
				issued      : req.account.issued,
				googleId    : Boolean(req.account.googleId),
				authCheck   : Boolean(req.account.googleId && auth?.credentials.access_token),
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

	//Vault Page
	app.get('/vault', asyncHandler(async(req, res, next)=>{
		req.ogMeta = { ...defaultMetaTags,
			title       : 'The Vault',
			description : 'Search for Brews'
		};
		return next();
	}));

	return app;
}