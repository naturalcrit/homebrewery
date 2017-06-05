const _ = require('lodash');
//const Markdown = require('marked');
const Markdown = require('./marked.lib.js');


const renderer = new Markdown.Renderer();
let blockCount = 0;
renderer.paragraph = function(text){
	const blockReg = /{{[\w|,]+|}}/g;
	const matches = text.match(blockReg);
	if(!matches) return `\n<p>${text}</p>\n`;
	let matchIndex = 0;
	const res =  _.reduce(text.split(blockReg), (r, text) => {
		//if(text) r.push(text);
		if(text) r.push(Markdown(text, {renderer : renderer, sanitize: true}));

		const block = matches[matchIndex];
		if(block && block[0] == '{'){
			r.push(`\n\n<div class="block ${block.substring(2).split(',').join(' ')}">`);
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
renderer.image = function(href, title, text){
	return `<img src="${href}" class="${text.split(',').join(' ')}"></img>`;
};
renderer.list = function(list, isOrdered, isDef){
	if(isDef) return `<ul class='alt'>${list}</ul>`;
	if(isOrdered) return `<ol>${list}</ol>`;
	return `<ul>${list}</ul>`;
}


module.exports = {
	marked : Markdown,
	render : (rawBrewText)=>{
		blockCount = 0;

		rawBrewText = rawBrewText.replace(/\\column/g, '{{columnSplit }}');


		let html = Markdown(rawBrewText,{renderer : renderer, sanitize: true});


		//Close all hanging block tags
		html += _.times(blockCount, ()=>{return '</div>'}).join('\n');
		return html;
	},

	validate : (rawBrewText) => {
		return [];
	},
};

