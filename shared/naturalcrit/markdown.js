var _ = require('lodash');
var Markdown = require('marked');
var renderer = new Markdown.Renderer();

//Processes the markdown within an HTML block if it's just a class-wrapper
renderer.html = function (html) {
	if(_.startsWith(_.trim(html), '<div') && _.endsWith(_.trim(html), '</div>')){
		var openTag = html.substring(0, html.indexOf('>')+1);
		html = html.substring(html.indexOf('>')+1);
		html = html.substring(0, html.lastIndexOf('</div>'));
		return `${openTag} ${Markdown(html)} </div>`;
	}
	return html;
};


const tagTypes = ['div', 'span', 'a'];
const tagRegex = new RegExp('(' +
	_.map(tagTypes, (type)=>{
		return `\\<${type}|\\</${type}>`;
	}).join('|') + ')', 'g');


module.exports = {
	marked : Markdown,
	render : (rawBrewText)=>{
		return Markdown(rawBrewText, {renderer : renderer})
	},

	validate : (rawBrewText) => {
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
								err  : 'Unmatched closing tag'
							});
						}else if(_.last(acc).type == type){
							acc.pop();
						}else{
							errors.push({
								line : _.last(acc).line + ' to ' + lineNumber,
								type : type,
								err  : 'Type mismatch on closing tag'
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
				err  : "Unmatched opening tag"
			})
		});

		return errors;
	},
};

