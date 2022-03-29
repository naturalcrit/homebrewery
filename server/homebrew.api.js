const _ = require('lodash');
const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const zlib = require('zlib');
const GoogleActions = require('./googleActions.js');
const Markdown = require('../shared/naturalcrit/markdown.js');
const yaml = require('js-yaml');
const asyncHandler = require('express-async-handler');

// const getTopBrews = (cb) => {
// 	HomebrewModel.find().sort({ views: -1 }).limit(5).exec(function(err, brews) {
// 		cb(brews);
// 	});
// };

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
 	return (tokens.find((token)=>token.type == 'heading' ||	token.type == 'paragraph')?.text || 'No Title')
				 .slice(0, MAX_TITLE_LENGTH);
};

const excludePropsFromUpdate = (brew)=>{
	// Remove undesired properties
	const propsToExclude = ['views', 'lastViewed'];
	for (const prop of propsToExclude) {
		delete brew[prop];
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

const newLocalBrew = async (brew)=>{
	const newHomebrew = new HomebrewModel(brew);
	// Compress brew text to binary before saving
	newHomebrew.textBin = zlib.deflateRawSync(newHomebrew.text);
	// Delete the non-binary text field since it's not needed anymore
	newHomebrew.text = undefined;

	let saved = await newHomebrew.save()
		.catch((err)=>{
			console.error(err, err.toString(), err.stack);
			throw `Error while creating new brew, ${err.toString()}`;
		});

	saved = saved.toObject();
	saved.gDrive = false;
	return saved;
};

const newGoogleBrew = async (account, brew, res)=>{
	const oAuth2Client = GoogleActions.authCheck(account, res);

	return await GoogleActions.newGoogleBrew(oAuth2Client, brew);
};

const newBrew = async (req, res)=>{
	const brew = req.body;
	const { transferToGoogle } = req.query;

	delete brew.editId;
	delete brew.shareId;
	delete brew.googleId;

	beforeNewSave(req.account, brew);

	let saved;
	if(transferToGoogle) {
		saved = await newGoogleBrew(req.account, brew, res)
			.catch((err)=>{
				res.status(err.status || err.response.status).send(err.message || err);
			});
	} else {
		saved = await newLocalBrew(brew)
			.catch((err)=>{
				res.status(500).send(err);
			});
	}
	if(!saved) return;
	return res.status(200).send(saved);
};

const updateBrew = async (req, res)=>{
	let brew = excludePropsFromUpdate(req.body);
	const { transferToGoogle, transferFromGoogle } = req.query;

	let saved;
	if(brew.googleId && transferFromGoogle) {
		beforeNewSave(req.account, brew);

		saved = await newLocalBrew(brew)
			.catch((err)=>{
				console.error(err);
				res.status(500).send(err);
			});
		if(!saved) return;

		await deleteGoogleBrew(req.account, `${brew.googleId}${brew.editId}`, res)
			.catch((err)=>{
				console.error(err);
				res.status(err.status || err.response.status).send(err.message || err);
			});
	} else if(!brew.googleId && transferToGoogle) {
		saved = await newGoogleBrew(req.account, brew, res)
			.catch((err)=>{
				console.error(err);
				res.status(err.status || err.response.status).send(err.message || err);
			});
		if(!saved) return;

		await deleteLocalBrew(req.account, brew.editId)
			.catch((err)=>{
				console.error(err);
				res.status(err.status).send(err.message);
			});
	} else if(brew.googleId) {
		brew.text = mergeBrewText(brew);

		saved = await GoogleActions.updateGoogleBrew(brew)
			.catch((err)=>{
				console.error(err);
				res.status(err.response?.status || 500).send(err);
			});
	} else {
		const dbBrew = await HomebrewModel.get({ editId: req.params.id })
			.catch((err)=>{
				console.error(err);
				return res.status(500).send('Error while saving');
			});

		brew = _.merge(dbBrew, brew);
		brew.text = mergeBrewText(brew);

		// Compress brew text to binary before saving
		brew.textBin = zlib.deflateRawSync(brew.text);
		// Delete the non-binary text field since it's not needed anymore
		brew.text = undefined;
		brew.updatedAt = new Date();

		if(req.account) {
			brew.authors = _.uniq(_.concat(brew.authors, req.account.username));
		}

		brew.markModified('authors');
		brew.markModified('systems');

		saved = await brew.save();
	}
	if(!saved) return;

	if(!res.headersSent) return res.status(200).send(saved);
};

const deleteBrew = async (req, res)=>{
	if(req.params.id.length > 12) {
		const deleted = await deleteGoogleBrew(req.account, req.params.id, res)
			.catch((err)=>{
				res.status(500).send(err);
			});
		if(deleted) return res.status(200).send();
	} else {
		const deleted = await deleteLocalBrew(req.account, req.params.id)
			.catch((err)=>{
				res.status(err.status).send(err.message);
			});
		if(deleted) return res.status(200).send(deleted);
		return res.status(200).send();
	}
};

const deleteLocalBrew = async (account, id)=>{
	const brew = await HomebrewModel.findOne({ editId: id });
	if(!brew) {
		throw { status: 404, message: 'Can not find homebrew with that id' };
	}

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
		return await brew.save()
			.catch((err)=>{
				throw { status: 500, message: err };
			});
	}
};

const deleteGoogleBrew = async (account, id, res)=>{
	const auth = await GoogleActions.authCheck(account, res);
	await GoogleActions.deleteGoogleBrew(auth, id);
	return true;
};

router.post('/api', asyncHandler(newBrew));
router.put('/api/:id', asyncHandler(updateBrew));
router.put('/api/update/:id', asyncHandler(updateBrew));
router.delete('/api/:id', asyncHandler(deleteBrew));
router.get('/api/remove/:id', asyncHandler(deleteBrew));

module.exports = router;
