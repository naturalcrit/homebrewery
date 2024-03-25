const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const getTOC = (pages)=>{

	const recursiveAdd = (title, page, targetDepth, curDepth=0)=>{
		if(curDepth == targetDepth) {
			res.push({
				title    : title,
				page     : page + 1,
				children : []
			});
		} else {
			if(!_last(res)) recursiveAdd(null, page);
			recursiveAdd(title, page, targetDepth, curDepth+1);
		}
	};

	const res = [];

	_.each(pages, (page, pageNum)=>{
		if(!page.includes("{{frontCover}}") && !page.includes("{{insideCover}}") && !page.includes("{{partCover}}") && !page.includes("{{backCover}}")) {
			const lines = page.split('\n');
			_.each(lines, (line)=>{
				if(_.startsWith(line, '# ')){
					const title = line.replace('# ', '');
					recursiveAdd(title, pageNum, 0);
				}
				if(_.startsWith(line, '## ')){
					const title = line.replace('## ', '');
					recursiveAdd(title, pageNum, 1);
				}
				if(_.startsWith(line, '### ')){
					const title = line.replace('### ', '');
					recursiveAdd(title, pageNum, 2);
				}
				if(_.startsWith(line, '#### ')){
					const title = line.replace('#### ', '');
					recursiveAdd(title, pageNum, 3);
				}
				if(_.startsWith(line, '##### ')){
					const title = line.replace('##### ', '');
					recursiveAdd(title, pageNum, 4);
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
