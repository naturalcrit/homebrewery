const _ = require('lodash');
const Markdown = require('marked');


module.exports = {
	marked : Markdown,
	render : (rawBrewText)=>{
		//Adds in the new div block syntax
		let count = 0;
		let blockReg = /{{[\w|,]+|}}/g;
		const renderer = new Markdown.Renderer();
		renderer.paragraph = function (text) {
			const matches = text.match(blockReg);
			if(!matches) return `\n<p>${text}</p>\n`;
			let matchIndex = 0;
			const res =  _.reduce(text.split(blockReg), (r, text) => {
				if(text) r.push(`\n<p>${text}</p>\n`);
				const block = matches[matchIndex];
				if(block && _.startsWith(block, '{{')){
					r.push(`\n\n<div class="${block.substring(2).split(',').join(' ')}">`);
					count++;
				}
				if(block == '}}' && count !== 0){
					r.push('</div>\n\n');
					count--;
				}
				matchIndex++;
				return r;
			}, []).join('\n');
			return res;
		};
		let html = Markdown(rawBrewText, {renderer : renderer, sanitize: true});
		html += _.times(count, ()=>{return '</div>'}).join('\n');
		return html;
	},

	validate : (rawBrewText) => {
		return [];

	},
};

