const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const getTOC = (pages)=>{

	const recursiveAdd = (title, page, targetDepth, child, curDepth=0)=>{
		if(curDepth > 5) return; // Something went wrong.
		if(curDepth == targetDepth) {
			child.push({
				title    : title,
				page     : page + 1,
				children : []
			});
		} else {
			child.push({
				title    : null,
				page     : page + 1,
				children : []
			});
			recursiveAdd(title, page, targetDepth, _.last(child).children, curDepth+1,);
		}
	};

	const res = [];

	const iframe = document.getElementById('BrewRenderer');
	const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
	const headings = iframeDocument.querySelectorAll('h1, h2, h3, h4, h5, h6');
	const headerDepth = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

	_.each(headings, (heading)=>{
		const onPage = parseInt(heading.closest('.page,.phb').id?.replace(/^p/, ''));
		const ToCExclude = getComputedStyle(heading).getPropertyValue('--TOC');

		if(ToCExclude != 'exclude') {
			recursiveAdd(heading.innerText.trim(), onPage, headerDepth.indexOf(heading.tagName), res);
		}
	});
	return res;
};


const ToCIterate = (entries, curDepth=0)=>{
	const levelPad = ['- ###', '  - ####', '    - ####', '      - ####', '        - ####', '          - ####'];
	const toc = [];
	if(entries.title !== null){
		toc.push(`${levelPad[curDepth]} [{{ ${entries.title}}}{{ ${entries.page}}}](#p${entries.page})`);
	}
	if(entries.children.length) {
		_.each(entries.children, (entry, idx)=>{
			const children = ToCIterate(entry, curDepth+1);
			if(children.length) {
				toc.push(...children);
			}
		});
	}
	return toc;
};

module.exports = function(props){
	const pages = props.brew.text.split('\\page');
	const TOC = getTOC(pages);
	const markdown = _.reduce(TOC, (r, g1, idx1)=>{
		r.push(ToCIterate(g1).join('\n'));
		return r;
	}, []).join('\n');

	return dedent`
		{{toc,wide
		# Contents

		${markdown}
		}}
		\n`;
};
