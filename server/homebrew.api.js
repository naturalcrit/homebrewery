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

// const getTopBrews = (cb) => {
// 	HomebrewModel.find().sort({ views: -1 }).limit(5).exec(function(err, brews) {
// 		cb(brews);
// 	});
// };

const getBrew = (accessType)=>{
	return async (req, res, next)=>{
		const { brew } = req;

		if(!brew) {
			let id = req.params.id, googleId = req.body?.googleId;

			if(id.length > 12) {
				googleId = id.slice(0, -12);
				id = id.slice(-12);
			}
			let stub = await HomebrewModel.get(accessType === 'edit' ? { editId: id } : { shareId: id })
				.catch((err)=>{
					if(googleId) {
						console.warn(`Unable to find document stub for ${accessType}Id ${id}`);
					} else {
						console.warn(err);
					}
				});
			stub = stub?.toObject();

			if(googleId || stub?.googleId) {
				let googleError;
				const googleBrew = await GoogleActions.getGoogleBrew(googleId || stub?.googleId, id, accessType)
					.catch((err)=>{
						console.warn(err);
						googleError = err;
					});
				if(!googleBrew) throw googleError;
				stub = stub ? _.assign(excludeStubProps(stub), excludeGoogleProps(googleBrew)) : googleBrew;
			}

			if(!stub) {
				throw 'Brew not found in database';
			}

			req.brew = stub;
		}

		next();
	};
};

const mergeBrewText = (brew)=>{
	let text = brew.text;
	if(brew.style !== undefined) {
		text = `\`\`\`css\n` +
			`${brew.style || ''}\n` +
			`\`\`\`\n\n` +
			`${text}`;
	}
	const metadata = _.pick(brew, ['title', 'description', 'tags', 'systems', 'renderer']);
	text = `\`\`\`metadata\n` +
		`${yaml.dump(metadata)}\n` +
		`\`\`\`\n\n` +
		`${text}`;
	return text;
};

const MAX_TITLE_LENGTH = 100;

const getGoodBrewTitle = (text)=>{
	const tokens = Markdown.marked.lexer(text);
 	return (tokens.find((token)=>token.type === 'heading' || token.type === 'paragraph')?.text || 'No Title')
				 .slice(0, MAX_TITLE_LENGTH);
};

const excludePropsFromUpdate = (brew)=>{
	// Remove undesired properties
	const modified = _.clone(brew);
	const propsToExclude = ['_id', 'views', 'lastViewed', 'editId', 'shareId', 'googleId'];
	for (const prop of propsToExclude) {
		delete modified[prop];
	}
	return modified;
};

const excludeGoogleProps = (brew)=>{
	const modified = _.clone(brew);
	const propsToExclude = ['tags', 'systems', 'published', 'authors', 'owner', 'views'];
	for (const prop of propsToExclude) {
		delete modified[prop];
	}
	return modified;
};

const excludeStubProps = (brew)=>{
	const propsToExclude = ['text', 'textBin', 'renderer', 'pageCount', 'version'];
	for (const prop of propsToExclude) {
		brew[prop] = undefined;
	}
	return brew;
};

const beforeNewSave = (account, brew)=>{
	if(!brew.title) {
		brew.title = getGoodBrewTitle(brew.text);
	}

	brew.authors = (account) ? [account.username] : [];
	brew.text = mergeBrewText(brew);
};

const newGoogleBrew = async (account, brew, res)=>{
	const oAuth2Client = GoogleActions.authCheck(account, res);

	const newBrew = excludeGoogleProps(brew);

	return await GoogleActions.newGoogleBrew(oAuth2Client, newBrew);
};

const newBrew = async (req, res)=>{
	const brew = req.body;
	const { transferToGoogle } = req.query;

	delete brew.editId;
	delete brew.shareId;
	delete brew.googleId;

	beforeNewSave(req.account, brew);

	const newHomebrew = new HomebrewModel(brew);
	newHomebrew.editId = nanoid(12);
	newHomebrew.shareId = nanoid(12);

	let googleId, saved;
	if(transferToGoogle) {
		googleId = await newGoogleBrew(req.account, newHomebrew, res)
			.catch((err)=>{
				console.error(err);
				res.status(err?.status || err?.response?.status || 500).send(err?.message || err);
			});
		if(!googleId) return;
		excludeStubProps(newHomebrew);
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
			throw `Error while creating new brew, ${err.toString()}`;
		});
	if(!saved) return;
	saved = saved.toObject();

	res.status(200).send(saved);
};

const updateBrew = async (req, res)=>{
	let brew = _.assign(req.brew, excludePropsFromUpdate(req.body));
	brew.text = mergeBrewText(brew);
	const { transferToGoogle, transferFromGoogle } = req.query;

	if(brew.googleId && transferFromGoogle) {
		const deleted = await deleteGoogleBrew(req.account, brew.googleId, brew.editId, res)
			.catch((err)=>{
				console.error(err);
				res.status(err?.status || err?.response?.status || 500).send(err.message || err);
			});
		if(!deleted) return;

		brew.googleId = undefined;
	} else if(!brew.googleId && transferToGoogle) {
		brew.googleId = await newGoogleBrew(req.account, excludeGoogleProps(brew), res)
			.catch((err)=>{
				console.error(err);
				res.status(err.status || err.response.status).send(err.message || err);
			});
		if(!brew.googleId) return;
	} else if(brew.googleId) {
		const updated = await GoogleActions.updateGoogleBrew(excludeGoogleProps(brew))
			.catch((err)=>{
				console.error(err);
				res.status(err?.response?.status || 500).send(err);
			});
		if(!updated) return;
	}

	if(brew.googleId) {
		excludeStubProps(brew);
	} else {
		// Compress brew text to binary before saving
		brew.textBin = zlib.deflateRawSync(brew.text);
		// Delete the non-binary text field since it's not needed anymore
		brew.text = undefined;
	}
	brew.updatedAt = new Date();

	if(req.account) {
		brew.authors = _.uniq(_.concat(brew.authors, req.account.username));
	}

	brew = _.assign(await HomebrewModel.findOne({ _id: brew._id }), brew);

	if(!brew.markModified) {
		brew = new HomebrewModel(brew);
	}

	brew.markModified('authors');
	brew.markModified('systems');

	const saved = await brew.save()
		.catch((err)=>{
			console.error(err);
			res.status(err.status || 500).send(err.message || 'Unable to save brew to Homebrewery database');
		});
	if(!saved) return;

	res.status(200).send(saved);
};

const deleteGoogleBrew = async (account, id, editId, res)=>{
	const auth = await GoogleActions.authCheck(account, res);
	await GoogleActions.deleteGoogleBrew(auth, id, editId);
	return true;
};

const deleteBrew = async (req, res)=>{
	const { brew, account } = req;
	if(brew.googleId) {
		const googleDeleted = await deleteGoogleBrew(account, brew.googleId, brew.editId, res)
			.catch((err)=>{
				console.error(err);
				res.status(500).send(err);
			});
		if(!googleDeleted) return;
	}

	if(brew._id) {
		if(account) {
			// Remove current user as author
			brew.authors = _.pull(brew.authors, account.username);
			brew.markModified('authors');
		}

		if(brew.authors.length === 0) {
			// Delete brew if there are no authors left
			await brew.remove()
				.catch((err)=>{
					console.error(err);
					throw { status: 500, message: 'Error while removing' };
				});
		} else {
			// Otherwise, save the brew with updated author list
			await brew.save()
				.catch((err)=>{
					throw { status: 500, message: err };
				});
		}
	}

	res.status(204).send();
};

router.post('/api', asyncHandler(newBrew));
router.put('/api/:id', asyncHandler(getBrew('edit')), asyncHandler(updateBrew));
router.put('/api/update/:id', asyncHandler(getBrew('edit')), asyncHandler(updateBrew));
router.delete('/api/:id', asyncHandler(getBrew('edit')), asyncHandler(deleteBrew));
router.get('/api/remove/:id', asyncHandler(getBrew('edit')), asyncHandler(deleteBrew));

module.exports = {
	homebrewApi : router,
	getBrew
};
