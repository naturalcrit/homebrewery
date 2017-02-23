const _ = require('lodash');
const Markdown = require('marked');


const renderer = new Markdown.Renderer();
let blockCount = 0;
renderer.paragraph = function(text){
	const blockReg = /{{[\w|,]+|}}/g;
	const matches = text.match(blockReg);
	if(!matches) return `\n<p>${text}</p>\n`;
	let matchIndex = 0;
	const res =  _.reduce(text.split(blockReg), (r, text) => {
		if(text) r.push(Markdown(text, {renderer : renderer, sanitize: true}));
		const block = matches[matchIndex];
		if(block && _.startsWith(block, '{{')){
			r.push(`\n\n<div class="${block.substring(2).split(',').join(' ')}">`);
			blockCount++;
		}
		if(block == '}}' && blockCount !== 0){
			r.push('</div>\n\n');
			blockCount--;
		}
		matchIndex++;
		return r;
	}, []).join('\n');
	return res;
};


module.exports = {
	marked : Markdown,
	render : (rawBrewText)=>{
		blockCount = 0;
		let html = Markdown(rawBrewText, {renderer : renderer, sanitize: true});
		//Close all hanging block tags
		html += _.times(blockCount, ()=>{return '</div>'}).join('\n');
		return html;
	},

	validate : (rawBrewText) => {
		return [];
	},
};

