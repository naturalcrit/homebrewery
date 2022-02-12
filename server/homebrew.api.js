/* eslint-disable max-lines */
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
	const propsToExclude = ['views', 'lastViewed', 'shareId', 'editId', 'googleId'];
	for (const prop of propsToExclude) {
		delete brew[prop];
	}
	return brew;
};

const excludeGoogleProps = (brew)=>{
	const propsToExclude = ['title', 'views', 'lastViewed', 'pageCount', 'renderer', 'tags', 'systems', 'published', 'version'];
	for (const prop of propsToExclude) {
		delete brew[prop];
	}
	return brew;
};

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
		googleBrew = await GoogleActions.readFileMetadata(googleId || brew?.googleId, id, accessType)
			.catch((err)=>{
				console.warn(err);
			});
		if(!brew && !googleBrew) throw 'Brew not found in database or Google Drive';
		brew = brew ? _.merge(brew, googleBrew) : googleBrew;
	} else if(!brew) {
		throw 'Brew not found in database';
	}

	return googleBrew ? _.merge(brew, googleBrew) : brew;
};

const getBrewForEdit = async (req, res, next)=>{
	const { brew } = req;

	if(!brew) {
		const id = req.params.id, googleId = req.body?.googleId;
		req.brew = await findBrew(id, 'edit', googleId);
	}

	!!next ? next() : undefined;
};

const newBrew = async (req, res)=>{
	const brew = req.body;
	const { transferToGoogle } = req.query;

	if(!brew.title) {
		brew.title = getGoodBrewTitle(brew.text);
	}

	brew.authors = (req.account) ? [req.account.username] : [];
	brew.text = mergeBrewText(brew);

	delete brew.editId;
	delete brew.shareId;
	delete brew.googleId;

	const newHomebrew = new HomebrewModel(brew);

	if(transferToGoogle) {
		const googleId = await newGoogleBrew(req.account, newHomebrew);
		if(!googleId) return;
		newHomebrew.googleId = googleId;
		excludeGoogleProps(newHomebrew);
	} else {
		// Compress brew text to binary before saving
		newHomebrew.textBin = zlib.deflateRawSync(newHomebrew.text);
	}
	// Delete the non-binary text field since it's not needed anymore
	newHomebrew.text = undefined;

	let obj = await newHomebrew.save().catch((err)=>{
		console.error(err, err.toString(), err.stack);
		return res.status(500).send(`Error while creating new brew, ${err.toString()}`);
	});
	obj = obj.toObject();
	return res.status(200).send(obj);
};

const updateBrew = async (req, res)=>{
	let { brew } = req;
	const { transferToGoogle, transferFromGoogle } = req.query;
	const updateBrew = excludePropsFromUpdate(req.body);
	brew = _.merge(brew, updateBrew);
	brew.text = mergeBrewText(brew);
	brew.updatedAt = new Date();

	if(req.account) {
		brew.authors = _.uniq(_.concat(brew.authors, req.account.username)).filter((author)=>!!author);
	}

	try {
		if(transferToGoogle) {
			brew.googleId = await newGoogleBrew(req.account, brew, res);
			brew.textBin = undefined;
			excludeGoogleProps(brew);
		} else if(transferFromGoogle) {
			await GoogleActions.deleteGoogleBrew(brew, req.account, res, req.params.id);
			brew.googleId = undefined;
			brew.textBin = zlib.deflateRawSync(brew.text);
		} else if(brew.googleId) {
			await GoogleActions.updateGoogleBrew(brew);
			excludeGoogleProps(brew);
		} else {
			// Compress brew text to binary before saving
			brew.textBin = zlib.deflateRawSync(brew.text);
		}
	} catch (err) {
		return res.status(err.response?.status || 500).send(err);
	}

	// Delete the non-binary text field since it's not needed anymore
	brew.text = undefined;

	if(!brew.markModified) {
		brew = new HomebrewModel(brew);
		excludeGoogleProps(brew);
	}

	brew.markModified('authors');
	brew.markModified('systems');

	const savedBrew = await brew.save().catch((err)=>{
		if(err) throw err;
		return res.status(200).send(err);
	});
	return res.status(200).send(savedBrew);
};

const deleteBrew = async (req, res)=>{
	let brew = await HomebrewModel.findOne({ editId: req.params.id })
		.catch((err)=>{
			console.warn(err);
		});
	let editId = req.params.id, googleId = brew?.googleId;
	if(editId.length > 12) {
		googleId = editId.slice(0, -12);
		editId = editId.slice(-12);
	}
	if(googleId) {
		const googleBrew = await GoogleActions.readFileMetadata(googleId, editId, 'edit')
			.catch((err)=>{
				console.warn(err);
			});
		if(!brew && !googleBrew) return res.status(500).send('Brew not found in database or Google Drive');
		brew = brew ? _.merge(brew, googleBrew) : googleBrew;
	} else if(!brew) {
		return res.status(500).send('Brew not found in database');
	}

	if(req.account) {
		// Remove current user as author
		brew.authors = _.pull(brew.authors, req.account.username);
		brew.markModified('authors');
	}

	if(brew.authors.length === 0) {
		// Delete brew if there are no authors left
		if(brew.googleId) {
			await GoogleActions.deleteGoogleBrew(brew, req.account, res, req.params.id);
		}
		await brew.remove().catch((err)=>{
			console.error(err);
			return res.status(500).send('Error while removing');
		});
		return res.status(200).send();
	} else {
		// Otherwise, save the brew with updated author list
		if(brew.googleId) {
			await GoogleActions.updateGoogleBrew(brew);
			excludeGoogleProps(brew);
		}
		const savedBrew = await brew.save().catch((err)=>{
			throw err;
		});
		return res.status(200).send(savedBrew);
	}
};

const newGoogleBrew = async (account, brew, res)=>{
	let oAuth2Client;

	try { oAuth2Client = GoogleActions.authCheck(account, res); } catch (err) { return res.status(err.status).send(err.message); }

	try {
		return await GoogleActions.newGoogleBrew(oAuth2Client, brew);
	} catch (err) {
		res.status(err.response.status).send(err);
	}
};

router.post('/api', asyncHandler(newBrew));
router.put('/api/:id', asyncHandler(getBrewForEdit), asyncHandler(updateBrew));
router.put('/api/update/:id', asyncHandler(getBrewForEdit), asyncHandler(updateBrew));
router.delete('/api/:id', asyncHandler(deleteBrew));
router.get('/api/remove/:id', asyncHandler(deleteBrew));

module.exports = {
	homebrewApi : router,
	findBrew
};
