const _ = require('lodash');
const Markdown = require('marked');
const renderer = new Markdown.Renderer();

//Processes the markdown within an HTML block if it's just a class-wrapper
renderer.html = function (html) {
	if(_.startsWith(_.trim(html), '<div')){
		let openTag = html.substring(0, html.indexOf('>')+1);
		let closeTag = '';
		html = html.substring(html.indexOf('>')+1);
		if(_.endsWith(_.trim(html), '</div>')){
			closeTag = '</div>';
			html = html.substring(0,html.lastIndexOf('</div'));
		}
		return `${openTag} ${Markdown(html)} ${closeTag}`;
	}

// Below may work better if we just explicitly allow <script, <pre and <style
// tags to return directly
	/*if(_.startsWith(_.trim(html), '<script')){
		return html;
	}*/

// Allow raw HTML tags to end without a blank line if markdown is right after
	if(html.includes('\n')){
		let openTag = html.substring(0, html.indexOf('>')+1);
		if(!_.endsWith(_.trim(html), '>')){	// If there is no closing tag, parse markdown directly after
			let remainder = html.substring(html.indexOf('>')+1);
			return `${openTag} ${Markdown(remainder)}`;
		}
	}

	/*if(html.includes('\n')){
		//let openTag = html.substring(0, html.indexOf('\n'));
		let openTag = html.substring(0, html.indexOf('>')+1);
		console.log("FULL HTML");
		console.log(html);
		console.log("OPEN TAG");
		console.log(openTag);

		let closeTag = '';
		if(_.endsWith(_.trim(html), '>')){
			closeTag = html.substring(html.lastIndexOf('<'));
			console.log("CLOSETAG");
			console.log(closeTag);
		}
		else {
			let remainder = html.substring(html.indexOf('>')+1);
			console.log("REMAINDER");
			console.log(remainder);
			return `${openTag} ${Markdown(remainder)}`;
		}
	}*/

	return html;
};

/*renderer.code = function (code, infostring, escaped) {
	if(code == ''){
		return '<pre><code>\n</code></pre>';
	}
	return code;
}*/

const sanatizeScriptTags = (content)=>{
	return content
		.replace(/<script/ig, '&lt;script')
		.replace(/<\/script>/ig, '&lt;/script&gt;');
};

const tagTypes = ['div', 'span', 'a'];
const tagRegex = new RegExp(`(${
	_.map(tagTypes, (type)=>{
		return `\\<${type}|\\</${type}>`;
	}).join('|')})`, 'g');


module.exports = {
	marked : Markdown,
	render : (rawBrewText)=>{
		return Markdown(
			sanatizeScriptTags(rawBrewText),
			{ renderer: renderer }
		);
	},

	validate : (rawBrewText)=>{
		const errors = [];
		const leftovers = _.reduce(rawBrewText.split('\n'), (acc, line, _lineNumber)=>{
			const lineNumber = _lineNumber + 1;
			const matches = line.match(tagRegex);
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
								id   : 'CLOSE'
							});
						} else if(_.last(acc).type == type){
							acc.pop();
						} else {
							errors.push({
								line : `${_.last(acc).line} to ${lineNumber}`,
								type : type,
								text : 'Type mismatch on closing tag',
								id   : 'MISMATCH'
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
				text : 'Unmatched opening tag',
				id   : 'OPEN'
			});
		});

		return errors;
	},
};
