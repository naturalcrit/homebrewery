const _ = require('lodash');
const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const zlib = require('zlib');
const GoogleActions = require('./googleActions.js');
const Markdown = require('../shared/naturalcrit/markdown.js');
const yaml = require('js-yaml');
const Themes = require('../themes/themes.json');
const { send } = require('process');

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
	const metadata = _.pick(brew, ['title', 'description', 'tags', 'systems', 'renderer', 'theme']);
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
	let oAuth2Client;

	try {	oAuth2Client = GoogleActions.authCheck(req.account, res); } catch (err) { return res.status(err.status).send(err.message); }

	const brew = excludePropsFromUpdate(req.body);
	brew.text = mergeBrewText(brew);

	try {
		const updatedBrew = await GoogleActions.updateGoogleBrew(oAuth2Client, brew);
		return res.status(200).send(updatedBrew);
	} catch (err) {
		return res.status(err.response?.status || 500).send(err);
	}
};

// Parse content of themes.json and sends a version containing name and path to all themes.
// Also tries to import the snippets.js file for the theme and sends names, paths and icon 
// strings for all available snippet groups and snippets
const getThemes = (req, res)=>{

	let themesData = {
		// Homebrewery provided themes that are located in the source code
		"homebrewery-themes": [],
		// User made themes (might be implemented in the future)
		"user-themes": []
	};
	Themes["V3"].forEach(theme => {
		let snippetGroups = [];

		try {
			const themeSnippets = require("../themes/V3/" + theme["path"] + "/snippets.js");
			
			themeSnippets.forEach(group => {
				snippetsCategory = []
				group['snippets'].forEach(snippet => {
					snippetsCategory.push({
						'name': snippet['name'],
						'path': encodeURIComponent(snippet['name']),
						'icon': snippet['icon']
					});
				});
				snippetGroups.push({
					'groupName': group['groupName'],
					'path': encodeURIComponent(group['groupName']),
					'icon': group['icon'],
					'view': group['view'],
					'snippets': snippetsCategory
				});
			});
		}
		catch(error) {
			if (error.code !== 'MODULE_NOT_FOUND') {
				throw error;
			}
		}

		// TODO: Add user made themes to the same object, using the same format, when that is implemented

		themesData["homebrewery-themes"].push({
			"name": theme["name"],
			"path": theme["path"],
			"snippets": snippetGroups
		});
	});

	res.type('json');
    res.send(themesData);
};

// Checks for a specific theme from the path in the url and sends its style.css
const getThemeStyle = (req, res)=>{
	const path = '/' + req.params.path + '/style.css'	
	options = {
		'root': './build/themes/V3',
		'headers': {
			'Content-Type': 'text/css'
		}
	};

    res.sendFile(path, options, function (err) {
		if (err) {
			if (err.code === 'ENOENT') {
				res.status(404).send("No such file: " + path);
			}
            else {
				res.status(500).send(err);
			}
        }
    });
};

// Checks for a snippet in a theme, tries to run it and return the results
const getThemeSnippet = (req, res, next)=>{
	let snippetOutput = "";

	// Try loading the snippets.js file for the theme
	try {
		const themeSnippets = require("../themes/V3/" + req.params.path + "/snippets.js");
		
		// Decode the group URL and try to find it in the themes snippet groups
		const groupName = decodeURIComponent(req.params.snippetGroup);
		if(!groupName) {
			return res.status(400).send("Unspecified group name");
		}
		const group = themeSnippets.find((instance)=>{return instance['groupName'] == groupName});
		if(!group) {
			return res.status(400).send("No such group in " + req.params.path + ": " + groupName);		
		}

		// Decode the snippet URL and try to find it in the specified snippet group
		const snippetName = decodeURIComponent(req.params.snippet);
		if(!snippetName) {
			return res.status(400).send("Unspecified snippet name");
		}
		const snippet = group['snippets'].find((instance)=>{return instance['name'] == snippetName});
		if(!snippet) {
			return res.status(400).send("No such snippet in " + req.params.path + ", group " + groupName + ": " + snippetName);
		}

		// If the snippet is a function, it tries to run it. If it is a string it is passed on as is
		if(snippet['gen'] instanceof Function) {
			try {
				snippetOutput = snippet['gen']();
			}
			catch {
				return res.status(500).send("Malformed snippet (function");
			}
		}
		else if(typeof snippet['gen'] == 'string' || snippet['gen'] instanceof String) {
			snippetOutput = snippet['gen'];
		}
		else {
			return res.status(500).send("Malformed snippet (undefined)");
		}
	}
	catch(error) {
		if (error.code !== 'MODULE_NOT_FOUND') {
			throw error;
		}
		return res.status(404).send("No such file: " + req.params.path );
	}

	// Returns the result from running a snippet
	return res.send(snippetOutput);
};


router.post('/api', newBrew);
router.post('/api/newGoogle/', newGoogleBrew);
router.put('/api/:id', updateBrew);
router.put('/api/update/:id', updateBrew);
router.put('/api/updateGoogle/:id', updateGoogleBrew);
router.delete('/api/:id', deleteBrew);
router.get('/api/remove/:id', deleteBrew);
router.get('/api/removeGoogle/:id', (req, res)=>{GoogleActions.deleteGoogleBrew(req, res, req.params.id);});

router.post('/api/themes/', getThemes);
router.post('/api/themes/:path/style', getThemeStyle);
router.post('/api/themes/:path/snippets/:snippetGroup/:snippet', getThemeSnippet);

module.exports = router;
