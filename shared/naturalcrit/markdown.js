/* eslint-disable max-lines */
const _ = require('lodash');
const Marked = require('marked');
const MarkedExtendedTables = require('marked-extended-tables');
const { markedSmartypantsLite: MarkedSmartypantsLite } = require('marked-smartypants-lite');
const { gfmHeadingId: MarkedGFMHeadingId } = require('marked-gfm-heading-id');
const renderer = new Marked.Renderer();
const tokenizer = new Marked.Tokenizer();

//Processes the markdown within an HTML block if it's just a class-wrapper
renderer.html = function (html) {
	if(_.startsWith(_.trim(html), '<div') && _.endsWith(_.trim(html), '</div>')){
		const openTag = html.substring(0, html.indexOf('>')+1);
		html = html.substring(html.indexOf('>')+1);
		html = html.substring(0, html.lastIndexOf('</div>'));
		return `${openTag} ${Marked.parse(html)} </div>`;
	}
	return html;
};

// Don't wrap {{ Divs or {{ empty Spans in <p> tags
renderer.paragraph = function(text){
	let match;
	if(text.startsWith('<div') || text.startsWith('</div'))
		return `${text}`;
	else if(match = text.match(/(^|^.*?\n)<span class="inline-block(.*?<\/span>)$/)) {
		return `${match[1].trim() ? `<p>${match[1]}</p>` : ''}<span class="inline-block${match[2]}`;
	} else
		return `<p>${text}</p>\n`;
};

//TODO: may not be needed
// Disable default reflink definitions
tokenizer.def = function(){
};

const mustacheSpans = {
	name  : 'mustacheSpans',
	level : 'inline',                                   // Is this a block-level or inline-level tokenizer?
	start(src) { return src.match(/{{[^{]/)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		const completeSpan = /^{{[^\n]*}}/;               // Regex for the complete token
		const inlineRegex = /{{(?=((?:[:=](?:"['\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"=':{}\s]*)*))\1 *|}}/g;
		const match = completeSpan.exec(src);
		if(match) {
			//Find closing delimiter
			let blockCount = 0;
			let tags = '';
			let endTags = 0;
			let endToken = 0;
			let delim;
			while (delim = inlineRegex.exec(match[0])) {
				if(!tags) {
					tags = `${processStyleTags(delim[0].substring(2))}`;
					endTags = delim[0].length;
				}
				if(delim[0].startsWith('{{')) {
					blockCount++;
				} else if(delim[0] == '}}' && blockCount !== 0) {
					blockCount--;
					if(blockCount == 0) {
						endToken = inlineRegex.lastIndex;
						break;
					}
				}
			}

			if(endToken) {
				const raw = src.slice(0, endToken);
				const text = raw.slice(endTags || -2, -2);

				return {                              // Token to generate
					type   : 'mustacheSpans',           // Should match "name" above
					raw    : raw,                       // Text to consume from the source
					text   : text,                      // Additional custom properties
					tags   : tags,
					tokens : this.lexer.inlineTokens(text)    // inlineTokens to process **bold**, *italics*, etc.
				};
			}
		}
	},
	renderer(token) {
		return `<span class="inline-block${token.tags}>${this.parser.parseInline(token.tokens)}</span>`; // parseInline to turn child tokens into HTML
	}
};

const mustacheDivs = {
	name  : 'mustacheDivs',
	level : 'block',
	start(src) { return src.match(/\n *{{[^{]/m)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		const completeBlock = /^ *{{[^\n}]* *\n.*\n *}}/s;                // Regex for the complete token
		const blockRegex = /^ *{{(?=((?:[:=](?:"['\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"=':{}\s]*)*))\1 *$|^ *}}$/gm;
		const match = completeBlock.exec(src);
		if(match) {
			//Find closing delimiter
			let blockCount = 0;
			let tags = '';
			let endTags = 0;
			let endToken = 0;
			let delim;
			while (delim = blockRegex.exec(match[0])?.[0].trim()) {
				if(!tags) {
					tags = `${processStyleTags(delim.substring(2))}`;
					endTags = delim.length + src.indexOf(delim);
				}
				if(delim.startsWith('{{')) {
					blockCount++;
				} else if(delim == '}}' && blockCount !== 0) {
					blockCount--;
					if(blockCount == 0) {
						endToken = blockRegex.lastIndex;
						break;
					}
				}
			}

			if(endToken) {
				const raw = src.slice(0, endToken);
				const text = raw.slice(endTags || -2, -2);
				return {                                        // Token to generate
					type   : 'mustacheDivs',                      // Should match "name" above
					raw    : raw,                                 // Text to consume from the source
					text   : text,                                // Additional custom properties
					tags   : tags,
					tokens : this.lexer.blockTokens(text)
				};
			}
		}
	},
	renderer(token) {
		return `<div class="block${token.tags}>${this.parser.parse(token.tokens)}</div>`; // parseInline to turn child tokens into HTML
	}
};

const mustacheInjectInline = {
	name  : 'mustacheInjectInline',
	level : 'inline',
	start(src) { return src.match(/ *{[^{\n]/)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		const inlineRegex = /^ *{(?=((?:[:=](?:"['\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"=':{}\s]*)*))\1}/g;
		const match = inlineRegex.exec(src);
		if(match) {
			const lastToken = tokens[tokens.length - 1];
			if(!lastToken || lastToken.type == 'mustacheInjectInline')
				return false;

			const tags = `${processStyleTags(match[1])}`;
			lastToken.originalType = lastToken.type;
			lastToken.type         = 'mustacheInjectInline';
			lastToken.tags         = tags;
			return {
				type : 'text',            // Should match "name" above
				raw  : match[0],          // Text to consume from the source
				text : ''
			};
		}
	},
	renderer(token) {
		token.type = token.originalType;
		const text = this.parser.parseInline([token]);
		const openingTag = /(<[^\s<>]+)([^\n<>]*>.*)/s.exec(text);
		if(openingTag) {
			return `${openingTag[1]} class="${token.tags}${openingTag[2]}`;
		}
		return text;
	}
};

const mustacheInjectBlock = {
	extensions : [{
		name  : 'mustacheInjectBlock',
		level : 'block',
		start(src) { return src.match(/\n *{[^{\n]/m)?.index; },  // Hint to Marked.js to stop and check for a match
		tokenizer(src, tokens) {
			const inlineRegex = /^ *{(?=((?:[:=](?:"['\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"=':{}\s]*)*))\1}/ym;
			const match = inlineRegex.exec(src);
			if(match) {
				const lastToken = tokens[tokens.length - 1];
				if(!lastToken || lastToken.type == 'mustacheInjectBlock')
					return false;

				lastToken.originalType = 'mustacheInjectBlock';
				lastToken.tags         = `${processStyleTags(match[1])}`;
				return {
					type : 'mustacheInjectBlock', // Should match "name" above
					raw  : match[0],              // Text to consume from the source
					text : ''
				};
			}
		},
		renderer(token) {
			if(!token.originalType){
				return;
			}
			token.type = token.originalType;
			const text = this.parser.parse([token]);
			const openingTag = /(<[^\s<>]+)([^\n<>]*>.*)/s.exec(text);
			if(openingTag) {
				return `${openingTag[1]} class="${token.tags}${openingTag[2]}`;
			}
			return text;
		}
	}],
	walkTokens(token) {
		// After token tree is finished, tag tokens to apply styles to so Renderer can find them
		// Does not work with tables since Marked.js tables generate invalid "tokens", and changing "type" ruins Marked handling that edge-case
		if(token.originalType == 'mustacheInjectBlock' && token.type !== 'table') {
			token.originalType = token.type;
			token.type         = 'mustacheInjectBlock';
		}
	}
};

const superSubScripts = {
	name  : 'superSubScript',
	level : 'inline',
	start(src) { return src.match(/\^/m)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		const superRegex = /^\^(?!\s)(?=([^\n\^]*[^\s\^]))\1\^/m;
		const subRegex   = /^\^\^(?!\s)(?=([^\n\^]*[^\s\^]))\1\^\^/m;
		let isSuper = false;
		let match = subRegex.exec(src);
		if(!match){
			match = superRegex.exec(src);
			if(match)
				isSuper = true;
		}
		if(match?.length) {
			return {
				type   : 'superSubScript', // Should match "name" above
				raw    : match[0],          // Text to consume from the source
				tag    : isSuper ? 'sup' : 'sub',
				tokens : this.lexer.inlineTokens(match[1])
			};
		}
	},
	renderer(token) {
		return `<${token.tag}>${this.parser.parseInline(token.tokens)}</${token.tag}>`;
	}
};

const definitionLists = {
	name  : 'definitionLists',
	level : 'block',
	start(src) { return src.match(/^.*?::.*/m)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		const regex = /^([^\n]*?)::([^\n]*)(?:\n|$)/ym;
		let match;
		let endIndex = 0;
		const definitions = [];
		while (match = regex.exec(src)) {
			definitions.push({
				dt : this.lexer.inlineTokens(match[1].trim()),
				dd : this.lexer.inlineTokens(match[2].trim())
			});
			endIndex = regex.lastIndex;
		}
		if(definitions.length) {
			return {
				type : 'definitionLists',
				raw  : src.slice(0, endIndex),
				definitions
			};
		}
	},
	renderer(token) {
		return `<dl>${token.definitions.reduce((html, def)=>{
			return `${html}<dt>${this.parser.parseInline(def.dt)}</dt>`
			            + `<dd>${this.parser.parseInline(def.dd)}</dd>\n`;
		}, '')}</dl>`;
	}
};


//v=====--------------------< Variable Handling >-------------------=====v// 295 lines
const replaceVar = function(input, hoist=false) {
	const regex = /([!$]?)\[((?!\s*\])(?:\\.|[^\[\]\\])+)/g;
	const match = regex.exec(input);

	const prefix = match[1];
	const label = match[2].toLowerCase();

	let missingValues = [];

	//v=====--------------------< HANDLE MATH >-------------------=====v//
	const mathRegex = /[^+\-*\/]+|[+\-*\/]/g;
	let mathLabels = label.match(mathRegex).map((s)=>s.trim());

	if(mathLabels.length > 2 && mathLabels.length % 2 == 1) {

		const valid = mathLabels.every((val, i)=>{  // Math must alternate between operators and values
			const isOperator = '+-*/'.includes(val);
			return (i % 2 === 0 ? !isOperator : isOperator);
		});
		if(!valid)
			return { value: input, missingValues: missingValues };

		mathLabels = mathLabels.map((str)=>{
			if(!isNaN(str))
				return Number(str);

			if('+-*/'.includes(str))
				return str;

			const foundVar = lookupVar(str, globalPageNumber, hoist);
			if(foundVar && foundVar.resolved && foundVar.content) // Only subsitute math values if fully resolved and not empty strings
				return foundVar.content;

			return str;
		});

		missingValues = mathLabels.filter((x)=>isNaN(x) && !'+-*/'.includes(x));

		return {
			value         : missingValues.length > 0 ? input : eval(mathLabels.join('')),
			missingValues : missingValues
		};
	}
	//^=====--------------------< HANDLE MATH >-------------------=====^//

	const foundVar = lookupVar(label, globalPageNumber, hoist);
	if(foundVar == undefined) {
		return {
			value         : input,
			missingValues : [label]
		};
	}

	if(!foundVar.resolved) {
		missingValues = [label];
	}

	//                    url or <url>            "title"    or   'title'     or  (title)
	const linkRegex =  /^([^<\s][^\s]*|<.*?>)(?: ("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\((?:\\\(|\\\)|[^()])*\)))?$/m;
	const linkMatch = linkRegex.exec(foundVar.content);

	let href  = null;
	let title = null;
	if(linkMatch) {
		href  = linkMatch[1]; //TODO: TRIM OFF < > IF PRESENT
		title = linkMatch[2]?.slice(1, -1);
	}

	let value;

	if(!prefix[0] && href)   // Link
		value = `[${label}](${href} ${title ? title : ''})`;

	if(prefix[0] == '!' && href)  // Image
		value = `![${label}](${href} ${title ? title : ''})`;
	
	if(prefix[0] == '$')          // Variable
		value = foundVar.content;

	return {
		value         : value,
		missingValues : missingValues
	};
};

const lookupVar = function(label, index, hoist=false) {
	if(hoist)
		index = Object.keys(globalLinks).length;

	while (index >= 0) {
		if(globalLinks[index]?.[label] !== undefined) {
			return globalLinks[index][label];
		}
		index--;
	}

	return undefined;
};

const processVariableQueue = function() {
	let resolvedOne = true;
	let finalLoop   = false;
	let newQueue = [];
	while (resolvedOne || finalLoop) { // Loop through queue until no more variable calls can be resolved
		newQueue = [];
		resolvedOne = false;
		for (const item of linksQueue) {
			const value = replaceVar(item.match, true);

			if(value.missingValues.length > 0 && !finalLoop) { // Variable not found; try again next loop.
				newQueue.push(item);                              // If previous loops could not resolve any new vars,
				continue;                                         // final loop will just use the best value so far
			}                                                   // (may be only partially resolved)

			resolvedOne = true;

			item.token.content = item.token.content.replace(item.match, value.value);

			if(item.token.type == 'varDefBlock' || item.token.type == 'varDefInline') {
				globalLinks[globalPageNumber][item.token.label] = {
					content  : item.token.content,
					resolved : true
				};
			}
		}
		linksQueue = newQueue;
		if(finalLoop)
			break;
		if(!resolvedOne)
			finalLoop   = true;
	}
};

const walkVariableTokens = {
	walkTokens(token) {
		if(token.type == 'varDefBlock' || token.type == 'varDefInline') {

			const regex = /[!$]?\[((?!\s*\])(?:\\.|[^\[\]\\])+)\]/g;
			let match;
			let resolved = true;
			while (match = regex.exec(token.content)) { // regex to find variable calls
				const value = replaceVar(match[0]);

				if(value.missingValues.length > 0) {
					for (let i = 0; i < value.missingValues.length; i++) {
						linksQueue.push({ token: token, match: match[0], varName: value.missingValues[i] });
					}
					resolved = false;
				} else {
					token.content = token.content.replace(match[0], value.value);
				}
			}

			globalLinks[globalPageNumber][token.label] = {
				content  : token.content,
				resolved : resolved
			};
			if(token.type == 'varDefInline')	//Inline definitions are also inline calls; after storing the value, change type so it can be displayed
				token.type = 'varCallInline';
		}
		if(token.type == 'varCallBlock' || token.type == 'varCallInline' || token.originalType == 'varCallBlock' || token.originalType == 'varCallInline') {
			const value = replaceVar(token.raw);
			if(value.missingValues.length > 0) {

				for (let i = 0; i < value.missingValues.length; i++) {
					linksQueue.push({ token: token, match: token.raw, varName: value.missingValues[i] });
				}
				return;
			}

			token.content = token.content.replace(token.content, value.value);
		}
	}
};

const varDefBlock = {
	name  : 'varDefBlock',
	level : 'block',
	start(src) {return src.match(/\n {0,3}[!$]?\[(?!\s*\])(?:\\.|[^\[\]\\])+\]:/m)?.index; },
	tokenizer(src, tokens) {
		//                   [ variable name (spaces allowed) ]: Any text, including into newlines (but no fully blank lines)
		const regex = /^ {0,3}[!$]?\[((?!\s*\])(?:\\.|[^\[\]\\])+)\]:(?!\() *((?:\n? *[^\s].*)+)(?=\n+|$)/;
		const match = regex.exec(src);
		if(match) {
			const label   = match[1] ? match[1].trim().replace(/\s+/g, ' ').toLowerCase() : null; // Trim edge spaces and shorten blocks of whitespace to 1 space
			const content = match[2] ? match[2].trim().replace(/[ \t]+/g, ' ')            : null; // Trim edge spaces and shorten blocks of whitespace to 1 space

			return {
				type    : 'varDefBlock',
				raw     : match[0],
				label   : label,
				content : content
			};
		}
	},
	renderer(token){
		return;
	}
};

const varDefInline = {
	name  : 'varDefInline',
	level : 'inline',
	start(src) {return src.match(/\n?[!$]?\[(?!\s*\])(?:\\.|[^\[\]\\])+\]:\(.*\)/m)?.index;},
	tokenizer(src, tokens) {
		if(!parseVars)	//Don't re-parse variable defs inside of another variable call
			return;
		//                   [ variable name (spaces allowed) ]: Any text, including into newlines (but no fully blank lines)
		const regex = /^\n?([!$]?)\[((?!\s*\])(?:\\.|[^\[\]\\])+)\]:\((.+?)\)/;
		const match = regex.exec(src);
		if(match) {
			const label   = match[2] ? match[2].trim().replace(/\s+/g, ' ').toLowerCase() : null; // Trim edge spaces and shorten blocks of whitespace to 1 space
			const content = match[3] ? match[3].trim().replace(/\s+/g, ' ')               : null; // Trim edge spaces and shorten blocks of whitespace to 1 space

			return {
				type    : 'varDefInline',
				raw     : match[0],
				label   : label,
				content : content
			};
		}
	},
	renderer(token) {
		return;
	}
};

const varCallBlock = {
	name  : 'varCallBlock',
	level : 'block',
	start(src) {return src.match(/\n[!$]?\[(?!\s*\])(?:\\.|[^\[\]\\])+\]/m)?.index;},
	tokenizer(src, tokens) {
		if(!parseVars)	//Don't re-parse variable calls inside of another variable call
			return;

		//                      [ variable name (spaces allowed) ] no following text allowed
		const regex = /^([!$]?)\[((?!\s*\])(?:\\.|[^\[\]\\])+)\](?=\n|$)/;
		const match = regex.exec(src);
		if(match) {
			return {
				type    : 'varCallBlock',
				raw     : match[0],
				content : match[0]
			};
		}
	},
	renderer(token){
		const tokens = new Marked.Lexer(Marked.defaults).lex(token.content);
		return this.parser.parse(tokens);
	}
};

const varCallInline = {
	name  : 'varCallInline',
	level : 'inline',
	start(src) {return src.match(/[!$]?\[(?!\s*\])(?:\\.|[^\[\]\\])+\]/m)?.index;},
	tokenizer(src, tokens) {
		if(!parseVars)	//Don't re-parse variable calls inside of another variable call
			return;

		//                   [ variable name (spaces allowed) ]: Any text, including into newlines (but no fully blank lines)
		const regex = /^([!$]?)\[((?!\s*\])(?:\\.|[^\[\]\\])+)\](?!\()/; // Do not allow `(` after, since that is needed for normal images/links
		const match = regex.exec(src);
		if(match) {
			return {
				type    : 'varCallInline',
				raw     : match[0],
				content : match[0]
			};
		}
	},
	renderer(token){
		const tokens = new Marked.Lexer(Marked.defaults).inlineTokens(token.content);
		return this.parser.parseInline(tokens);
	}
};
//^=====--------------------< Variable Handling >-------------------=====^//

function MarkedVariables() {
  return {
    hooks: {
      preprocess(src) {
				const blockDefRegex = /^\n?([!$]?)\[((?!\s*\])(?:\\.|[^\[\]\\])+)\]:\((.+?)\)/;


				let match = blockDefRegex.exec(src);
				if(match) {
					const label   = match[2] ? match[2].trim().replace(/\s+/g, ' ').toLowerCase() : null; // Trim edge spaces and shorten blocks of whitespace to 1 space
					const content = match[3] ? match[3].trim().replace(/\s+/g, ' ')               : null; // Trim edge spaces and shorten blocks of whitespace to 1 space
				//Block definitions
        const regex = /cow/g;
				src = src.replace(regex,"replaced");
        return src;
      }
    }
  };
}

Marked.use(MarkedVariables())
Marked.use({ extensions: [mustacheSpans, mustacheDivs, mustacheInjectInline, definitionLists, superSubScripts, varCallInline, varDefInline, varCallBlock, varDefBlock] });
Marked.use(mustacheInjectBlock, walkVariableTokens);
Marked.use({ renderer: renderer, tokenizer: tokenizer, mangle: false });
Marked.use(MarkedExtendedTables(), MarkedGFMHeadingId(), MarkedSmartypantsLite());

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

const tagTypes = ['div', 'span', 'a'];
const tagRegex = new RegExp(`(${
	_.map(tagTypes, (type)=>{
		return `\\<${type}\\b|\\</${type}>`;
	}).join('|')})`, 'g');

// Special "void" tags that can be self-closed but don't need to be.
const voidTags = new Set([
	'area', 'base', 'br', 'col', 'command', 'hr', 'img',
	'input', 'keygen', 'link', 'meta', 'param', 'source'
]);

const processStyleTags = (string)=>{
	//split tags up. quotes can only occur right after : or =.
	//TODO: can we simplify to just split on commas?
	const tags = string.match(/(?:[^, ":=]+|[:=](?:"[^"]*"|))+/g);

	const id         = _.remove(tags, (tag)=>tag.startsWith('#')).map((tag)=>tag.slice(1))[0];
	const classes    = _.remove(tags, (tag)=>(!tag.includes(':')) && (!tag.includes('=')));
	const attributes = _.remove(tags, (tag)=>(tag.includes('='))).map((tag)=>tag.replace(/="?([^"]*)"?/g, '="$1"'));
	const styles     = tags?.length ? tags.map((tag)=>tag.replace(/:"?([^"]*)"?/g, ':$1;').trim()) : [];

	return `${classes?.length ? ` ${classes.join(' ')}`        : ''}"` +
		`${id                   ? ` id="${id}"`                  : ''}` +
		`${styles?.length       ? ` style="${styles.join(' ')}"` : ''}` +
		`${attributes?.length   ? ` ${attributes.join(' ')}`     : ''}`;
};

const globalLinks    = {};
let linksQueue       = [];
let globalPageNumber = 0;
let parseVars        = true;

module.exports = {
	marked : Marked,
	render : (rawBrewText, pageNumber=1)=>{
		globalLinks[pageNumber] = {};						//Reset global links for current page, to ensure values are parsed in order
		linksQueue              = [];
		globalPageNumber        = pageNumber;

		parseVars = true;

		rawBrewText = rawBrewText.replace(/^\\column$/gm, `\n<div class='columnSplit'></div>\n`)
														 .replace(/^(:+)$/gm, (match)=>`${`<div class='blank'></div>`.repeat(match.length)}\n`);
		const opts = Marked.defaults;

		rawBrewText = opts.hooks.preprocess(rawBrewText);
		const tokens = Marked.lexer(rawBrewText, opts);

		Marked.walkTokens(tokens, opts.walkTokens);
		processVariableQueue();

		parseVars = false;
		const html = Marked.parser(tokens, opts);
		return opts.hooks.postprocess(html);
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
						// Closing tag: Check we expect it to be closed.
						// The accumulator may contain a sequence of voidable opening tags,
						// over which we skip before checking validity of the close.
						while (acc.length && voidTags.has(_.last(acc).type) && _.last(acc).type != type) {
							acc.pop();
						}
						// Now check that what remains in the accumulator is valid.
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
