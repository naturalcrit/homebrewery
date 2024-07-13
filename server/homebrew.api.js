/* eslint-disable max-lines */
const _ = require('lodash');
const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const zlib = require('zlib');
const GoogleActions = require('./googleActions.js');
const Markdown = require('../shared/naturalcrit/markdown.js');
const yaml = require('js-yaml');
const asyncHandler = require('express-async-handler');
const { nanoid } = require('nanoid');
const path = require('path');
const fs = require('fs');
const { splitTextStyleAndMetadata } = require('../shared/helpers.js');

const { DEFAULT_BREW, DEFAULT_BREW_LOAD } = require('./brewDefaults.js');

const Themes = require('../themes/themes.json');

const isStaticTheme = (renderer, themeName)=>{
	return Themes[renderer]?.[themeName] !== undefined;
};

// const getTopBrews = (cb) => {
// 	HomebrewModel.find().sort({ views: -1 }).limit(5).exec(function(err, brews) {
// 		cb(brews);
// 	});
// };

const MAX_TITLE_LENGTH = 100;

const api = {
	homebrewApi : router,
	getId       : (req)=>{
		// Set the id and initial potential google id, where the google id is present on the existing brew.
		let id = req.params.id, googleId = req.body?.googleId;

		// If the id is longer than 12, then it's a google id + the edit id. This splits the longer id up.
		if(id.length > 12) {
			if(id.length >= (33 + 12)) {    // googleId is minimum 33 chars (may increase)
				googleId = id.slice(0, -12);  // current editId is 12 chars
			} else {                        // old editIds used to be 10 chars;
				googleId = id.slice(0, -10);  // if total string is too short, must be old brew
				console.log('Old brew, using 10-char Id');
			}
			id = id.slice(googleId.length);
		}
		return { id, googleId };
	},
	getUsersBrewThemes : async (username, id)=>{
		const fields = [
			'title',
			'tags',
			'shareId',
			'thumbnail',
			'textBin',
			'text',
			'authors'
		];

		const userThemes = {
			Brew : {

			}
		};

		const brews = await HomebrewModel.getByUser(username, true, fields, { tags: { $in: ['meta:theme', 'meta:Theme'] }, shareId: { $ne: id }, renderer: { $ne: 'Legacy' } });

		if(brews) {
			for await (const brew of brews) {
				userThemes.Brew[brew.shareId] = {
					name         : brew.title,
					renderer     : 'V3',
					baseTheme    : '',
					baseSnippets : false,
					author       : brew.authors[0],
					path         : brew.shareId,
					thumbnail    : brew.thumbnail.length > 0 ? brew.thumbnail : '/assets/naturalCritLogoWhite.svg'
				};
			}
		}

		return userThemes;
	},
	getBrew : (accessType, stubOnly = false)=>{
		// Create middleware with the accessType passed in as part of the scope
		return async (req, res, next)=>{

			// Get relevant IDs for the brew
			const { id, googleId } = api.getId(req);

			// Try to find the document in the Homebrewery database -- if it doesn't exist, that's fine.
			let stub = await HomebrewModel.get((accessType === 'edit') ? { editId: id } : { shareId: id })
				.catch((err)=>{
					if(googleId) {
						console.warn(`Unable to find document stub for ${accessType}Id ${id}`);
					} else {
						console.warn(err);
					}
				});
			stub = stub?.toObject();

			if(stub?.lock?.locked && accessType != 'edit') {
				throw { HBErrorCode: '100', code: stub.lock.code, message: stub.lock.shareMessage, brewId: stub.shareId, brewTitle: stub.title };
			}

			// If there is a google id, try to find the google brew
			if(!stubOnly && (googleId || stub?.googleId)) {
				let googleError;
				const googleBrew = await GoogleActions.getGoogleBrew(googleId || stub?.googleId, id, accessType)
					.catch((err)=>{
						googleError = err;
					});
				// Throw any error caught while attempting to retrieve Google brew.
				if(googleError) {
					const reason = googleError.errors?.[0].reason;
					if(reason == 'notFound') {
						throw { ...googleError, HBErrorCode: '02', authors: stub?.authors, account: req.account?.username };
					} else {
						throw { ...googleError, HBErrorCode: '01' };
					}
				}
				// Combine the Homebrewery stub with the google brew, or if the stub doesn't exist just use the google brew
				stub = stub ? _.assign({ ...api.excludeStubProps(stub), stubbed: true }, api.excludeGoogleProps(googleBrew)) : googleBrew;
			}
			const authorsExist = stub?.authors?.length > 0;
			const isAuthor = stub?.authors?.includes(req.account?.username);
			const isInvited = stub?.invitedAuthors?.includes(req.account?.username);
			if(accessType === 'edit' && (authorsExist && !(isAuthor || isInvited))) {
				const accessError = { name: 'Access Error', status: 401 };
				if(req.account){
					throw { ...accessError, message: 'User is not an Author', HBErrorCode: '03', authors: stub.authors, brewTitle: stub.title, shareId: stub.shareId };
				}
				throw { ...accessError, message: 'User is not logged in', HBErrorCode: '04', authors: stub.authors, brewTitle: stub.title, shareId: stub.shareId };
			}

			// If after all of that we still don't have a brew, throw an exception
			if(!stub && !stubOnly) {
				throw { name: 'BrewLoad Error', message: 'Brew not found', status: 404, HBErrorCode: '05', accessType: accessType, brewId: id };
			}

			const mainAuthor = stub.authors ? stub.authors[0] : '';
			const userID = req?.account?.username && (accessType === 'edit') ? req.account.username : mainAuthor;

			// Clean up brew: fill in missing fields with defaults / fix old invalid values
			const userThemes = accessType != 'themes' ? await api.getUsersBrewThemes(userID, id, req, res, next) : {};
			if(stub) {
				stub.tags     = stub.tags     || undefined; // Clear empty strings
				stub.renderer = stub.renderer || undefined; // Clear empty strings
				stub = _.defaults(stub, DEFAULT_BREW_LOAD); // Fill in blank fields
				stub.userThemes = userThemes;
			}

			req.brew = stub ?? {};
			next();
		};
	},
	mergeBrewText : (brew)=>{
		let text = brew.text;
		if(brew.style !== undefined) {
			text = `\`\`\`css\n` +
				`${brew.style || ''}\n` +
				`\`\`\`\n\n` +
				`${text}`;
		}
		const metadata = _.pick(brew, ['title', 'description', 'tags', 'systems', 'renderer', 'theme']);
		text = `\`\`\`metadata\n` +
			`${yaml.dump(metadata)}\n` +
			`\`\`\`\n\n` +
			`${text}`;
		return text;
	},
	getGoodBrewTitle : (text)=>{
		const tokens = Markdown.marked.lexer(text);
		return (tokens.find((token)=>token.type === 'heading' || token.type === 'paragraph')?.text || 'No Title')
			.slice(0, MAX_TITLE_LENGTH);
	},
	excludePropsFromUpdate : (brew)=>{
		// Remove undesired properties
		const modified = _.clone(brew);
		const propsToExclude = ['_id', 'views', 'lastViewed'];
		for (const prop of propsToExclude) {
			delete modified[prop];
		}
		return modified;
	},
	excludeGoogleProps : (brew)=>{
		const modified = _.clone(brew);
		const propsToExclude = ['version', 'tags', 'systems', 'published', 'authors', 'owner', 'views', 'thumbnail'];
		for (const prop of propsToExclude) {
			delete modified[prop];
		}
		return modified;
	},
	excludeStubProps : (brew)=>{
		const propsToExclude = ['text', 'textBin', 'renderer', 'pageCount'];
		for (const prop of propsToExclude) {
			brew[prop] = undefined;
		}
		return brew;
	},
	beforeNewSave : (account, brew)=>{
		if(!brew.title) {
			brew.title = api.getGoodBrewTitle(brew.text);
		}

		brew.authors = (account) ? [account.username] : [];
		brew.text = api.mergeBrewText(brew);

		_.defaults(brew, DEFAULT_BREW);

		brew.title = brew.title.trim();
		brew.description = brew.description.trim();
	},
	newGoogleBrew : async (account, brew, res)=>{
		const oAuth2Client = GoogleActions.authCheck(account, res);

		const newBrew = api.excludeGoogleProps(brew);

		return await GoogleActions.newGoogleBrew(oAuth2Client, newBrew);
	},
	newBrew : async (req, res)=>{
		const brew = req.body;
		const { saveToGoogle } = req.query;

		delete brew.editId;
		delete brew.shareId;
		delete brew.googleId;

		api.beforeNewSave(req.account, brew);

		const newHomebrew = new HomebrewModel(brew);
		newHomebrew.editId = nanoid(12);
		newHomebrew.shareId = nanoid(12);

		let googleId, saved;
		if(saveToGoogle) {
			googleId = await api.newGoogleBrew(req.account, newHomebrew, res)
				.catch((err)=>{
					console.error(err);
					res.status(err?.status || err?.response?.status || 500).send(err?.message || err);
				});
			if(!googleId) return;
			api.excludeStubProps(newHomebrew);
			newHomebrew.googleId = googleId;
		} else {
			// Compress brew text to binary before saving
			newHomebrew.textBin = zlib.deflateRawSync(newHomebrew.text);
			// Delete the non-binary text field since it's not needed anymore
			newHomebrew.text = undefined;
		}

		saved = await newHomebrew.save()
			.catch((err)=>{
				console.error(err, err.toString(), err.stack);
				throw { name: 'BrewSave Error', message: `Error while creating new brew, ${err.toString()}`, status: 500, HBErrorCode: '06' };
			});
		if(!saved) return;
		saved = saved.toObject();

		res.status(200).send(saved);
	},
	getThemeBundle : async(req, res)=>{
		/*
			getThemeBundle: Collects the theme and all parent themes
				returns an object containing an array of css, in render order, and an array
					of snippets ( currently empty )
			Important parameter members:
				req.params.id: This is the shareId ( User theme ) or name ( static theme )
					loaded first.
				req.params.engine: This is the Markdown+ version for the static theme. If a
					User theme the value will come from the User Theme metadata.
		*/
		let parentReq = {};
		const completeStyles = [];
		const completeSnippets = [];
		if(!req.params.engine) {
			// If this is not set, our *first* theme is a User theme.
			const finalChildBrew = req.brew;
			// Break up the frontmatter
			splitTextStyleAndMetadata(finalChildBrew);
			// If there is anything in the snippets member, append it to the snippets array.
			if(finalChildBrew?.snippets) completeSnippets.push(JSON.parse(finalChildBrew.snippets));
			// If there is anything in the styles member, append it to the styles array with labelling.
			if(finalChildBrew?.style) completeStyles.push(`/* From Brew: ${req.protocol}://${req.get('host')}/share/${req.params.id} */\n\n${finalChildBrew.style}`);

			// Set up the simulated request we are using for the parent-walking.
			// This is our loop control.
			parentReq = {
				params : {
					id : finalChildBrew.theme,
					// This is the only value needed for the User themes. This is the shareId of the theme.
				},
				renderer : finalChildBrew.renderer
				// We set this for use later when checking for Static theme inheritance.
			};
			while ((parentReq.params.id) && (!isStaticTheme(finalChildBrew.renderer, parentReq.params.id))) {
				await api.getBrew('share')(parentReq, res, ()=>{});
				// Load the referenced Brew
				splitTextStyleAndMetadata(parentReq);
				// break up the meta data
				if(parentReq?.snippets) completeSnippets.push(JSON.parse(parentReq.snippets));
				// If there is anything in the snippets member, append it to the snippets array.
				if(parentReq?.style) {
					completeStyles.push(`/* From Brew: ${req.protocol}://${req.get('host')}/share/${parentReq.params.id} */\n\n${parentReq.style}`);
					// If there is anything in the styles member, append it to the styles array with labelling.
				}
				// Update the loop object to point to this theme's parent
				parentReq.params.id = parentReq?.theme;
			}
		} else {
			// If the first theme wasn't a User theme, set up the loop control object
			// This is done the same as above for consistant logic.
			parentReq = {
				params : {
					id : req.params.id,
					// This is the name of the theme
				},
				renderer : req.params.engine
				// The renderer is needed for the static pathing.
			};
		}

		while ((parentReq.params.id) && (isStaticTheme(parentReq.renderer, parentReq.params.id))) {
			// If we have a static path
			const localStyle = fs.readFileSync(path.join(__dirname, '../build/themes/', parentReq.renderer, parentReq.params.id, 'style.css')).toString();
			// Read the Theme's style.css from the filesystem
			completeStyles.push(`/* From Theme ${parentReq.params.id} */\n\n${localStyle}`);
			// Label and append the themes style to the styles array.
			parentReq.params.id = Themes[parentReq.renderer][parentReq.params.id].baseTheme;
			// NOTE: This currently makes NO attempt to do anything with Static theme Snippets. Loading of static snippets remains unchanged.
		}

		const returnObj = {
			styles   : completeStyles.reverse(),
			// Reverse the order of the styles array so they are rendered oldest aprent to youngest child.
			snippets : completeSnippets
		};

		res.setHeader('Content-Type', 'text/json');
		return res.status(200).send(JSON.stringify(returnObj));
	},
	//Return CSS for a brew theme, with @include endpoint for its parent theme if any
	getBrewThemeCSS : async (req, res)=>{
		const brew = req.brew;
		splitTextStyleAndMetadata(brew);
		res.setHeader('Content-Type', 'text/css');
		let rendererPath = '';
		if(isStaticTheme(req.brew.renderer, req.brew.theme)) //Check if parent is staticBrew
			rendererPath = `${_.upperFirst(req.brew.renderer)}/`;

		console.log(`getBrewThemeCSS for ${brew.shareId}`);
		console.log(`and parentThemeImport for ${brew.theme}`);
		const parentThemeImport = `@import url(\"/css/${rendererPath}${req.brew.theme}\");\n\n`;
		const themeLocationComment = `/* From Brew: ${req.protocol}://${req.get('host')}/share/${req.brew.shareId} */\n\n`;
		return res.status(200).send(`${parentThemeImport}${themeLocationComment}${req.brew.style}`);
	},
	//Return CSS for a static theme, with @include endpoint for its parent theme if any
	getStaticThemeCSS : async(req, res)=>{
		if(!isStaticTheme(req.params.engine, req.params.id))
			res.status(404).send(`Invalid Theme - Renderer: ${req.params.engine}, Name: ${req.params.id}`);
		else {
			res.setHeader('Content-Type', 'text/css');
			res.setHeader('Cache-Control', 'public, max-age: 43200, must-revalidate');
			const themeParent = Themes[req.params.engine][req.params.id].baseTheme;
			console.log(`getStaticThemeCSS for ${req.params.id}`);
			console.log(`and parentThemeImport for ${themeParent}`);
			const parentThemeImport = themeParent ? `@import url(\"/css/${req.params.engine}/${themeParent}\");\n/* Static Theme ${Themes[req.params.engine][themeParent].name} */\n` : '';
			return res.status(200).send(`${parentThemeImport}@import url(\"/themes/${req.params.engine}/${req.params.id}/style.css\");\n/* Static Theme ${Themes[req.params.engine][req.params.id].name} */\n`);
		}
	},
	updateBrew : async (req, res)=>{
		// Initialize brew from request and body, destructure query params, and set the initial value for the after-save method
		const brewFromClient = api.excludePropsFromUpdate(req.body);
		const brewFromServer = req.brew;
		if(brewFromServer.version && brewFromClient.version && brewFromServer.version > brewFromClient.version) {
			console.log(`Version mismatch on brew ${brewFromClient.editId}`);
			res.setHeader('Content-Type', 'application/json');
			return res.status(409).send(JSON.stringify({ message: `The brew has been changed on a different device. Please save your changes elsewhere, refresh, and try again.` }));
		}

		let brew = _.assign(brewFromServer, brewFromClient);
		const googleId = brew.googleId;
		const { saveToGoogle, removeFromGoogle } = req.query;
		let afterSave = async ()=>true;

		brew.title = brew.title.trim();
		brew.description = brew.description.trim() || '';
		brew.text = api.mergeBrewText(brew);
		const userID = req?.account?.username ? req.account.username : brew.authors.split(',')[0];
		brew.userThemes = await api.getUsersBrewThemes(userID, brew.editId, req, res, null);


		if(brew.googleId && removeFromGoogle) {
			// If the google id exists and we're removing it from google, set afterSave to delete the google brew and mark the brew's google id as undefined
			afterSave = async ()=>{
				return await api.deleteGoogleBrew(req.account, googleId, brew.editId, res)
					.catch((err)=>{
						console.error(err);
						res.status(err?.status || err?.response?.status || 500).send(err.message || err);
					});
			};

			brew.googleId = undefined;
		} else if(!brew.googleId && saveToGoogle) {
			// If we don't have a google id and the user wants to save to google, create the google brew and set the google id on the brew
			brew.googleId = await api.newGoogleBrew(req.account, api.excludeGoogleProps(brew), res)
				.catch((err)=>{
					console.error(err);
					res.status(err.status || err.response.status).send(err.message || err);
				});
			if(!brew.googleId) return;
		} else if(brew.googleId) {
			// If the google id exists and no other actions are being performed, update the google brew
			const updated = await GoogleActions.updateGoogleBrew(api.excludeGoogleProps(brew))
				.catch((err)=>{
					console.error(err);
					res.status(err?.response?.status || 500).send(err);
				});
			if(!updated) return;
		}

		if(brew.googleId) {
			// If the google id exists after all those actions, exclude the props that are stored in google and aren't needed for rendering the brew items
			api.excludeStubProps(brew);
		} else {
			// Compress brew text to binary before saving
			brew.textBin = zlib.deflateRawSync(brew.text);
			// Delete the non-binary text field since it's not needed anymore
			brew.text = undefined;
		}
		brew.updatedAt = new Date();
		brew.version = (brew.version || 1) + 1;

		if(req.account) {
			brew.authors = _.uniq(_.concat(brew.authors, req.account.username));
			brew.invitedAuthors = _.uniq(_.filter(brew.invitedAuthors, (a)=>req.account.username !== a));
		}

		// define a function to catch our save errors
		const saveError = (err)=>{
			console.error(err);
			res.status(err.status || 500).send(err.message || 'Unable to save brew to Homebrewery database');
		};
		let saved;
		if(!brew._id) {
			// if the brew does not have a stub id, create and save it, then write the new value back to the brew.
			saved = await new HomebrewModel(brew).save().catch(saveError);
		} else {
			// if the brew does have a stub id, update it using the stub id as the key.
			brew = _.assign(await HomebrewModel.findOne({ _id: brew._id }), brew);
			saved = await brew.save()
				.catch(saveError);
		}
		if(!saved) return;
		// Call and wait for afterSave to complete
		const after = await afterSave();
		if(!after) return;

		res.status(200).send(saved);
	},
	deleteGoogleBrew : async (account, id, editId, res)=>{
		const auth = await GoogleActions.authCheck(account, res);
		await GoogleActions.deleteGoogleBrew(auth, id, editId);
		return true;
	},
	deleteBrew : async (req, res, next)=>{
		// Delete an orphaned stub if its Google brew doesn't exist
		try {
			await api.getBrew('edit')(req, res, ()=>{});
		} catch (err) {
			// Only if the error code is HBErrorCode '02', that is, Google returned "404 - Not Found"
			if(err.HBErrorCode == '02') {
				const { id, googleId } = api.getId(req);
				console.warn(`No google brew found for id ${googleId}, the stub with id ${id} will be deleted.`);
				await HomebrewModel.deleteOne({ editId: id });
				return next();
			}
		}

		let brew = req.brew;
		const { googleId, editId } = brew;
		const account = req.account;
		const isOwner = account && (brew.authors.length === 0 || brew.authors[0] === account.username);
		// If the user is the owner and the file is saved to google, mark the google brew for deletion
		const shouldDeleteGoogleBrew = googleId && isOwner;

		if(brew._id) {
			brew = _.assign(await HomebrewModel.findOne({ _id: brew._id }), brew);
			if(account) {
				// Remove current user as author
				brew.authors = _.pull(brew.authors, account.username);
			}

			if(brew.authors.length === 0) {
				// Delete brew if there are no authors left
				await HomebrewModel.deleteOne({ _id: brew._id })
					.catch((err)=>{
						console.error(err);
						throw { name: 'BrewDelete Error', message: 'Error while removing', status: 500, HBErrorCode: '07', brewId: brew._id };
					});
			} else {
				if(shouldDeleteGoogleBrew) {
					// When there are still authors remaining, we delete the google brew but store the full brew in the Homebrewery database
					brew.googleId = undefined;
					brew.textBin = zlib.deflateRawSync(brew.text);
					brew.text = undefined;
				}
				brew.markModified('authors'); //Mongo will not properly update arrays without markModified()
				await brew.save()
					.catch((err)=>{
						throw { name: 'BrewAuthorDelete Error', message: err, status: 500, HBErrorCode: '08', brewId: brew._id };
					});
			}
		}
		if(shouldDeleteGoogleBrew) {
			const deleted = await api.deleteGoogleBrew(account, googleId, editId, res)
				.catch((err)=>{
					console.error(err);
					res.status(500).send(err);
				});
			if(!deleted) return;
		}

		res.status(204).send();
	}
};

router.use('/api', require('./middleware/check-client-version.js'));
router.post('/api', asyncHandler(api.newBrew));
router.put('/api/:id', asyncHandler(api.getBrew('edit', true)), asyncHandler(api.updateBrew));
router.put('/api/update/:id', asyncHandler(api.getBrew('edit', true)), asyncHandler(api.updateBrew));
router.delete('/api/:id', asyncHandler(api.deleteBrew));
router.get('/api/remove/:id', asyncHandler(api.deleteBrew));

module.exports = api;
