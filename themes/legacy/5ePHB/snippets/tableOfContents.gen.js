const _ = require('lodash');

const getTOC = (pages)=>{
	const add1 = (title, page)=>{
		res.push({
			title    : title,
			page     : page + 1,
			children : []
		});
	};
	const add2 = (title, page)=>{
		if(!_.last(res)) add1('', page);
		_.last(res).children.push({
			title    : title,
			page     : page + 1,
			children : []
		});
	};
	const add3 = (title, page)=>{
		if(!_.last(res)) add1('', page);
		if(!_.last(_.last(res).children)) add2('', page);
		_.last(_.last(res).children).children.push({
			title    : title,
			page     : page + 1,
			children : []
		});
	};

	const res = [];
	_.each(pages, (page, pageNum)=>{
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
	});
	return res;
};

module.exports = function(props){
	const pages = props.brew.text.split('\\page');
	const TOC = getTOC(pages);
	const markdown = _.reduce(TOC, (r, g1, idx1)=>{
		r.push(`- **[${idx1 + 1} ${g1.title}](#p${g1.page})**`);
		if(g1.children.length){
			_.each(g1.children, (g2, idx2)=>{
				r.push(`  - [${idx1 + 1}.${idx2 + 1} ${g2.title}](#p${g2.page})`);
				if(g2.children.length){
					_.each(g2.children, (g3, idx3)=>{
						r.push(`    - [${idx1 + 1}.${idx2 + 1}.${idx3 + 1} ${g3.title}](#p${g3.page})`);
					});
				}
			});
		}
		return r;
	}, []).join('\n');

	return `<div class='toc'>
##### Table Of Contents
${markdown}
</div>\n`;
};