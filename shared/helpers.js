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

const fetchThemeBundle = async (obj, renderer, theme)=>{
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

let pageArray = [];
let currentPage = 1;

const updatePageArray = (add, pageNo)=>{
	// Remove page # from array
	if(!add){
		// If page # not in array, exit
		if(!pageArray.includes(pageNo)) return;
		// Update array to exclude page #
		pageArray = pageArray.filter((el)=>{return el != pageNo;});
		return;
	}
	// Add page # to array
	// If page # already in array, exit
	if(pageArray.includes(pageNo)) return;
	// Add page # to array
	pageArray.push(pageNo);
	return;
};

const getPageNumber = ()=>{
	if(pageArray.length == 0) return currentPage;
	currentPage = Math.floor(pageArray.reduce((p, c)=>{p+c;}) / pageArray.length);
	return currentPage;
};

const getVisiblePageRange = ()=>{
	if(pageArray.length <= 3) return pageArray.join(', ');
	return `${pageArray[0]} - ${pageArray.slice(-1)[0]}`;
};

module.exports = {
	splitTextStyleAndMetadata,
	printCurrentBrew,
	fetchThemeBundle,
	updatePageArray,
	getPageNumber,
	getVisiblePageRange
};
