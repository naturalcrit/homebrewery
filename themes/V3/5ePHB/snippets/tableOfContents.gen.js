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

	const add4 = (title, page)=>{
		if(!_.last(res)) add1(null, page);
		if(!_.last(_.last(res).children)) add2(null, page);
		if(!_.last(_.last(_.last(res).children))) add3(null, page);
		_.last(_.last(_.last(res).children).children).children.push({
			title    : title,
			page     : page + 1,
			children : []
		});
	};

	const add5 = (title, page)=>{
		if(!_.last(res)) add1(null, page);
		if(!_.last(_.last(res).children)) add2(null, page);
		if(!_.last(_.last(_.last(res).children))) add3(null, page);
		if(!_.last(_.last(_.last(_.last(res).children)))) add4(null, page);
		_.last(_.last(_.last(_.last(res).children).children).children).children.push({
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
				if(_.startsWith(line, '#### ')){
					const title = line.replace('#### ', '');
					add4(title, pageNum);
				}
				if(_.startsWith(line, '##### ')){
					const title = line.replace('##### ', '');
					add5(title, pageNum);
				}
			});
		}
	});
	return res;
};

const ToCIterate = (entries, maxDepth, curDepth=1)=>{
	const levelPad = ['- #', '- ###', '- ####', '  -', '    -', '      -'];
	const toc = [];
	if(entries.title !== null){
		toc.push(`${levelPad[curDepth]} [{{ ${entries.title}}}{{ ${entries.page}}}](#p${entries.page})`);
	}
	if(entries.children.length) {
		if(curDepth < maxDepth) {
			_.each(entries.children, (entry, idx)=>{
				const children = ToCIterate(entry, maxDepth, curDepth+1);
				if(children.length) {
					toc.push(...children);
				}
			});
		}
	}
	return toc;
};

const tableOfContents = (props, maxDepth)=>{
	const pages = props.brew.text.split('\\page');
	const TOC = getTOC(pages);
	const markdown = _.reduce(TOC, (r, g1, idx1)=>{
		r.push(ToCIterate(g1, maxDepth).join('\n'));
		return r;
	}, []).join('\n');

	return dedent`
		{{toc,wide
		# Table Of Contents

		${markdown}
		}}
		\n`;
};


module.exports = {
	tableOfContentsGen3 : (props)=>{
		return tableOfContents(props, 3);
	},
	tableOfContentsGen4 : (props)=>{
		return tableOfContents(props, 4);
	},
	tableOfContentsGen5 : (props)=>{
		return tableOfContents(props, 5);
	}
};
