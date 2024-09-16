const dedent = require('dedent-tabs').default;

// Map each actual page to its footer label, accounting for skips or numbering resets
const mapPages = (pages)=>{
	let actualPage = 0;
	let mappedPage = 0; // Number displayed in footer
	const pageMap    = [];

	pages.forEach((page)=>{
		actualPage++;
		const doSkip  = page.querySelector('.skipCounting');
		const doReset = page.querySelector('.resetCounting');

		if(doReset)
			mappedPage = 1;
		if(!doSkip && !doReset)
			mappedPage++;

		pageMap[actualPage] = {
			mappedPage : mappedPage,
			showPage   : !doSkip
		};
	});
	return pageMap;
};

const getMarkdown = (headings, pageMap)=>{
	const levelPad    = ['- ###', '  - ####', '    -', '      -', '        -', '          -'];

	const allMarkdown = [];
	const depthChain  = [0];

	headings.forEach((heading)=>{
		const page       = parseInt(heading.closest('.page').id?.replace(/^p/, ''));
		const mappedPage = pageMap[page].mappedPage;
		const showPage   = pageMap[page].showPage;
		const title      = heading.textContent.trim();
		const ToCExclude = getComputedStyle(heading).getPropertyValue('--TOC');
		const depth      = parseInt(heading.tagName.substring(1));

		if(!title || !showPage || ToCExclude == 'exclude')
			return;

		//If different header depth than last, remove indents until nearest higher-level header, then indent once
		if(depth !== depthChain[depthChain.length -1]) {
			while (depth <= depthChain[depthChain.length - 1]) {
				depthChain.pop();
			}
			depthChain.push(depth);
		}

		const markdown = `${levelPad[depthChain.length - 2]} [{{ ${title}}}{{ ${mappedPage}}}](#p${page})`;
		allMarkdown.push(markdown);
	});
	return allMarkdown.join('\n');
};

const getTOC = ()=>{
	const iframe = document.getElementById('BrewRenderer');
	const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
	const headings = iframeDocument.querySelectorAll('h1, h2, h3, h4, h5, h6');
	const pages    = iframeDocument.querySelectorAll('.page');

	const pageMap = mapPages(pages);
	return getMarkdown(headings, pageMap);
};

module.exports = function(props){
	const TOC = getTOC();

	return dedent`
		{{toc,wide
		# Contents

		${TOC}
		}}
		\n`;
};