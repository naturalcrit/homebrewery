const _ = require('lodash');
const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const zlib = require('zlib');
const GoogleActions = require('./googleActions.js');
const Markdown = require('../shared/naturalcrit/markdown.js');
const yaml = require('js-yaml');

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
	};
	return brew;
};

const newBrew = (req, res)=>{
	const brew = req.body;

	if(!brew.title) {
		brew.title = getGoodBrewTitle(brew.text);
	}

	brew.authors = (req.account) ? [req.account.username] : [];
	brew.text = mergeBrewText(brew);

	delete brew.editId;
	delete brew.shareId;
	delete brew.googleId;

	const newHomebrew = new HomebrewModel(brew);
	// Compress brew text to binary before saving
	newHomebrew.textBin = zlib.deflateRawSync(newHomebrew.text);
	// Delete the non-binary text field since it's not needed anymore
	newHomebrew.text = undefined;

	newHomebrew.save((err, obj)=>{
		if(err) {
			console.error(err, err.toString(), err.stack);
			return res.status(500).send(`Error while creating new brew, ${err.toString()}`);
		}

		obj = obj.toObject();
		obj.gDrive = false;
		return res.status(200).send(obj);
	});
};

const updateBrew = (req, res)=>{
	HomebrewModel.get({ editId: req.params.id })
		.then((brew)=>{
			const updateBrew = excludePropsFromUpdate(req.body);
			brew = _.merge(brew, updateBrew);
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

			brew.save((err, obj)=>{
				if(err) throw err;
				return res.status(200).send(obj);
			});
		})
		.catch((err)=>{
			console.error(err);
			return res.status(500).send('Error while saving');
		});
};

const deleteBrew = (req, res)=>{
	HomebrewModel.find({ editId: req.params.id }, (err, objs)=>{
		if(!objs.length || err) {
			return res.status(404).send('Can not find homebrew with that id');
		}

		const brew = objs[0];

		if(req.account) {
			// Remove current user as author
			brew.authors = _.pull(brew.authors, req.account.username);
			brew.markModified('authors');
		}

		if(brew.authors.length === 0) {
			// Delete brew if there are no authors left
			brew.remove((err)=>{
				if(err) return res.status(500).send('Error while removing');
				return res.status(200).send();
			});
		} else {
			// Otherwise, save the brew with updated author list
			brew.save((err, savedBrew)=>{
				if(err) throw err;
				return res.status(200).send(savedBrew);
			});
		}
	});
};

const newGoogleBrew = async (req, res, next)=>{
	let oAuth2Client;

	try {	oAuth2Client = GoogleActions.authCheck(req.account, res); } catch (err) { return res.status(err.status).send(err.message); }

	const brew = req.body;

	if(!brew.title) {
		brew.title = getGoodBrewTitle(brew.text);
	}

	brew.authors = (req.account) ? [req.account.username] : [];
	brew.text = mergeBrewText(brew);

	delete brew.editId;
	delete brew.shareId;
	delete brew.googleId;

	req.body = brew;

	try {
		const newBrew = await GoogleActions.newGoogleBrew(oAuth2Client, brew);
		return res.status(200).send(newBrew);
	} catch (err) {
		return res.status(err.response.status).send(err);
	}
};

const updateGoogleBrew = async (req, res, next)=>{
	const brew = excludePropsFromUpdate(req.body);
	brew.text = mergeBrewText(brew);

	try {
		const updatedBrew = await GoogleActions.updateGoogleBrew(brew);
		return res.status(200).send(updatedBrew);
	} catch (err) {
		return res.status(err.response?.status || 500).send(err);
	}
};

router.post('/api', newBrew);
router.post('/api/newGoogle/', newGoogleBrew);
router.put('/api/:id', updateBrew);
router.put('/api/update/:id', updateBrew);
router.put('/api/updateGoogle/:id', updateGoogleBrew);
router.delete('/api/:id', deleteBrew);
router.get('/api/remove/:id', deleteBrew);
router.get('/api/removeGoogle/:id', async (req, res)=>{
	const auth = await GoogleActions.authCheck(req.account, res);
	await GoogleActions.deleteGoogleBrew(auth, req.params.id);
	return res.status(200).send();
});

module.exports = router;
