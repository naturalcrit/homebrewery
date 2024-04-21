const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const getTOC = (pages)=>{

	const recursiveAdd = (title, page, targetDepth, child, curDepth=0)=>{
		console.log(curDepth);
		if(curDepth > 5) return; // Something went wrong.
		if(curDepth == targetDepth) {
			child.push({
				title    : title,
				page     : page + 1,
				children : []
			});
		} else {
			console.log(typeof child);
			child.push({
				title    : null,
				page     : page + 1,
				children : []
			});
			console.log(_.last(child));
			console.log(_.last(child).children);
			recursiveAdd(title, page, targetDepth, _.last(child).children, curDepth+1,);
		}
	};

	const res = [];

	_.each(pages, (page, pageNum)=>{
		if(!page.includes("{{frontCover}}") && !page.includes("{{insideCover}}") && !page.includes("{{partCover}}") && !page.includes("{{backCover}}")) {
			const lines = page.split('\n');
			_.each(lines, (line)=>{
				if(_.startsWith(line, '# ')){
					const title = line.replace('# ', '');
					recursiveAdd(title, pageNum, 0, res);
				}
				if(_.startsWith(line, '## ')){
					const title = line.replace('## ', '');
					recursiveAdd(title, pageNum, 1, res);
				}
				if(_.startsWith(line, '### ')){
					const title = line.replace('### ', '');
					recursiveAdd(title, pageNum, 2, res);
				}
				if(_.startsWith(line, '#### ')){
					const title = line.replace('#### ', '');
					recursiveAdd(title, pageNum, 3, res);
				}
				if(_.startsWith(line, '##### ')){
					const title = line.replace('##### ', '');
					recursiveAdd(title, pageNum, 4, res);
				}
				if(_.startsWith(line, '##### ')){
					const title = line.replace('##### ', '');
					recursiveAdd(title, pageNum, 5, res);
				}
			});
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
