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
						if(g3.title !== null) {
							if(g2.title !== null) {
								r.push(`    - [{{ ${g3.title}}}{{ ${g3.page}}}](#p${g3.page})`);
							} else { // Don't over-indent if no level-2 parent entry
								r.push(`  - [{{ ${g3.title}}}{{ ${g3.page}}}](#p${g3.page})`);
							}
						}
						_.each(g3.children, (g4, idx4)=>{
							if(g4.title !== null) {
								if(g3.title !== null) {
									r.push(`      - [{{ ${g4.title}}}{{ ${g4.page}}}](#p${g4.page})`);
								} else { // Don't over-indent if no level-3 parent entry
									r.push(`    - [{{ ${g4.title}}}{{ ${g4.page}}}](#p${g4.page})`);
								}
							}
							_.each(g4.children, (g5, idx5)=>{
								if(g5.title !== null) {
									if(g4.title !== null) {
										r.push(`        - [{{ ${g5.title}}}{{ ${g5.page}}}](#p${g5.page})`);
									} else { // Don't over-indent if no level-4 parent entry
										r.push(`      - [{{ ${g5.title}}}{{ ${g5.page}}}](#p${g5.page})`);
									}
								}
								_.each(g5.children, (g6, idx6)=>{
									if(g6.title !== null) {
										if(g5.title !== null) {
											r.push(`        - [{{ ${g6.title}}}{{ ${g6.page}}}](#p${g6.page})`);
										} else { // Don't over-indent if no level-5 parent entry
											r.push(`      - [{{ ${g6.title}}}{{ ${g6.page}}}](#p${g6.page})`);
										}
									}
								});
							});
						});
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
