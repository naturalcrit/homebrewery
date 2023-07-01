/* eslint-disable max-lines */
const _ = require('lodash');
const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const zlib = require('zlib');
const Markdown = require('../shared/naturalcrit/markdown.js');
const yaml = require('js-yaml');
const asyncHandler = require('express-async-handler');
const { nanoid } = require('nanoid');

const { DEFAULT_BREW, DEFAULT_BREW_LOAD } = require('./brewDefaults.js');

// const getTopBrews = (cb) => {
// 	HomebrewModel.find().sort({ views: -1 }).limit(5).exec(function(err, brews) {
// 		cb(brews);
// 	});
// };

const MAX_TITLE_LENGTH = 100;

const api = {
	homebrewApi : router,
	getId       : (req)=>{
		let id = req.params.id;
		return {id: id};
	},
	getBrew : (accessType, stubOnly = false)=>{
		// Create middleware with the accessType passed in as part of the scope
		return async (req, res, next)=>{
			// Get relevant IDs for the brew
			const { id } = api.getId(req);

			// Try to find the document in the Homebrewery database -- if it doesn't exist, that's fine.
			let stub = await HomebrewModel.get(accessType === 'edit' ? { editId: id } : { shareId: id })
				.catch((err)=>{
					console.warn(err);
				});
			stub = stub?.toObject();

			const authorsExist = stub?.authors?.length > 0;
			const isAuthor = stub?.authors?.includes(req.account?.username);
			const isInvited = stub?.invitedAuthors?.includes(req.account?.username);
			if(accessType === 'edit' && (authorsExist && !(isAuthor || isInvited))) {
				const accessError = { name: 'Access Error', status: 401 };
				if(req.account){
					throw { ...accessError, message: 'User is not an Author', HBErrorCode: '03', authors: stub.authors, brewTitle: stub.title };
				}
				throw { ...accessError, message: 'User is not logged in', HBErrorCode: '04', authors: stub.authors, brewTitle: stub.title };
			}

			// If after all of that we still don't have a brew, throw an exception
			if(!stub && !stubOnly) {
				throw { name: 'BrewLoad Error', message: 'Brew not found', status: 404, HBErrorCode: '05', accessType: accessType, brewId: id };
			}

			// Clean up brew: fill in missing fields with defaults / fix old invalid values
			if(stub) {
				stub.tags     = stub.tags     || undefined; // Clear empty strings
				stub.renderer = stub.renderer || undefined; // Clear empty strings
				stub = _.defaults(stub, DEFAULT_BREW_LOAD); // Fill in blank fields
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
	},
	newBrew : async (req, res)=>{
		const brew = req.body;
		// const { saveToGoogle } = req.query;

		delete brew.editId;
		delete brew.shareId;
		// delete brew.googleId;

		api.beforeNewSave(req.account, brew);

		const newHomebrew = new HomebrewModel(brew);
		newHomebrew.editId = nanoid(12);
		newHomebrew.shareId = nanoid(12);

		let saved;

		// Compress brew text to binary before saving
		newHomebrew.textBin = zlib.deflateRawSync(newHomebrew.text);
		// Delete the non-binary text field since it's not needed anymore
		newHomebrew.text = undefined;

		saved = await newHomebrew.save()
			.catch((err)=>{
				console.error(err, err.toString(), err.stack);
				throw { name: 'BrewSave Error', message: `Error while creating new brew, ${err.toString()}`, status: 500, HBErrorCode: '06' };
			});
		if(!saved) return;
		saved = saved.toObject();

		res.status(200).send(saved);
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
		// const { saveToGoogle, removeFromGoogle } = req.query;
		let afterSave = async ()=>true;

		brew.text = api.mergeBrewText(brew);

		// Compress brew text to binary before saving
		brew.textBin = zlib.deflateRawSync(brew.text);
		// Delete the non-binary text field since it's not needed anymore
		brew.text = undefined;
		
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
	deleteBrew : async (req, res, next)=>{
		// Delete an orphaned stub if its Google brew doesn't exist
		try {
			await api.getBrew('edit')(req, res, ()=>{});
		} catch (err) {
			// Only if the error code is HBErrorCode '02', that is, Google returned "404 - Not Found"
			console.log(err);
			// TODO: is this relevant without google stuff?
		}

		let brew = req.brew;
		const { editId } = brew;
		const account = req.account;
		const isOwner = account && (brew.authors.length === 0 || brew.authors[0] === account.username);

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
				brew.markModified('authors'); //Mongo will not properly update arrays without markModified()
				await brew.save()
					.catch((err)=>{
						throw { name: 'BrewAuthorDelete Error', message: err, status: 500, HBErrorCode: '08', brewId: brew._id };
					});
			}
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
