import _       from 'lodash';
import yaml    from 'js-yaml';
import request from '../client/homebrew/utils/request-middleware.js';

// Convert the templates from a brew to a Snippets Structure.
const brewSnippetsToJSON = (menuTitle, userBrewSnippets, themeBundleSnippets=null, full=true)=>{
	const textSplit  = /^\\snippet /gm;
	const mpAsSnippets = [];
	// Snippets from Themes first.
	if(themeBundleSnippets) {
		for (let themes of themeBundleSnippets) {
			if(typeof themes !== 'string') {
				const userSnippets = [];
				for (let snips of themes.snippets.trim().split(textSplit)) {
					const name = snips.trim().split('\n')[0];
					if(name.length != 0) {
						userSnippets.push({
							name : name.slice('\snippets'.length),
							icon : '',
							gen  : snips.slice(name.length + 1).trim(),
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
		for (let snips of userBrewSnippets.trim().split(textSplit)) {
			let name = snips.split('\n')[0];
			let justSnippet = snips.slice(name.length + 1);
			if(justSnippet.slice(-1) === '\n') {
				justSnippet = justSnippet.slice(0, -1);
			}
			if(name.length != 0) {
				const subSnip = {
					name : name,
					gen  : justSnippet,
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
	for (let snippet of yamlObj.snippets) {
		for (let subSnippet of snippet.subsnippets) {
			snippetsText = `${snippetsText}\\snippet ${subSnippet.name}\n${subSnippet.gen || ''}\n`;
		}
	}
	return snippetsText;
};

const splitTextStyleAndMetadata = (brew)=>{
	brew.text = brew.text.replaceAll('\r\n', '\n');
	if(brew.text.startsWith('```metadata')) {
		const index = brew.text.indexOf('\n```\n\n');
		const metadataSection = brew.text.slice(11, index - 1);
		const metadata = yaml.load(metadataSection);
		Object.assign(brew, _.pick(metadata, ['title', 'description', 'tags', 'systems', 'renderer', 'theme', 'lang']));
		brew.text = brew.text.slice(index + 6);
	}
	if(brew.text.startsWith('```css')) {
		const index = brew.text.indexOf('\n```\n\n');
		brew.style = brew.text.slice(6, index - 1);
		brew.text = brew.text.slice(index + 6);
	}
	if(brew.text.startsWith('```snippets')) {
		const index = brew.text.indexOf('\n```\n\n');
		brew.snippets = yamlSnippetsToText(yaml.load(brew.text.slice(11, index - 1))).slice(0, -1);
		brew.text = brew.text.slice(index + 6);
	}
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

const fetchThemeBundle = async (obj, renderer, theme)=>{
	if(!renderer || !theme) return;
	const res = await request
			.get(`/api/theme/${renderer}/${theme}`)
			.catch((err)=>{
				obj.setState({ error: err });
			});
	if(!res) return;

	const themeBundle = res.body;
	themeBundle.joinedStyles = themeBundle.styles.map((style)=>`<style>${style}</style>`).join('\n\n');
	obj.setState((prevState)=>({
		...prevState,
		themeBundle : themeBundle
	}));
};

export {
	splitTextStyleAndMetadata,
	printCurrentBrew,
	fetchThemeBundle,
	brewSnippetsToJSON
};
