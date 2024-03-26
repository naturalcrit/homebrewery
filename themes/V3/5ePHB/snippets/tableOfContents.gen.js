const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const getTOC = ()=>{
	const add1 = (title, page)=>{
		res.push({
			title    : title,
			page     : page,
			children : []
		});
	};
	const add2 = (title, page)=>{
		if(!_.last(res)) add1(null, page);
		_.last(res).children.push({
			title    : title,
			page     : page,
			children : []
		});
	};
	const add3 = (title, page)=>{
		if(!_.last(res)) add1(null, page);
		if(!_.last(_.last(res).children)) add2(null, page);
		_.last(_.last(res).children).children.push({
			title    : title,
			page     : page,
			children : []
		});
	};
	const add4 = (title, page)=>{
		if(!_.last(res)) add1(null, page);
		if(!_.last(_.last(res).children)) add2(null, page);
		if(!_.last(!_.last(_.last(res).children))) add3(null, page);
		_.last(_.last(_.last(res).children).children).children.push({
			title    : title,
			page     : page,
			children : []
		});
	};
	const add5 = (title, page)=>{
		if(!_.last(res)) add1(null, page);
		if(!_.last(_.last(res).children)) add2(null, page);
		if(!_.last(!_.last(_.last(res).children))) add3(null, page);
		if(!_.last(!_.last(!_.last(_.last(res).children)))) add4(null, page);
		_.last(_.last(_.last(_.last(res).children).children).children).children.push({
			title    : title,
			page     : page,
			children : []
		});
	};
	const add6 = (title, page)=>{
		if(!_.last(res)) add1(null, page);
		if(!_.last(_.last(res).children)) add2(null, page);
		if(!_.last(!_.last(_.last(res).children))) add3(null, page);
		if(!_.last(!_.last(!_.last(_.last(res).children)))) add4(null, page);
		if(!_.last(!_.last(!_.last(!_.last(_.last(res).children))))) add5(null, page);
		_.last(_.last(_.last(_.last(_.last(res).children).children).children).children).children.push({
			title    : title,
			page     : page,
			children : []
		});
	};

	const res = [];
	const iframe = document.getElementById('BrewRenderer');
	const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
	const headings = iframeDocument.querySelectorAll('h1, h2, h3, h4, h5, h6');

	_.each(headings, (heading)=>{
		const onPage = parseInt(heading.closest('.page,.phb').id?.replace(/^p/, ''));
		const ToCExclude = getComputedStyle(heading).getPropertyValue('--TOC');
		if(ToCExclude != 'exclude') {
			if(!isNaN(onPage)) {
				const headingText =  heading.innerText.trim();
				if(heading.tagName == 'H1') {
					add1(headingText, onPage);
				}
				if(heading.tagName == 'H2') {
					add2(headingText, onPage);
				}
				if(heading.tagName == 'H3') {
					add3(headingText, onPage);
				}
				if(heading.tagName == 'H4') {
					add4(headingText, onPage);
				}
				if(heading.tagName == 'H5') {
					add5(headingText, onPage);
				}
				if(heading.tagName == 'H6') {
					add6(headingText, onPage);
				}
			}
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
	const TOC = getTOC();
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
