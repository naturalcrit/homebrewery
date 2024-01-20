const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const getTOC = (pages)=>{
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
	_.each(pages, (page, pageNum)=>{
		function inStash(page, lookFor, staches) {
			for (let stache=0; stache< staches.length; stache+=2) {
				const at = page.indexOf(lookFor);
				if((at >= staches[stache].index) && (at <= staches[stache+1].index)) {
					return staches[stache][1].split(',');
				}
			}
			return [];
		}
		const completeBlock = /^ *{{(?=((?:[:=](?:"['\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"=':{}\s]*)*))\1 *$|^ *}}$/gm;
		const sellecks = [...page.matchAll(completeBlock)];
		if(!page.includes("{{frontCover}}") && !page.includes("{{insideCover}}") && !page.includes("{{partCover}}") && !page.includes("{{backCover}}")) {
			const lines = page.split('\n');
			for (let ln=0; ln<lines.length;ln++) {
				if(lines[ln].indexOf('#') < 0) {
					continue;
				}
				const comb = [lines[ln-1], lines[ln], ln+1<lines.length ? lines[ln+1] : ''].join('\n');
				const whiskers = inStash(page, comb, sellecks);
				if(!whiskers?.includes('!toc')){
					if(_.startsWith(lines[ln], '# ')){
						if(!whiskers?.includes('!h1')) {
							const title = lines[ln].replace('# ', '');
							add1(title, pageNum);
						}
					}
					if(_.startsWith(lines[ln], '## ')){
						if(!whiskers?.includes('!h2')) {
							const title = lines[ln].replace('## ', '');
							add2(title, pageNum);
						}
					}
					if(_.startsWith(lines[ln], '### ')){
						if(!whiskers.includes('!h3')) {
							const title = lines[ln].replace('### ', '');
							add3(title, pageNum);
						}
					}
				}
			};
		}
	});
	return res;
};

module.exports = function(props){
	const pages = props.brew.text.split('\\page');
	const TOC = getTOC(pages);
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
		# Table Of Contents

		${markdown}
		}}
		\n`;
};
