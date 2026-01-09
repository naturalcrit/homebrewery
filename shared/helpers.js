/* eslint-disable max-lines */
import _       from 'lodash';
import yaml    from 'js-yaml';
import request from '../client/homebrew/utils/request-middleware.js';
import Markdown from '../shared/markdown.js';
import packageJSON from '../package.json' with { type: 'json' };

const PAGEBREAK_REGEX_V3 = /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m;
const PAGEBREAK_REGEX_LEGACY = /\\page(?:break)?/m;
const COLUMNBREAK_REGEX_LEGACY = /\\column(:?break)?/m;


// Convert the templates from a brew to a Snippets Structure.
const brewSnippetsToJSON = (menuTitle, userBrewSnippets, themeBundleSnippets=null, full=true)=>{
	const textSplit  = /^(\\snippet +.+\n)/gm;
	const mpAsSnippets = [];
	// Snippets from Themes first.
	if(themeBundleSnippets) {
		for (const themes of themeBundleSnippets) {
			if(typeof themes !== 'string') {
				const userSnippets = [];
				const snipSplit = themes.snippets.trim().split(textSplit).slice(1);
				for (let snips = 0; snips < snipSplit.length; snips+=2) {
					if(!snipSplit[snips].startsWith('\\snippet ')) break;
					const snippetName = snipSplit[snips].split(/\\snippet +/)[1].split('\n')[0].trim();
					if(snippetName.length != 0) {
						userSnippets.push({
							name : snippetName,
							icon : '',
							gen  : snipSplit[snips + 1],
						});
					}
				}
				if(userSnippets.length > 0) {
					mpAsSnippets.push({
						name        : themes.name,
						icon        : '',
						gen         : '',
						subsnippets : userSnippets
					});
				}
			}
		}
	}
	// Local Snippets
	if(userBrewSnippets) {
		const userSnippets = [];
		const snipSplit = userBrewSnippets.trim().split(textSplit).slice(1);
		for (let snips = 0; snips < snipSplit.length; snips+=2) {
			if(!snipSplit[snips].startsWith('\\snippet ')) break;
			const snippetName = snipSplit[snips].split(/\\snippet +/)[1].split('\n')[0].trim();
			if(snippetName.length != 0) {
				const subSnip = {
					name : snippetName,
					gen  : snipSplit[snips + 1],
				};
				// if(full) subSnip.icon = '';
				userSnippets.push(subSnip);
			}
		}
		if(userSnippets.length) {
			mpAsSnippets.push({
				name        : menuTitle,
				// icon        : '',
				subsnippets : userSnippets
			});
		}
	}

	const returnObj = {
		snippets : mpAsSnippets
	};

	if(full) {
		returnObj.groupName = 'Brew Snippets';
		returnObj.icon = 'fas fa-th-list';
		returnObj.view = 'text';
	}

	return returnObj;
};

const yamlSnippetsToText = (yamlObj)=>{
	if(typeof yamlObj == 'string') return yamlObj;

	let snippetsText = '';

	for (const snippet of yamlObj) {
		for (const subSnippet of snippet.subsnippets) {
			snippetsText = `${snippetsText}\\snippet ${subSnippet.name}\n${subSnippet.gen || ''}\n`;
		}
	}
	return snippetsText;
};

const splitTextStyleAndMetadata = (brew)=>{
	brew.text = brew.text.replaceAll('\r\n', '\n');
	if(brew.text.startsWith('```metadata')) {
		const index = brew.text.indexOf('\n```\n\n');
		const metadataSection = brew.text.slice(11, index + 1);
		const metadata = yaml.load(metadataSection);
		Object.assign(brew, _.pick(metadata, ['title', 'description', 'tags', 'systems', 'renderer', 'theme', 'lang']));
		brew.snippets = yamlSnippetsToText(_.pick(metadata, ['snippets']).snippets || '');
		brew.text = brew.text.slice(index + 6);
	}
	if(brew.text.startsWith('```css')) {
		const index = brew.text.indexOf('\n```\n\n');
		brew.style = brew.text.slice(7, index + 1);
		brew.text = brew.text.slice(index + 6);
	}

	// Handle old brews that still have empty strings in the tags metadata
	if(typeof brew.tags === 'string') brew.tags = brew.tags ? [brew.tags] : [];
};

const printCurrentBrew = ()=>{
	if(window.typeof !== 'undefined') {
		window.frames['BrewRenderer'].contentWindow.print();
		//Force DOM reflow; Print dialog causes a repaint, and @media print CSS somehow makes out-of-view pages disappear
		const node = window.frames['BrewRenderer'].contentDocument.getElementsByClassName('brewRenderer').item(0);
		node.style.display='none';
		node.offsetHeight; // accessing this is enough to trigger a reflow
		node.style.display='';
	}
};

const fetchThemeBundle = async (setError, setThemeBundle, renderer, theme)=>{
	if(!renderer || !theme) return;
	const res = await request
			.get(`/api/theme/${renderer}/${theme}`)
			.catch((err)=>{
				setError(err);
			});
	if(!res) {
		setThemeBundle({});
		return;
	}
	const themeBundle = res.body;
	themeBundle.joinedStyles = themeBundle.styles.map((style)=>`<style>${style}</style>`).join('\n\n');
	setThemeBundle(themeBundle);
	setError(null);
};

const debugTextMismatch = (clientTextRaw, serverTextRaw, label)=>{
	const clientText = clientTextRaw?.normalize('NFC') || '';
	const serverText = serverTextRaw?.normalize('NFC') || '';

	const clientBuffer = Buffer.from(clientText, 'utf8');
	const serverBuffer = Buffer.from(serverText, 'utf8');

	if(clientBuffer.equals(serverBuffer)) {
		console.log(`✅ ${label} text matches byte-for-byte.`);
		return;
	}

	console.warn(`❗${label} text mismatch detected.`);
	console.log(`Client length: ${clientBuffer.length}`);
	console.log(`Server length: ${serverBuffer.length}`);

	// Byte-level diff
	for (let i = 0; i < Math.min(clientBuffer.length, serverBuffer.length); i++) {
		if(clientBuffer[i] !== serverBuffer[i]) {
			console.log(`Byte mismatch at offset ${i}: client=0x${clientBuffer[i].toString(16)} server=0x${serverBuffer[i].toString(16)}`);
			break;
		}
	}

	// Char-level diff
	for (let i = 0; i < Math.min(clientText.length, serverText.length); i++) {
		if(clientText[i] !== serverText[i]) {
			console.log(`Char mismatch at index ${i}:`);
			console.log(`  Client: '${clientText[i]}' (U+${clientText.charCodeAt(i).toString(16).toUpperCase()})`);
			console.log(`  Server: '${serverText[i]}' (U+${serverText.charCodeAt(i).toString(16).toUpperCase()})`);
			break;
		}
	}
};

const simulateRenderPage = (pageText, index, renderer)=>{

	let styles = {};

	let classes    = 'page';
	let attributes = {};

	if(renderer == 'legacy') {
		pageText.replace(COLUMNBREAK_REGEX_LEGACY, '```\n````\n'); // Allow Legacy brews to use `\column(break)`
		// const html = MarkdownLegacy.render(pageText);
		const html = "Markdown Legacy currently unsupported"

		return `<div className='page phb' index=${index} key=${index} style=${styles}>\n${html}\n</div>\n`;
	} else {
		if(pageText.startsWith('\\page')) {
			const firstLineTokens  = Markdown.marked.lexer(pageText.split('\n', 1)[0])[0].tokens;
			const injectedTags = firstLineTokens?.find((obj)=>obj.injectedTags !== undefined)?.injectedTags;
			if(injectedTags) {
				styles     = { ...styles, ...injectedTags.styles };
				styles     = _.mapKeys(styles, (v, k)=>k.startsWith('--') ? k : _.camelCase(k)).join(''); // Convert CSS to camelCase for React
				classes    = [classes, injectedTags.classes].join(' ').trim();
				attributes = injectedTags.attributes;
			}
			pageText = pageText.includes('\n') ? pageText.substring(pageText.indexOf('\n') + 1) : ''; // Remove the \page line
		}

		// DO NOT REMOVE!!! REQUIRED FOR BACKWARDS COMPATIBILITY WITH NON-UPGRADABLE VERSIONS OF CHROME.
		pageText += `\n\n&nbsp;\n\\column\n&nbsp;`; //Artificial column break at page end to emulate column-fill:auto (until `wide` is used, when column-fill:balance will reappear)

		const html = Markdown.render(pageText, index);

		return `<div class=${classes} id=p${index} key=${index} style=${styles} ${attributes}>\n${html}\n</div>`;
	}
};


const simulateRender = async (req, res, next)=>{
	let htmlHead = '';
	let htmlStyles = '';
	let htmlBody = '';
	let errorMsg = {};
	// Build HTML similar to the BrewRender  ?

	const setError = (error)=>{
		errorMsg = error;
	};


	splitTextStyleAndMetadata(req.brew);

	const PORT = req.header('host').indexOf[':'] > -1 ? req.header('host').split(':')[1] : '8000';

	const themeRes = await request
			.get(`http://localhost:${PORT}/api/theme/${req.brew.renderer}/${req.brew.theme}`)
			.set('Homebrewery-Version', packageJSON.version)
			.catch((err)=>{
				setError(err);
			});

	const htmlThemeBundle = themeRes.body.styles.map((style)=>`<style>${style}</style>`).join('\n\n');

	// Create Head
	htmlHead += `	<head>
		<link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css">
		<link href="/homebrew/bundle.css" type="text/css" rel="stylesheet">
		<base target="_blank">
		<title>${req.brew.title}</title>
	</head>`;

	htmlStyles = `\t<div style="display:none;">\n` +
		`\t\t${htmlThemeBundle}\n` +
		`\t\t<style>\n${req.brew.style}\n</style>\n` +
		`\t</div>`;

	let rawPages = [];
	let renderedPages = [];

	if(req.brew.renderer == 'legacy') {
		rawPages = req.brew.text.split(PAGEBREAK_REGEX_LEGACY);
	} else {
		rawPages = req.brew.text.split(PAGEBREAK_REGEX_V3);
	}

	_.forEach(rawPages, (page, index)=>{
		renderedPages[index] = simulateRenderPage(page, index, req.brew.renderer);
	});

	htmlBody = `<div class="pages recto	single" lang="en" style="zoom: 100%; gap: 5px 10px;">${renderedPages.join('\n')}\n</div`;

	const result = `<html>\n${htmlHead}\n<body>\n\t<div>\n\t\t<div class="frame-content">\n\t\t\t<div class="brewRenderer">\n` +
		`\t\t\t\t${htmlStyles}\n${htmlBody}\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</body>\n</html>`;
	req.brew.html = result;
	next();
};

export {
	splitTextStyleAndMetadata,
	printCurrentBrew,
	fetchThemeBundle,
	brewSnippetsToJSON,
	debugTextMismatch,
	simulateRender,
};
