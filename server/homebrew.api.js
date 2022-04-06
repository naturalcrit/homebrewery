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

const findBrew = async (brewId, accessType, googleObjectId)=>{
	let id = brewId;
	let googleId = googleObjectId;
	if(id.length > 12) {
		googleId = id.slice(0, -12);
		id = id.slice(-12);
	}
	let brew = await HomebrewModel.get(accessType === 'edit' ? { editId: id } : { shareId: id })
		.catch((err)=>{
			if(googleId) {
				console.warn(`Unable to find document stub for ${accessType}Id ${id}`);
			} else {
				console.warn(err);
			}
		});

	let googleBrew;
	if(googleId || brew?.googleId) {
		googleBrew = await GoogleActions.getGoogleBrew(googleId || brew?.googleId, id, accessType)
			.catch((err)=>{
				console.warn(err);
			});
		if(!brew && !googleBrew) throw 'Brew not found in database or Google Drive';
		brew = brew ? _.merge(brew, googleBrew) : googleBrew;
	} else if(!brew) {
		throw 'Brew not found in database';
	}

	return brew;
};

const getBrew = (accessType)=>{
	return async (req, res, next)=>{
		const { brew } = req;

		if(!brew) {
			const id = req.params.id, googleId = req.body?.googleId;
			const found = await findBrew(id, accessType, googleId);
			req.brew = accessType !== 'edit' && found.toObject ? found.toObject() : found;
		}

		!!next ? next() : undefined;
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
	const propsToExclude = ['views', 'lastViewed', 'editId', 'shareId', 'googleId'];
	for (const prop of propsToExclude) {
		delete brew[prop];
	}
	return brew;
};

const excludeStubProps = (brew)=>{
	const propsToExclude = ['text', 'textBin', 'renderer', 'pageCount', 'views', 'version'];
	for (const prop of propsToExclude) {
		brew[prop] = undefined;
	}
};

const excludeGoogleProps = (brew)=>{
	const modified = brew.toObject ? brew.toObject() : brew;
	const propsToExclude = ['tags', 'systems', 'published', 'authors', 'owner'];
	for (const prop of propsToExclude) {
		delete modified[prop];
	}
	return modified;
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

	const newBrew = excludeGoogleProps(_.clone(brew));

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
				res.status(err?.status || err?.response?.status || 500).send(err?.message || err);
			});
		excludeStubProps(newHomebrew);
	} else {
		// Compress brew text to binary before saving
		newHomebrew.textBin = zlib.deflateRawSync(newHomebrew.text);
		// Delete the non-binary text field since it's not needed anymore
		newHomebrew.text = undefined;
	}
	if(transferToGoogle && !googleId) {
		if(!res.headersSent) {
			res.status(500).send('Unable to save document to Google Drive');
		}
		return;
	} else if(transferToGoogle) {
		newHomebrew.googleId = googleId;
	}

	saved = await newHomebrew.save()
		.catch((err)=>{
			console.error(err, err.toString(), err.stack);
			throw `Error while creating new brew, ${err.toString()}`;
		});
	if(!saved) return;
	saved = saved.toObject();

	return res.status(200).send(saved);
};

const updateBrew = async (req, res)=>{
	let brew = Object.assign(req.brew, excludePropsFromUpdate(req.body));
	brew.text = mergeBrewText(brew);
	const { transferToGoogle, transferFromGoogle } = req.query;

	if(brew.googleId && transferFromGoogle) {
		const deleted = await deleteGoogleBrew(req.account, brew.googleId, brew.editId, res)
			.catch((err)=>{
				console.error(err);
				res.status(err?.status || err?.response?.status || 500).send(err.message || err);
			});
		if(!deleted) {
			if(res.headersSent) {
				res.status(500).send('Unable to delete brew from Google');
			}
			return;
		}

		brew.googleId = undefined;
	} else if(!brew.googleId && transferToGoogle) {
		brew.googleId = await newGoogleBrew(req.account, excludeGoogleProps(_.clone(brew)), res)
			.catch((err)=>{
				console.error(err);
				res.status(err.status || err.response.status).send(err.message || err);
			});
		if(!brew.googleId) {
			if(res.headersSent) {
				res.status(500).send('Unable to save brew to Google');
			}
			return;
		}
	} else if(brew.googleId) {
		const updated = await GoogleActions.updateGoogleBrew(excludeGoogleProps(_.clone(brew)))
			.catch((err)=>{
				console.error(err);
				res.status(err?.response?.status || 500).send(err);
			});
		if(!updated) {
			if(res.headersSent) {
				res.status(500).send('Unable to save brew to Google');
			}
			return;
		}
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

	if(!brew.markModified) {
		brew = new HomebrewModel(brew);
	}

	brew.markModified('authors');
	brew.markModified('systems');

	const saved = await brew.save()
		.catch((err)=>{
			res.status(err.status || 500).send(err.message || 'Unable to save brew to Homebrewery database');
		});
	if(!saved) {
		if(!res.headersSent) {
			res.status(500).send('Unable to save brew to Homebrewery database');
		}
	}

	if(!res.headersSent) return res.status(200).send(saved);
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
				res.status(500).send(err);
			});
		if(!googleDeleted) {
			if(!res.headersSent) {
				res.status(500).send('Unable to delete brew from Google');
			}
			return;
		}
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

	return res.status(204).send();
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
