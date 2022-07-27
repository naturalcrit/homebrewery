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
const Themes = require('../themes/themes.json');

// const getTopBrews = (cb) => {
// 	HomebrewModel.find().sort({ views: -1 }).limit(5).exec(function(err, brews) {
// 		cb(brews);
// 	});
// };

const getBrew = (accessType)=>{
	// Create middleware with the accessType passed in as part of the scope
	return async (req, res, next)=>{
		// Set the id and initial potential google id, where the google id is present on the existing brew.
		let id = req.params.id, googleId = req.body?.googleId;

		// If the id is longer than 12, then it's a google id + the edit id. This splits the longer id up.
		if(id.length > 12) {
			googleId = id.slice(0, -12);
			id = id.slice(-12);
		}
		// Try to find the document in the Homebrewery database -- if it doesn't exist, that's fine.
		let stub = await HomebrewModel.get(accessType === 'edit' ? { editId: id } : { shareId: id })
			.catch((err)=>{
				if(googleId) {
					console.warn(`Unable to find document stub for ${accessType}Id ${id}`);
				} else {
					console.warn(err);
				}
			});
		stub = stub?.toObject();

		// If there is a google id, try to find the google brew
		if(googleId || stub?.googleId) {
			let googleError;
			const googleBrew = await GoogleActions.getGoogleBrew(googleId || stub?.googleId, id, accessType)
				.catch((err)=>{
					console.warn(err);
					googleError = err;
				});
			// If we can't find the google brew and there is a google id for the brew, throw an error.
			if(!googleBrew) throw googleError;
			// Combine the Homebrewery stub with the google brew, or if the stub doesn't exist just use the google brew
			stub = stub ? _.assign({ ...excludeStubProps(stub), stubbed: true }, excludeGoogleProps(googleBrew)) : googleBrew;
		}

		// If after all of that we still don't have a brew, throw an exception
		if(!stub) {
			throw 'Brew not found in Homebrewery database or Google Drive';
		}

		req.brew = stub;

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
	const { saveToGoogle } = req.query;

	delete brew.editId;
	delete brew.shareId;
	delete brew.googleId;

	beforeNewSave(req.account, brew);

	const newHomebrew = new HomebrewModel(brew);
	newHomebrew.editId = nanoid(12);
	newHomebrew.shareId = nanoid(12);

	let googleId, saved;
	if(saveToGoogle) {
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
	// Initialize brew from request and body, destructure query params, set a constant for the google id, and set the initial value for the after-save method
	let brew = _.assign(req.brew, excludePropsFromUpdate(req.body));
	const { saveToGoogle, removeFromGoogle } = req.query;
	const googleId = brew.googleId;
	let afterSave = async ()=>true;

	brew.text = mergeBrewText(brew);

	if(brew.googleId && removeFromGoogle) {
		// If the google id exists and we're removing it from google, set afterSave to delete the google brew and mark the brew's google id as undefined
		afterSave = async ()=>{
			return await deleteGoogleBrew(req.account, googleId, brew.editId, res)
				.catch((err)=>{
					console.error(err);
					res.status(err?.status || err?.response?.status || 500).send(err.message || err);
				});
		};

		brew.googleId = undefined;
	} else if(!brew.googleId && saveToGoogle) {
		// If we don't have a google id and the user wants to save to google, create the google brew and set the google id on the brew
		brew.googleId = await newGoogleBrew(req.account, excludeGoogleProps(brew), res)
			.catch((err)=>{
				console.error(err);
				res.status(err.status || err.response.status).send(err.message || err);
			});
		if(!brew.googleId) return;
	} else if(brew.googleId) {
		// If the google id exists and no other actions are being performed, update the google brew
		const updated = await GoogleActions.updateGoogleBrew(excludeGoogleProps(brew))
			.catch((err)=>{
				console.error(err);
				res.status(err?.response?.status || 500).send(err);
			});
		if(!updated) return;
	}

	if(brew.googleId) {
		// If the google id exists after all those actions, exclude the props that are stored in google and aren't needed for rendering the brew items
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

	// Fetch the brew from the database again (if it existed there to begin with), and assign the existing brew to it
	brew = _.assign(await HomebrewModel.findOne({ _id: brew._id }), brew);

	if(!brew.markModified) {
		// If it wasn't in the database, create a new db brew
		brew = new HomebrewModel(brew);
	}

	brew.markModified('authors');
	brew.markModified('systems');

	// Save the database brew
	const saved = await brew.save()
		.catch((err)=>{
			console.error(err);
			res.status(err.status || 500).send(err.message || 'Unable to save brew to Homebrewery database');
		});
	if(!saved) return;
	// Call and wait for afterSave to complete
	const after = await afterSave();
	if(!after) return;

	res.status(200).send(saved);
};

const deleteGoogleBrew = async (account, id, editId, res)=>{
	const auth = await GoogleActions.authCheck(account, res);
	await GoogleActions.deleteGoogleBrew(auth, id, editId);
	return true;
};

const deleteBrew = async (req, res)=>{
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
			if(shouldDeleteGoogleBrew) {
				// When there are still authors remaining, we delete the google brew but store the full brew in the Homebrewery database
				brew.googleId = undefined;
				brew.textBin = zlib.deflateRawSync(brew.text);
				brew.text = undefined;
			}

			// Otherwise, save the brew with updated author list
			await brew.save()
				.catch((err)=>{
					throw { status: 500, message: err };
				});
		}
	}
	if(shouldDeleteGoogleBrew) {
		const deleted = await deleteGoogleBrew(account, googleId, editId, res)
			.catch((err)=>{
				console.error(err);
				res.status(500).send(err);
			});
		if(!deleted) return;
	}

	res.status(204).send();
};

// Send the parser built by browserify containing markdown.js and all its required modules
const getStandaloneParser = async (req, res)=>{
	options = {
		'root': './build/parser',
		'headers': {
			'Content-Type': 'text/javascript'
		}
	};

	// Header stuff for allowing the css to access fonts
	res.setHeader('Access-Control-Allow-Origin',  '*');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    res.sendFile('homebreweryParser.js', options, function (err) {
		if (err) {
			return res.status(500).send(err);
		}
    });
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

	// Header stuff for allowing sites to make cross origin requests for the json object
	res.setHeader('Access-Control-Allow-Origin',  '*');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.type('json');
	res.send(themesData);
};

// Checks for a specific theme from the path in the url and sends its style.css
const getThemeStyle = (req, res)=>{
	fs.readFile('./build/themes/V3/' + req.params.path + '/style.css', 'utf8', function (err,data) {
		if (err) {
			if (err.code === 'ENOENT') {
				return res.status(404).send("No such file: " + path);
			}
			else {
				return res.status(500).send(err);
			}
		}
		// Takes something like "url('../../../fonts/5e/Scaly Sans Caps.woff2')", 
		// and extracts "5e" and "Scaly Sans Caps.woff2"
		const re = /url\('\.\.\/\.\.\/\.\.\/fonts\/([^\/|\s]*)\/([^\/]*)'\)/gm;
		const formattedData = data.replace(re, (_, $1, $2)=>{
			// Substitutes with url('/api/themes/fonts/5e/Scaly%20Sans%20Caps.woff2')
			return "url('/api/themes/fonts/" + encodeURIComponent($1) + "/" + encodeURIComponent($2) + "')"
		});

		// Header stuff for allowing sites to make cross origin requests for the stylesheets
		res.setHeader('Access-Control-Allow-Origin',  '*');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		res.contentType('text/css');
		return res.send(formattedData);
	});
};

// Checks for font files required by the stylesheets and sends it
const getThemeFonts = (req, res)=>{
	const path = req.params.path + '/' + req.params.file	
	options = {
		'root': './build/fonts',
		'headers': {
			'Content-Type': req.params.file
		}
	};

	// Header stuff for allowing sites to make cross origin requests for the fonts, required for the css to work
	res.setHeader('Access-Control-Allow-Origin',  '*');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    res.sendFile(path, options, function (err) {
		if (err) {
			if (err.code === 'ENOENT') {
				return res.status(404).send("No such file: " + path);
			}
			else {
				return res.status(500).send(err);
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
				return res.status(500).send("Malformed snippet (function)");
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
		return res.status(404).send("No such module: " + req.params.path );
	}

	// Header stuff for allowing sites to make cross origin requests for the snippets
	res.setHeader('Access-Control-Allow-Origin',  '*');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

	// Returns the result from running a snippet
	return res.send(snippetOutput);
};

router.post('/api', asyncHandler(newBrew));
router.put('/api/:id', asyncHandler(getBrew('edit')), asyncHandler(updateBrew));
router.put('/api/update/:id', asyncHandler(getBrew('edit')), asyncHandler(updateBrew));
router.delete('/api/:id', asyncHandler(getBrew('edit')), asyncHandler(deleteBrew));
router.get('/api/remove/:id', asyncHandler(getBrew('edit')), asyncHandler(deleteBrew));

router.get('/api/homebreweryParser.js', getStandaloneParser);
router.post('/api/themes/', getThemes);
router.get('/api/themes/:path/style', getThemeStyle);
router.get('/api/themes/fonts/:path/:file', getThemeFonts);
router.post('/api/themes/:path/snippets/:snippetGroup/:snippet', getThemeSnippet);

module.exports = {
	homebrewApi : router,
	getBrew
};