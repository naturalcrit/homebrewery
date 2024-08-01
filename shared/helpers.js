const _ = require('lodash');
const yaml = require('js-yaml');
const jszip = require('jszip');
const fileSaver = require('file-saver');
const htmlimg = require('html-to-image');
const base64url = require('base64-url');
const request = require('../client/homebrew/utils/request-middleware.js');


const thumbnailCapture = async (pageNumber, brewRenderer)=>{

	const activePage = brewRenderer.getElementById(`p${pageNumber.toString()}`);
	const srcImages = activePage.getElementsByTagName('img');
	for (let imgPos = 0; imgPos < srcImages.length; imgPos++) {
		srcImages[imgPos].src = !srcImages[imgPos].src.startsWith(window.location.host) ? `/xssp/${base64url.encode(srcImages[imgPos].src)}` : srcImages[imgPos].src;
	}

	const clientHeightLg = activePage.clientHeight;
	const clientWidthLg = activePage.clientWidth;

	// HARD Override margins.
	const lastMargin = activePage.style.marginLeft;
	activePage.style.marginLeft = '0px';

	return await htmlimg.toJpeg(activePage,
		{
		  width        : clientWidthLg,
		  height       : clientHeightLg,
		  canvasHeight : clientHeightLg,
		  canvasWidth  : clientWidthLg,
		  quality      : 0.75
		}).then(async (dataURL)=>{
		const blob = await (await fetch(dataURL)).blob();
		activePage.style.marginLeft = lastMargin;
		return blob;
	});
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

const createBrewCBZ = async ()=>{
	const thisHost = `${window.location.protocol}//${window.location.host}`;

	function urlReplacer(urlMatch, url) {
		if(!url.startsWith(thisHost)) return (`url(/xssp/${base64url.encode(url)})`);
		else return url;
	}

	if(window.typeof !== 'undefined') {
		const bR = parent.document.getElementById('BrewRenderer');
		const brewRenderer = bR.contentDocument || bR.contentWindow.document;
		const numberOfPages = brewRenderer.getElementsByClassName('page').length + 1;
		const topLinks = brewRenderer.getElementsByTagName('link');
		const topStyles = brewRenderer.getElementsByTagName('style');
		for (let linkPos = 0; linkPos < topLinks.length; linkPos++) {
			if(!topLinks[linkPos].href.startsWith(thisHost)) {
				topLinks[linkPos].href = `${thisHost}/xssp/${base64url.encode(topLinks[linkPos].href)}`;
			}
		}
		for (let stylePos = 0; stylePos < topStyles.length; stylePos++) {
			const urlRegex = /url\(([^\'\"].*[^\'\"])\)/gs;
			const urlRegexWrapped = /url\(\'(.*)\'\)/gs;
			topStyles[stylePos].innerText = topStyles[stylePos].innerText.replace(urlRegex,  urlReplacer);
			topStyles[stylePos].innerText = topStyles[stylePos].innerText.replace(urlRegexWrapped, urlReplacer);
		}

		const archive = new jszip();
		const pagePromises = [];
		for (let pageNum=1; pageNum < numberOfPages; pageNum++){
			pagePromises.push(thumbnailCapture(pageNum, brewRenderer));
		}

		Promise.all(pagePromises).then((resolveds)=>{
			for (let pageNum=1; pageNum < numberOfPages; pageNum++){
				const fileName = `${pageNum.toString().padStart(4, '0')}.Page-${pageNum == 0 ? 'Cover' : pageNum.toString()}.jpg`;
				const pageBlob = resolveds[pageNum - 1];
				archive.file(fileName, pageBlob);
			}
			archive.generateAsync({ type: 'blob' }).then((content)=>{
				fileSaver.saveAs(content, `${document.title.slice(0, -1 * ' - The Homebrewery'.length).trim()}.cbz`);
			});
		});
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

module.exports = {
	splitTextStyleAndMetadata,
	printCurrentBrew,
	createBrewCBZ,
	fetchThemeBundle,
};
