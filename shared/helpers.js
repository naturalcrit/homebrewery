const _ = require('lodash');
const yaml = require('js-yaml');
const request = require('../client/homebrew/utils/request-middleware.js');
const dedent = require('dedent');

// Convert the templates from a brew to a Snippets Structure.
const templatesToSnippet = (menuTitle, templates, themeBundle)=>{
	const textSplit  = /^\\template/gm;
	const mpAsSnippets = [];
	// Templates from Themes first.
	for (let themes of themeBundle) {
		const pages = [];
		for (let mp of themes.templates.split(textSplit)) {
			let name = mp.split('\n')[0];
			if(name.length == 0) name = 'Blank';
			pages.push({
				name : name,
				icon : '',
				gen  : `\n\\page ${themes.name}:${name}\n`,
			});
		}
		if(pages.length > 0) {
			mpAsSnippets.push({
				name        : themes.name,
				icon        : '',
				gen         : '',
			    subsnippets : pages
			});
		}
	}
	// Local Templates
	const pages = [];
	for (let mp of templates.split(textSplit)) {
		let name = mp.split('\n')[0];
		if(name.length == 0) name = 'Blank';
		pages.push({
			name : name,
			icon : '',
			gen  : `\n\\page ${menuTitle}:${name}\n`,
		});
	}
	if(pages.length) {
		mpAsSnippets.push({
			name        : menuTitle,
			icon        : '',
			subsnippets : pages
		});
	}

	return {
		groupName : 'Templates',
		icon      : 'fas fa-pencil-alt',
		view      : 'text',
		snippets  : mpAsSnippets
	};
};

const splitTextStyleAndMetadata = (brew)=>{
	brew.text = brew.text.replaceAll('\r\n', '\n');
	if(brew.text.startsWith('```metadata')) {
		const index = brew.text.indexOf('```\n\n');
		const metadataSection = brew.text.slice(12, index - 1);
		const metadata = yaml.load(metadataSection);
		Object.assign(brew, _.pick(metadata, ['title', 'description', 'tags', 'systems', 'renderer', 'theme', 'lang']));
		brew.text = brew.text.slice(index + 5);
	}
	if(brew.text.startsWith('```css')) {
		const index = brew.text.indexOf('```\n\n');
		brew.style = brew.text.slice(7, index - 1);
		brew.text = brew.text.slice(index + 5);
	}
	if(brew.text.startsWith('```snippets')) {
		const index = brew.text.indexOf('```\n\n');
		brew.snippets = brew.text.slice(11, index - 1);
		brew.text = brew.text.slice(index + 5);
	}
	if(brew.text.startsWith('```templates')) {
		const index = brew.text.indexOf('```\n\n');
		brew.templates = brew.text.slice(12, index - 1);
		brew.text = brew.text.slice(index + 5);
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

module.exports = {
	splitTextStyleAndMetadata,
	printCurrentBrew,
	fetchThemeBundle,
	templatesToSnippet
};
