const _ = require('lodash');
const Store = require('homebrewery/brew.store.js');

const getTOC = (text) => {
	const pages = text.split('\\page');
	const add1 = (title, page)=>{
		res.push({
			title : title,
			page : page + 1,
			children : []
		});
	}
	const add2 = (title, page)=>{
		if(!_.last(res)) add1('', page);
		_.last(res).children.push({
			title : title,
			page : page + 1,
			children : []
		});
	}
	const add3 = (title, page)=>{
		if(!_.last(res)) add1('', page);
		if(!_.last(_.last(res).children)) add2('', page);
		_.last(_.last(res).children).children.push({
			title : title,
			page : page + 1,
			children : []
		});
	}

	let res = [];
	_.each(pages, (page, pageNum)=>{
		const lines = page.split('\n');
		_.each(lines, (line) => {
			if(_.startsWith(line, '# ')){
				const title = line.replace('# ', '');
				add1(title, pageNum)
			}
			if(_.startsWith(line, '## ')){
				const title = line.replace('## ', '');
				add2(title, pageNum);
			}
			if(_.startsWith(line, '### ')){
				const title = line.replace('### ', '');
				add3(title, pageNum);
			}
		})
	});
	return res;
}


module.exports = {
	//TODO: TOC not perfect yet

	toc : (text)=>{
		text = text || Store.getBrewCode();

		console.log(getTOC(text));

		const TOC = getTOC(text)

		const markdown = _.reduce(TOC, (r, g1, idx1)=>{
			r.push(`- ### [**${g1.page}** *${g1.title}*](#p${g1.page})`)
			if(g1.children.length){
				_.each(g1.children, (g2, idx2) => {
					r.push(`  - #### [**${g2.page}** *${g2.title}*](#p${g2.page})`)
					if(g2.children.length){
						_.each(g2.children, (g3, idx3) => {
							r.push(`    - [**${g3.page}** *${g3.title}*](#p${g3.page})`)
						});
					}
				});
			}
			return r;
		}, []).join('\n');



		return `{{toc
# Contents

${markdown}

}}`;
/*

- ### [**4** *Preface*](#p3)
- ### [**5** *Introduction*](#p3)
  - [**5** *Worlds of Adventure*](#p5)
  - [**6** *Using This Book*](#p5)
  - [**6** *How to Play*](#p5)
  - [**7** *Adventures*](#p5)

- ### [**5** *Introduction*](#p3)
  - #### [**5** *Worlds of Adventure*](#p5)
    - [**6** *Using This Book*](#p5)
    - [**6** *How to Play*](#p5)
  - #### [**7** *Adventures*](#p5)







}}


`;*/
	}
}