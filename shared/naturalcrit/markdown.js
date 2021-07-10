/* eslint-disable max-lines */
const _ = require('lodash');
const Markdown = require('marked');
const renderer = new Markdown.Renderer();

//Processes the markdown within an HTML block if it's just a class-wrapper
renderer.html = function (html) {
	if(_.startsWith(_.trim(html), '<div') && _.endsWith(_.trim(html), '</div>')){
		const openTag = html.substring(0, html.indexOf('>')+1);
		html = html.substring(html.indexOf('>')+1);
		html = html.substring(0, html.lastIndexOf('</div>'));
		return `${openTag} ${Markdown(html)} </div>`;
	}
	return html;
};

// Don't wrap {{ Divs or {{ empty Spans in <p> tags
renderer.paragraph = function(text){
	let match;
	if(text.startsWith('<div') || text.startsWith('</div'))
		return `${text}`;
	else if(match = text.match(/(^|^.*?\n)<span class="inline(.*?<\/span>)$/)) {
		return `${match[1].trim() ? `<p>${match[1]}</p>` : ''}<span class="inline-block${match[2]}`; }
	else
		return `<p>${text}</p>\n`;
};

const mustacheSpans = {
  name: 'mustacheSpans',
  level: 'inline',                                    // Is this a block-level or inline-level tokenizer?
  start(src) { return src.match(/{{[^{]/)?.index; },  // Hint to Marked.js to stop and check for a match
  tokenizer(src, tokens) {
    const completeSpan = /^{{[^\n]*}}/;               // Regex for the complete token
		const inlineRegex = /{{(?:="[\w,\-. ]*"|[^"'{}}\s])*\s*|}}/g;
    const match = completeSpan.exec(src);
    if (match) {
			//Find closing delimiter
			let blockCount = 0;
			let tags = '';
			let endIndex = 0;
			let delim;
			while (delim = inlineRegex.exec(match[0])) {
				if(delim[0].startsWith('{{')) {
					tags = tags || ' ' + processStyleTags(delim[0].substring(2));
					blockCount++;
				}
				else if(delim[0] == '}}' && blockCount !== 0) {
					blockCount--;
					if(blockCount == 0) {
						endIndex = inlineRegex.lastIndex;
						break;
					}
				}
			}

			if(endIndex) {
				const raw = src.slice(0, endIndex);
				const text = raw.slice((raw.indexOf(' ')+1) || -2, -2)

				return {                                        // Token to generate
					type: 'mustacheSpans',                        // Should match "name" above
					raw: raw,                                     // Text to consume from the source
					text: text,                                   // Additional custom properties
					tags: tags,
					tokens: this.inlineTokens(text)    // inlineTokens to process **bold**, *italics*, etc.
				}
			}
    }
  },
  renderer(token) {
		console.log(token);
    return `<span class="inline${token.tags}>${this.parseInline(token.tokens)}</span>`; // parseInline to turn child tokens into HTML
  }
};

Markdown.use({extensions : [mustacheSpans]});

// Mustache-style Divs {{class \n content ... \n}}
let blockCount = 0;
const blockRegex = /^ *{{(?:="[\w,\-. ]*"|[^"'\s])*$|^ *}}$/gm;
const inlineFullRegex = /{{[^\n]*}}/g;
const inlineRegex = /{{(?:="[\w,\-. ]*"|[^"'{}}\s])*\s*|}}/g;

renderer.text = function(text){
	const newText = text.replaceAll('&quot;', '"');
	let matches;

	if(matches = newText.match(blockRegex)) {
		//DIV - BLOCK-LEVEL
		console.log({match: matches});
		console.log({newText: newText});
 		let matchIndex = 0;
 		const res =  _.reduce(newText.split(blockRegex), (r, splitText)=>{
 			if(splitText) r.push(Markdown.parseInline(splitText, { renderer: renderer }));

 			const block = matches[matchIndex] ? matches[matchIndex].trimLeft() : '';
 			if(block && block.startsWith('{')) {
 				const values = processStyleTags(block.substring(2));
 				r.push(`<div class="block ${values}">`);
 				blockCount++;
 			} else if(block == '}}' && blockCount !== 0){
 				r.push('</div>');
 				blockCount--;
 			}

 			matchIndex++;

 			return r;
 		}, []).join('');
 		return res;
 	} else {
		if(!matches) {
			return `${text}`;
		}
	}
};

//Fix local links in the Preview iFrame to link inside the frame
renderer.link = function (href, title, text) {
	let self = false;
	if(href[0] == '#') {
		self = true;
	}
	href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);

	if(href === null) {
		return text;
	}
	let out = `<a href="${escape(href)}"`;
	if(title) {
		out += ` title="${title}"`;
	}
	if(self) {
		out += ' target="_self"';
	}
	out += `>${text}</a>`;
	return out;
};

const nonWordAndColonTest = /[^\w:]/g;
const cleanUrl = function (sanitize, base, href) {
	if(sanitize) {
		let prot;
		try {
			prot = decodeURIComponent(unescape(href))
        .replace(nonWordAndColonTest, '')
        .toLowerCase();
		} catch (e) {
			return null;
		}
		if(prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
			return null;
		}
	}
	try {
		href = encodeURI(href).replace(/%25/g, '%');
	} catch (e) {
		return null;
	}
	return href;
};

const escapeTest = /[&<>"']/;
const escapeReplace = /[&<>"']/g;
const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
const escapeReplacements = {
	'&'  : '&amp;',
	'<'  : '&lt;',
	'>'  : '&gt;',
	'"'  : '&quot;',
	'\'' : '&#39;'
};
const getEscapeReplacement = (ch)=>escapeReplacements[ch];
const escape = function (html, encode) {
	if(encode) {
		if(escapeTest.test(html)) {
			return html.replace(escapeReplace, getEscapeReplacement);
		}
	} else {
		if(escapeTestNoEncode.test(html)) {
			return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
		}
	}
	return html;
};

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

const processStyleTags = (string)=>{
	const tags = string.match(/(?:[^, "=]+|="[^"]*")+/g);

	if(!tags)	return '"';

	const id      = _.remove(tags, (tag)=>tag.startsWith('#')).map((tag)=>tag.slice(1))[0];
	const classes = _.remove(tags, (tag)=>!tag.includes('"'));
	const styles  = tags.map((tag)=>tag.replace(/="(.*)"/g, ':$1;'));
	return `${classes.join(' ')}" ${id ? `id="${id}"` : ''} ${styles.length ? `style="${styles.join(' ')}"` : ''}`;
};

module.exports = {
	marked : Markdown,
	render : (rawBrewText)=>{
		blockCount = 0;
		rawBrewText = rawBrewText.replace(/^\\column$/gm, `<div class='columnSplit'></div>`)
														 .replace(/^(:+)$/gm, (match)=>`${`<div class='blank'></div>`.repeat(match.length)}\n`)
														 .replace(/(?:^|>) *:([^:\n]*):([^\n]*)\n/gm, (match, term, def)=>`<dt>${Markdown.parseInline(term)}</dt><dd>${def}</dd>`)
														 .replace(/(<dt>.*<\/dt><dd>.*<\/dd>\n?)+/gm, `<dl>$1</dl>\n\n`)
		                         .replace(/^}}/gm, '\n}}')
		                         .replace(/^({{[^\n]*)$/gm, '$1\n');
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
