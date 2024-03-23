const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const getTOC = ()=>{
	const add1 = (title, page)=>{
		res.push({
			title    : title,
			page     : page + 1,
			children : []
		});
	};
	const add2 = (title, page)=>{
		if(!_.last(res)) add1(null, page);
		_.last(res).children.push({
			title    : title,
			page     : page + 1,
			children : []
		});
	};
	const add3 = (title, page)=>{
		if(!_.last(res)) add1(null, page);
		if(!_.last(_.last(res).children)) add2(null, page);
		_.last(_.last(res).children).children.push({
			title    : title,
			page     : page + 1,
			children : []
		});
	};

	const res = [];
	const iframe = document.getElementById('BrewRenderer');
	const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
	const headings = iframeDocument.querySelectorAll('h1, h2, h3');

	_.each(headings, (heading)=>{
		const onPage = parseInt(heading.closest('.page,.phb').id?.replace(/^p/, ''));
		const ToCExclude = getComputedStyle(heading).getPropertyValue('--TOC');
		if(ToCExclude != '"exclude"') {
			if(!isNaN(onPage)) {
				const headingText =  heading.innerText;
				if(heading.tagName == 'H1') {
					add1(headingText, onPage);
				}
				if(heading.tagName == 'H2') {
					add2(headingText, onPage);
				}
				if(heading.tagName == 'H3') {
					add3(headingText, onPage);
				}
			}
		}
	});
	return res;
};

module.exports = function(props){
	const TOC = getTOC();
	const markdown = _.reduce(TOC, (r, g1, idx1)=>{
		if(g1.title !== null) {
			r.push(`- ### [{{ ${g1.title}}}{{ ${g1.page}}}](#p${g1.page})`);
		}
		if(g1.children.length){
			_.each(g1.children, (g2, idx2)=>{
				if(g2.title !== null) {
					r.push(`  - #### [{{ ${g2.title}}}{{ ${g2.page}}}](#p${g2.page})`);
				}
				if(g2.children.length){
					_.each(g2.children, (g3, idx3)=>{
						if(g2.title !== null) {
							r.push(`    - [{{ ${g3.title}}}{{ ${g3.page}}}](#p${g3.page})`);
						} else { // Don't over-indent if no level-2 parent entry
							r.push(`  - [{{ ${g3.title}}}{{ ${g3.page}}}](#p${g3.page})`);
						}
					});
				}
			});
		}
		return r;
	}, []).join('\n');

	return dedent`
		{{toc,wide
		# Contents

		${markdown}
		}}
		\n`;
};
