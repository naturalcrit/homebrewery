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

module.exports = {
	render : (rawText)=>{
		return Markdown(rawText, {renderer : renderer})
	},
	validate : (rawText)=>{
		var errors = [];
		var tokens = Markdown.lexer(rawText);

		_.each(tokens, (token)=>{
			if(token.type === 'paragraph'){
				if(_.startsWith(token.text, '<div')){
					errors.push({
						err : ' No closing tag',
						token : token
					});
				}else if(_.startsWith(token.text, '</div>')){
					errors.push({
						err : ' No opening tag',
						token : token
					})
				}
			}
		});

		return errors;
	},
	marked : Markdown
};
