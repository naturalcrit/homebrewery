/* eslint-disable max-lines */
const router = require('express').Router();
const Themes = require('../themes/themes.json');
const fs = require('fs');

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
// strings for all available snippet groups and snippets.
//
// This step should be changed to mirror the style of themes.json. Both homebrewery-themes 
// and user-themes should be in the form of an object rather than an array, and they will
// need to contain baseTheme and baseSnippets
const getThemes = (req, res)=>{
	let themesData = {
		// Homebrewery provided themes that are located in the source code
		"homebrewery-themes": [],
		// User made themes (might be implemented in the future)
		"user-themes": []
	};
	Object.keys(Themes["V3"]).map((key) => {
		const theme = Themes["V3"][key];

		// TODO: Add user made themes to the same object, using the same format, when that is implemented

		themesData["homebrewery-themes"].push({
			"name": theme["name"],
			"path": theme["path"]
		});
	});

	// Header stuff for allowing sites to make cross origin requests for the json object
	res.setHeader('Access-Control-Allow-Origin',  '*');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.type('json');
	res.send(themesData);
};

// Generates a single stylesheet from a themes style and its basetheme.
// TODO: This doesn't check for import loops. This needs to be fixed before user themes are implemented
const generateStyleSheet = (theme)=>{
	let res = '';
	
	// Appends all basethemes stylesheets to the top of the resulting document
	if(Themes["V3"][theme]['baseTheme']) {
		res += generateStyleSheet(Themes["V3"][theme]['baseTheme']) + '\n';
	}

	let data = fs.readFileSync('./build/themes/V3/' + theme + '/style.css', 'utf8');

	// Takes something like "url('../../../fonts/5e/Scaly Sans Caps.woff2')", 
	// and extracts "5e" and "Scaly Sans Caps.woff2"
	const re = /url\('\.\.\/\.\.\/\.\.\/fonts\/([^\/|\s]*)\/([^\/]*)'\)/gm;
	res += data.replace(re, (_, $1, $2)=>{
		// Substitutes with url('/api/themes/fonts/5e/Scaly%20Sans%20Caps.woff2')
		return "url('/api/themes/fonts/" + encodeURIComponent($1) + "/" + encodeURIComponent($2) + "')"
	});

	return res;
}

// Checks for a specific theme from the path in the url and sends its style.css.
const getThemeStyle = (req, res)=>{
	try {
		const stylesheet = generateStyleSheet(req.params.path);
		// Header stuff for allowing sites to make cross origin requests for the stylesheets
		res.setHeader('Access-Control-Allow-Origin',  '*');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		res.contentType('text/css');
		return res.send(stylesheet);
	}
	catch (err) {
		if(err.code == 'ENOENT') {
			return res.status(404).send('No such file: ' + req.params.path);
		}
		else {
			return res.status(500).send(err);
		}
	}
	
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

// Generate a JSON object recursively, containing all snippets in a theme and their URLs
// TODO: This doesn't check for import loops. This needs to be fixed before user themes are implemented
const generateThemeSnippets = (req, themePath)=>{
	let baseTheme = Themes['V3'][themePath];
	let resSnippetGroups = [];

	if(!baseTheme) {
		return resSnippetGroups;
	}

	// Load snippets from parent theme
	if(baseTheme['baseSnippets']) {
		let baseSnippets = Themes['V3'][baseTheme['baseSnippets']];
		if(baseSnippets) {
			resSnippetGroups = generateThemeSnippets(req, baseTheme['baseSnippets']);
		}
	}

	try {
		const baseThemeSnippets = require("../themes/V3/" + baseTheme["path"] + "/snippets.js");

		// Add a new snippet in resSnippets
		function addSnippet(resSnippets, baseSnippet, groupName) {
			resSnippets.push({
				'name': baseSnippet['name'],
				'path': `${req.protocol}://${req.get('host')}/api/themes/${themePath}/snippets/${encodeURIComponent(groupName)}/${encodeURIComponent(baseSnippet['name'])}`,
				'icon': baseSnippet['icon']
			});
		}
		
		// Append to an existing snippet
		function appendSnippet(resSnippet, baseSnippet, groupName) {
			resSnippet['path'] = `${req.protocol}://${req.get('host')}/api/themes/${themePath}/snippets/${encodeURIComponent(groupName)}/${encodeURIComponent(baseSnippet['name'])}`;
			resSnippet['icon'] = baseSnippet['icon'];
		}

		// Add a new snippet group in resSnippetGroups
		function addSnippetGroup(resSnippetsGroups, baseSnippetGroup) {
			let resGroup = {
				'groupName': baseSnippetGroup['groupName'],
				'icon': baseSnippetGroup['icon'],
				'view': baseSnippetGroup['view'],
				'snippets': []
			};

			baseSnippetGroup['snippets'].forEach(baseSnippet => {
				addSnippet(resGroup['snippets'], baseSnippet, baseSnippetGroup['groupName']);
			})

			resSnippetsGroups.push(resGroup);
		}

		// Append to existing group in result
		function appendSnippetGroup(resSnippetGroup, baseSnippetGroup) {
			// Set the existing group icon and view to the one from the base
			resSnippetGroup['icon'] = baseSnippetGroup['icon'];
			resSnippetGroup['view'] = baseSnippetGroup['view'];

			// Go through all snippets in base and check if it's already present in the result. Overwrite it if so, otherwise add it
			baseSnippetGroup['snippets'].forEach(baseSnippet => {
				if(!resSnippetGroup['snippets']) {
					addSnippet(resSnippetGroup['snippets'], baseSnippet, baseSnippetGroup['groupName']);
				}
				if(resSnippetGroup['snippets'].find((snippetInstance) => {return snippetInstance['name'] === baseSnippet['name']})) {
					appendSnippet(resSnippetGroup['snippets'].find((snippetInstance) => {return snippetInstance['name'] === baseSnippet['name']}), baseSnippet, baseSnippetGroup['groupName']);
				}
				else {
					addSnippet(resSnippetGroup['snippets'], baseSnippet, baseSnippetGroup['groupName']);
				}
			});
		}

		baseThemeSnippets.forEach(baseSnippetGroup => {
			// Check so that no other snippet group of the same name exists in the result. Creates a new one in that case
			if(!resSnippetGroups.length) {
				addSnippetGroup(resSnippetGroups, baseSnippetGroup);
			}
			else if(resSnippetGroups.find((groupInstance) => {return groupInstance['groupName'] === baseSnippetGroup['groupName']})) {
				appendSnippetGroup(resSnippetGroups.find((groupInstance) => {return groupInstance['groupName'] === baseSnippetGroup['groupName']}), baseSnippetGroup);
			}
			// Create new group if none is present
			else {
				addSnippetGroup(resSnippetGroups, baseSnippetGroup);
			}
		});
	}
	catch(error) {
		// Ignore if there is an error in themes.json and just return an unaltered array
		if (error.code !== 'MODULE_NOT_FOUND') {
			throw error;
		}
	}

	return resSnippetGroups;
};

// Generate a JSON object containing all snippets in a theme
const getSnippets = (req, res)=>{
	let theme = Themes['V3'][req.params.path];
	if(!theme) {
		return res.status(404).send("No such theme: " + path);
	}

	// Header stuff for allowing sites to make cross origin requests for the json object
	res.setHeader('Access-Control-Allow-Origin',  '*');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.type('json');
	res.send(generateThemeSnippets(req, req.params.path));
};

// Checks for a snippet in a theme, tries to run it and return the results.
// It needs to go through all snippets in baseSnippets too, and all snippets
// in its baseSnippets
const runThemeSnippet = (req, res, next)=>{
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

router.get('/api/homebreweryParser.js', getStandaloneParser);
router.get('/api/themes.json', getThemes);
router.get('/api/themes/:path/style.css', getThemeStyle);
router.get('/api/themes/fonts/:path/:file', getThemeFonts);
router.get('/api/themes/:path/snippets.json', getSnippets);
router.post('/api/themes/:path/snippets/:snippetGroup/:snippet', runThemeSnippet);

module.exports = {
	externalRendererApi : router
};