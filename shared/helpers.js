/* eslint-disable max-lines */
import _       from 'lodash';
import yaml    from 'js-yaml';
import request from '../client/homebrew/utils/request-middleware.js';

// Convert the templates from a brew to a Snippets Structure.
const templatesToSnippet = (menuTitle, templates, themeBundle)=>{
	const textSplit  = /^\\template/gm;
	const mpAsSnippets = [];
	// Templates from Themes first.
	for (let themes of themeBundle) {
		const pages = [];
		if(themes.templates) {
			for (let mp of themes.templates.split(textSplit)) {
				let name = mp.split('\n')[0].trim();
				if(name.length == 0) name = 'Blank';
				pages.push({
					name : name,
					icon : '',
					gen  : `\n\\page ${themes.name}:${name}\n`,
				});
			}
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
	if(templates){
		for (let mp of templates.split(textSplit)) {
			let name = mp.split('\n')[0];
			if(name.length == 0) name = 'Blank';
			pages.push({
				name : name,
				icon : '',
				gen  : `\n\\page ${menuTitle}:${name}\n`,
			});
		}
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

const splitTemplates = (templates)=>{
	const splitTemplates = templates.split(/^(?=^\\template)/gm);
	const templatesObj = [];
	splitTemplates.forEach((page)=>{
		const firstLine = page.split('\n')[0];
		const firstLineClean = firstLine.slice(5).trim() || 'Blank';
		templatesObj.push({ name: firstLineClean, template: page.slice(firstLine.length) });
	});
	return templatesObj;
};

const asTemplateMap = (templates)=>{
	if(!templates) return [];
	const resultTemplates = [];
	if(typeof templates === 'string') {
		const localTemplates = splitTemplates(templates);
		for (let lt of localTemplates) {
			resultTemplates.push({
				theme    : '',
				name     : lt.name,
				template : lt.template
			});
		}
	} else {
		// Walk a template bundle
		for (let theme of templates) {
			const themeTemplates = splitTemplates(theme.templates);
			for (let tt of themeTemplates) {
				resultTemplates.push({
					theme    : theme.name,
					name     : tt.name,
					template : tt.template
				});
			}
		}

	}
	return resultTemplates;
}
const brewSnippetsToJSON = (menuTitle, userBrewSnippets, themeBundleSnippets=null, full=true)=>{
	const textSplit  = /^(\\snippet +.+\n)/gm;
	const mpAsSnippets = [];
	// Snippets from Themes first.
	if(themeBundleSnippets) {
		for (let themes of themeBundleSnippets) {
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
	
	for (let snippet of yamlObj) {
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
		const metadataSection = brew.text.slice(11, index + 1);
		const metadata = yaml.load(metadataSection);
		Object.assign(brew, _.pick(metadata, ['title', 'description', 'tags', 'systems', 'renderer', 'theme', 'lang']));
		brew.snippets = yamlSnippetsToText(_.pick(metadata, ['snippets']).snippets || '');
		brew.text = brew.text.slice(index + 6);
	}
	if(brew.text.startsWith('```snippets')) {
		const index = brew.text.indexOf('```\n\n');
		brew.snippets = brew.text.slice(12, index - 1);
		brew.text = brew.text.slice(index + 5);
	}
	if(brew.text.startsWith('```css')) {
		const index = brew.text.indexOf('```\n\n');
		brew.style = brew.text.slice(7, index - 1);
		brew.text = brew.text.slice(index + 5);
	}
	if(brew.text.startsWith('```templates')) {
		const index = brew.text.indexOf('```\n\n');
		brew.templates = brew.text.slice(13, index - 1);
		brew.text = brew.text.slice(index + 5);
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

const fetchThemeBundle = async (obj, renderer, theme)=>{
	if(!renderer || !theme) return;
	const res = await request
			.get(`/api/theme/${renderer}/${theme}`)
			.catch((err)=>{
				obj.setState({ error: err });
			});
	if(!res) {
		obj.setState((prevState)=>({
			...prevState,
			themeBundle : {}
		}));
		return;
	}
	const themeBundle = res.body;
	themeBundle.joinedStyles = themeBundle.styles.map((style)=>`<style>${style}</style>`).join('\n\n');
	obj.setState((prevState)=>({
		...prevState,
		themeBundle : themeBundle,
		error       : null
	}));
};

export {
	splitTextStyleAndMetadata,
	printCurrentBrew,
	fetchThemeBundle,
	templatesToSnippet,
	asTemplateMap,
	brewSnippetsToJSON
};
