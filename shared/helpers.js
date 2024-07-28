const _ = require('lodash');
const yaml = require('js-yaml');
const request = require('../client/homebrew/utils/request-middleware.js');

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

const fetchThemeBundle = async (obj, renderer, theme) => {
	const res = await request
			.get(`${window.location.protocol}//${window.location.host}/api/theme/${renderer}/${theme}`)
			.catch((err) => {
					obj.setState({ error: err });
			});
	if (!res) return;

	const themeBundle = res.body;
	themeBundle.joinedStyles = themeBundle.styles.map((style) => `<style>${style}</style>`).join('\n\n');
	obj.setState((prevState) => ({
			...prevState,
			themeBundle: themeBundle
	}));
};

module.exports = {
	splitTextStyleAndMetadata,
	printCurrentBrew,
	fetchThemeBundle,
};
