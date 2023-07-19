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
		if(!page.includes("{{frontCover}}") && !page.includes("{{insideCover}}") && !page.includes("{{partCover}}") && !page.includes("{{backCover}}")) {
			const lines = page.split('\n');
			_.each(lines, (line)=>{
				if(_.startsWith(line, '# ')){
					const title = line.replace('# ', '');
					add1(title, pageNum);
				}
				if(_.startsWith(line, '## ')){
					const title = line.replace('## ', '');
					add2(title, pageNum);
				}
				if(_.startsWith(line, '### ')){
					const title = line.replace('### ', '');
					add3(title, pageNum);
				}
			});
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
