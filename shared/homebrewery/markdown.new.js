const _ = require('lodash');
const Markdown = require('marked');



/*
//Processes the markdown within an HTML block if it's just a class-wrapper
renderer.html = function (html) {
	console.log(html);
	if(_.startsWith(_.trim(html), '<div') && _.endsWith(_.trim(html), '</div>')){
		var openTag = html.substring(0, html.indexOf('>')+1);
		html = html.substring(html.indexOf('>')+1);
		html = html.substring(0, html.lastIndexOf('</div>'));
		return `${openTag} ${Markdown(html)} </div>`;
	}
	return html;
};
*/




module.exports = {
	marked : Markdown,
	render : (rawBrewText)=>{
		//Adds in the new div block syntax
		let count = 0;
		let blockReg = /{{[\w|,]+|}}/g;
		const renderer = new Markdown.Renderer();
		renderer.paragraph = function (text) {
			const matches = text.match(blockReg);
			if(!matches) return `<p>${text}</p>\n`;
			let matchIndex = 0;
			const res =  _.reduce(text.split(blockReg), (r, text) => {
				if(text) r.push(`<p>${text}</p>\n`);
				const block = matches[matchIndex];
				if(block && _.startsWith(block, '{{')){
					r.push(`<div class="${block.substring(2).split(',').join(' ')}">`);
					count++;
				}
				if(block == '}}' && count !== 0){
					r.push('</div>');
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
		/*
		var errors = [];
		var leftovers = _.reduce(rawBrewText.split('\n'), (acc, line, _lineNumber) => {
			var lineNumber = _lineNumber + 1;
			var matches = line.match(tagRegex);
			if(!matches || !matches.length) return acc;

			_.each(matches, (match)=>{
				_.each(tagTypes, (type)=>{
					if(match == `<${type}`){
						acc.push({
							type : type,
							line : lineNumber
						});
					}
					if(match === `</${type}>`){
						if(!acc.length){
							errors.push({
								line : lineNumber,
								type : type,
								text : 'Unmatched closing tag',
								id : 'CLOSE'
							});
						}else if(_.last(acc).type == type){
							acc.pop();
						}else{
							errors.push({
								line : _.last(acc).line + ' to ' + lineNumber,
								type : type,
								text : 'Type mismatch on closing tag',
								id : 'MISMATCH'
							});
							acc.pop();
						}
					}
				});
			});
			return acc;
		}, []);

		_.each(leftovers, (unmatched)=>{
			errors.push({
				line : unmatched.line,
				type : unmatched.type,
				text : "Unmatched opening tag",
				id : 'OPEN'
			})
		});

		return errors;
		*/
	},
};

