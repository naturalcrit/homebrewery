const _ = require('lodash');
const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const zlib = require('zlib');
const GoogleActions = require('./googleActions.js');
const Markdown = require('../shared/naturalcrit/markdown.js');

// const getTopBrews = (cb) => {
// 	HomebrewModel.find().sort({ views: -1 }).limit(5).exec(function(err, brews) {
// 		cb(brews);
// 	});
// };

const getGoodBrewTitle = (text)=>{
	const tokens = Markdown.marked.lexer(text);
 	return title = (tokens.find((token)=>token.type == 'heading' || token.type == 'paragraph') || { text: 'No Title' }).text;
};

const newBrew = (req, res)=>{
	const brew = req.body;
	brew.authors = (req.account) ? [req.account.username] : [];

	if(!brew.title) {
		brew.title = getGoodBrewTitle(brew.text);
	}

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
			brew = _.merge(brew, req.body);
			// Compress brew text to binary before saving
			brew.textBin = zlib.deflateRawSync(req.body.text);
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
	brew.authors = (req.account) ? [req.account.username] : [];

	if(!brew.title) {
		brew.title = getGoodBrewTitle(brew.text);
	}

	delete brew.editId;
	delete brew.shareId;
	delete brew.googleId;

	req.body = brew;

	const newBrew = await GoogleActions.newGoogleBrew(oAuth2Client, brew);

	return res.status(200).send(newBrew);
};

const updateGoogleBrew = async (req, res, next)=>{
	let oAuth2Client;

	try {	oAuth2Client = GoogleActions.authCheck(req.account, res); } catch (err) { return res.status(err.status).send(err.message); }

	const updatedBrew = await GoogleActions.updateGoogleBrew(oAuth2Client, req.body);

	return res.status(200).send(updatedBrew);
};

router.post('/api', newBrew);
router.post('/api/newGoogle/', newGoogleBrew);
router.put('/api/:id', updateBrew);
router.put('/api/update/:id', updateBrew);
router.put('/api/updateGoogle/:id', updateGoogleBrew);
router.delete('/api/:id', deleteBrew);
router.get('/api/remove/:id', deleteBrew);
router.get('/api/removeGoogle/:id', (req, res)=>{GoogleActions.deleteGoogleBrew(req, res, req.params.id);});

module.exports = router;
