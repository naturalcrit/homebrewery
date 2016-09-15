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

	validate : (rawText) => {

		var res = xmllint.validateXML({
			xml: rawText,
			schema: "String"
		});

		console.log(res);


	},


	validate2 : (rawText)=>{
		var currentLine = 0;
		var errors = [];
		var tokens = Markdown.lexer(rawText, {renderer : renderer});

		return _.filter(_.map(tokens, (token)=>{
			if(token.type === 'paragraph' || token.type === 'html'){

				var hasOpen = token.text.indexOf('<div') !== -1;
				var hasClose = token.text.indexOf('</div>') !== -1;


				if(hasOpen && !hasClose){
					return {
						err : 'No closing tag',
						token : token,
						line : currentLine
					};
				}
				if(hasClose && !hasOpen){
					if(token.text.length > 6){
						return {
							err : 'Closing tags must be on their own line',
							token : token,
							line : currentLine
						};
					}
					return {
						err : 'No opening tag',
						token : token,
						line : currentLine
					};
				}

			}
			//console.log(token);

			//currentLine += token.text.split('\n').length + 1;

		}));

		return errors;
	},
	marked : Markdown
};


/* Test Cases







*/