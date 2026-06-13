import _       from 'lodash';
import yaml    from 'js-yaml';
import request from '../client/homebrew/utils/request-middleware.js';
import Themes from '../themes/themes.json' with { type: 'json' };

const isStaticTheme = (renderer, themeName)=>{
	return Themes[renderer]?.[_.lowerFirst(themeName)] !== undefined;
};


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
							gen  : snipSplit[snips + 1].replace(/\n$/, ''),
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
					gen  : snipSplit[snips + 1].replace(/\n$/, ''),
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
		Object.assign(brew, _.pick(metadata, ['title', 'description', 'renderer', 'theme', 'lang']));
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

const printCurrentBrew = async ()=>{
	if(window.typeof !== 'undefined') {
		// fire a custom event for the print cycle
		document.dispatchEvent(new CustomEvent('print:startprep'));
		try {
			const iframeDoc = window.frames['BrewRenderer'].contentDocument;

			// get all img elements with lazy loading (currently only elements generated through MarkedJS)
			const lazyImages = [...iframeDoc.querySelectorAll('img[loading="lazy"]')];
			lazyImages.forEach((img)=>{ img.loading = 'eager'; });

			// waits for images to load before resolving promise and opening print dialog
			await Promise.all(
				lazyImages
								.filter((img)=>!img.complete)
								.map((img)=>new Promise((resolve)=>{ img.onload = resolve; img.onerror = resolve; }))
			);

			window.frames['BrewRenderer'].contentWindow.print();

			//Force DOM reflow; Print dialog causes a repaint, and @media print CSS somehow makes out-of-view pages disappear
			const node = iframeDoc.getElementsByClassName('brewRenderer').item(0);
			node.style.display='none';
			node.offsetHeight; // accessing this is enough to trigger a reflow
			node.style.display='';
		} finally {
			// when lazy load images have all been loaded, and the doc re-rendered for print preview, emit 'finished' event.
			document.dispatchEvent(new CustomEvent('print:finishedprep'));
		}
	}
};

const fetchThemeBundle = async (setError, setThemeBundle, renderer, theme)=>{
	if(!renderer || !theme) return;
	const res = await request
				.get(`/api/theme/${renderer.toLowerCase()}/${isStaticTheme(renderer, theme) ? _.lowerFirst(theme) : theme}`)
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
			const getMismatchContext = (text, index, name, size = 10)=>{
				const lower = Math.max(index - size, 0);
				const upper = Math.min(index + size, text.length);
				const slice = `${JSON.stringify(text.slice(lower, index)).slice(1, -1)}\u001B[31m${JSON.stringify(text[i]).slice(1, -1)}\u001B[0m${JSON.stringify(text.slice(index+1, upper)).slice(1, -1)}`;
				const lineNo = text.slice(0, index).split('\n').length;
				const code = `U+${text.charCodeAt(i).toString(16).toUpperCase()}`;

				return {
					name,
					lineNo,
					code,
					lower,
					upper,
					slice
				};
			};

			const boundSize = 10;

			const clientContext = getMismatchContext(clientText, i, 'Client', boundSize);
			const serverContext = getMismatchContext(serverText, i, 'Server', boundSize);

			const logContext = (context)=>{
				console.log(`  ${context.name} - line ${context.lineNo} : (${context.code})\t${context.slice}`);
			};

			console.log(`Char mismatch at index ${i}:`);
			logContext(clientContext);
			logContext(serverContext);
			break;
		}
	}
};

export {
	splitTextStyleAndMetadata,
	printCurrentBrew,
	fetchThemeBundle,
	brewSnippetsToJSON,
	debugTextMismatch,
	isStaticTheme
};
