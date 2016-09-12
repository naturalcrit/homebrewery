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
		var currentLine = 0;
		var errors = [];
		var tokens = Markdown.lexer(rawText);

		_.each(tokens, (token)=>{
			if(token.type === 'paragraph' || token.type === 'html'){

				var hasOpen = token.text.indexOf('<div') !== -1;
				var hasClose = token.text.indexOf('</div>') !== -1;

				if(hasClose && token.text.length > 6){
					errors.push({
						err : ' Closing tags must be on their own line',
						token : token,
						line : currentLine
					});
				}
				else if(hasOpen && !hasClose){
					errors.push({
						err : ' No closing tag',
						token : token,
						line : currentLine
					});
				}
				else if(hasClose && !hasOpen){
					errors.push({
						err : ' No opening tag',
						token : token,
						line : currentLine
					});
				}


				/*


				if(_.startsWith(token.text, '<div')){
					errors.push({
						err : ' No closing tag',
						token : token,
						line : currentLine
					});
				}else if(_.startsWith(token.text, '</div>')){
					//Do a check to make sure it's on it's own line

					errors.push({
						err : ' No opening tag',
						token : token,
						line : currentLine
					})
				}
				*/
			}
			//console.log(token);
		});

		return errors;
	},
	marked : Markdown
};


/* Test Cases







*/