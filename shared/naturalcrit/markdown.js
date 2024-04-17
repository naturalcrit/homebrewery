/* eslint-disable max-lines */
const _ = require('lodash');
const Marked = require('marked');
const MarkedExtendedTables = require('marked-extended-tables');
const { markedSmartypantsLite: MarkedSmartypantsLite } = require('marked-smartypants-lite');
const { gfmHeadingId: MarkedGFMHeadingId } = require('marked-gfm-heading-id');
const MathParser = require('expr-eval').Parser;
const renderer = new Marked.Renderer();
const tokenizer = new Marked.Tokenizer();

//Limit math features to simple items
const mathParser = new MathParser({
	operators : {
		// These default to true, but are included to be explicit
		add      : true,
		subtract : true,
		multiply : true,
		divide   : true,
		power    : true,
		round    : true,
		floor    : true,
		ceil     : true,

		sin     : false, cos     : false, tan     : false, asin    : false, acos    : false,
		atan    : false, sinh    : false, cosh    : false, tanh    : false, asinh   : false,
		acosh   : false, atanh   : false, sqrt    : false, cbrt    : false, log     : false,
		log2    : false, ln      : false, lg      : false, log10   : false, expm1   : false,
		log1p   : false, abs     : false, trunc   : false, join    : false, sum     : false,
		'-'     : false, '+'     : false, exp     : false, not     : false, length  : false,
		'!'     : false, sign    : false, random  : false, fac     : false, min     : false,
		max     : false, hypot   : false, pyt     : false, pow     : false, atan2   : false,
		'if'    : false, gamma   : false, roundTo : false, map     : false, fold    : false,
		filter  : false, indexOf : false,

		remainder   : false, factorial   : false,
		comparison  : false, concatenate : false,
		logical     : false, assignment  : false,
		array       : false, fndef       : false
	}
});

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

// Disable default reflink behavior, as it steps on our variables extension
tokenizer.def = function () {
	return undefined;
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

const definitionListsSingleLine = {
	name  : 'definitionListsSingleLine',
	level : 'block',
	start(src) { return src.match(/\n[^\n]*?::[^\n]*/m)?.index; },  // Hint to Marked.js to stop and check for a match
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
				type : 'definitionListsSingleLine',
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

const definitionListsMultiLine = {
	name  : 'definitionListsMultiLine',
	level : 'block',
	start(src) { return src.match(/\n[^\n]*\n::/m)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		const regex = /(\n?\n?(?!::)[^\n]+?(?=\n::))|\n::(.(?:.|\n)*?(?=(?:\n::)|(?:\n\n)|$))/y;
		let match;
		let endIndex = 0;
		const definitions = [];
		while (match = regex.exec(src)) {
			if(match[1]) {
				if(this.lexer.blockTokens(match[1].trim())[0]?.type !== 'paragraph') // DT must not be another block-level token besides <p>
					break;
				definitions.push({
					dt  : this.lexer.inlineTokens(match[1].trim()),
					dds : []
				});
			}
			if(match[2] && definitions.length) {
				definitions[definitions.length - 1].dds.push(
					this.lexer.inlineTokens(match[2].trim().replace(/\s/g, ' '))
				);
			}
			endIndex = regex.lastIndex;
		}
		if(definitions.length) {
			return {
				type : 'definitionListsMultiLine',
				raw  : src.slice(0, endIndex),
				definitions
			};
		}
	},
	renderer(token) {
		let returnVal = `<dl>`;
		token.definitions.forEach((def)=>{
			const dds = def.dds.map((s)=>{
				return `\n<dd>${this.parser.parseInline(s).trim()}</dd>`;
			}).join('');
			returnVal += `<dt>${this.parser.parseInline(def.dt)}</dt>${dds}\n`;
		});
		returnVal = returnVal.trim();
		return `${returnVal}</dl>`;
	}
};

//v=====--------------------< Variable Handling >-------------------=====v// 242 lines
const replaceVar = function(input, hoist=false, allowUnresolved=false) {
	const regex = /([!$]?)\[((?!\s*\])(?:\\.|[^\[\]\\])+)\]/g;
	const match = regex.exec(input);

	const prefix = match[1];
	const label  = match[2];

	//v=====--------------------< HANDLE MATH >-------------------=====v//
	const mathRegex = /[a-z]+\(|[+\-*/^()]/g;
	const matches = label.split(mathRegex);
	const mathVars = matches.filter((match)=>isNaN(match))?.map((s)=>s.trim()); // Capture any variable names

	let replacedLabel = label;

	if(prefix[0] == '$' && mathVars?.[0] !== label.trim())  {// If there was mathy stuff not captured, let's do math!
		mathVars?.forEach((variable)=>{
			const foundVar = lookupVar(variable, globalPageNumber, hoist);
			if(foundVar && foundVar.resolved && foundVar.content && !isNaN(foundVar.content)) // Only subsitute math values if fully resolved, not empty strings, and numbers
				replacedLabel = replacedLabel.replaceAll(variable, foundVar.content);
		});

		try {
			return mathParser.evaluate(replacedLabel);
		} catch (error) {
			return undefined;		// Return undefined if invalid math result
		}
	}
	//^=====--------------------< HANDLE MATH >-------------------=====^//

	const foundVar = lookupVar(label, globalPageNumber, hoist);

	if(!foundVar || (!foundVar.resolved && !allowUnresolved))
		return undefined;			// Return undefined if not found, or parially-resolved vars are not allowed

	//                    url or <url>            "title"    or   'title'     or  (title)
	const linkRegex =  /^([^<\s][^\s]*|<.*?>)(?: ("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\((?:\\\(|\\\)|[^()])*\)))?$/m;
	const linkMatch = linkRegex.exec(foundVar.content);

	const href  = linkMatch ? linkMatch[1]               : null; //TODO: TRIM OFF < > IF PRESENT
	const title = linkMatch ? linkMatch[2]?.slice(1, -1) : null;

	if(!prefix[0] && href)        // Link
		return `[${label}](${href}${title ? ` "${title}"` : ''})`;

	if(prefix[0] == '!' && href)  // Image
		return `![${label}](${href} ${title ? ` "${title}"` : ''})`;

	if(prefix[0] == '$')          // Variable
		return foundVar.content;
};

const lookupVar = function(label, index, hoist=false) {
	while (index >= 0) {
		if(globalVarsList[index]?.[label] !== undefined)
			return globalVarsList[index][label];
		index--;
	}

	if(hoist) {	//If normal lookup failed, attempt hoisting
		index = Object.keys(globalVarsList).length; // Move index to start from last page
		while (index >= 0) {
			if(globalVarsList[index]?.[label] !== undefined)
				return globalVarsList[index][label];
			index--;
		}
	}

	return undefined;
};

const processVariableQueue = function() {
	let resolvedOne = true;
	let finalLoop   = false;
	while (resolvedOne || finalLoop) { // Loop through queue until no more variable calls can be resolved
		resolvedOne = false;
		for (const item of varsQueue) {
			if(item.type == 'text')
				continue;

			if(item.type == 'varDefBlock') {
				const regex = /[!$]?\[((?!\s*\])(?:\\.|[^\[\]\\])+)\]/g;
				let match;
				let resolved = true;
				let tempContent = item.content;
				while (match = regex.exec(item.content)) { // regex to find variable calls
					const value = replaceVar(match[0], true);

					if(value == undefined)
						resolved = false;
					else
						tempContent = tempContent.replaceAll(match[0], value);
				}

				if(resolved == true || item.content != tempContent) {
					resolvedOne = true;
					item.content = tempContent;
				}

				globalVarsList[globalPageNumber][item.varName] = {
					content  : item.content,
					resolved : resolved
				};

				if(resolved)
					item.type = 'resolved';
			}

			if(item.type == 'varCallBlock' || item.type == 'varCallInline') {
				const value = replaceVar(item.content, true, finalLoop); // final loop will just use the best value so far

				if(value == undefined)
					continue;

				resolvedOne  = true;
				item.content = value;
				item.type    = 'text';
			}
		}
		varsQueue = varsQueue.filter((item)=>item.type !== 'resolved'); // Remove any fully-resolved variable definitions

		if(finalLoop)
			break;
		if(!resolvedOne)
			finalLoop   = true;
	}
	varsQueue = varsQueue.filter((item)=>item.type !== 'varDefBlock');
};

function MarkedVariables() {
	return {
		hooks : {
			preprocess(src) {
				const codeBlockSkip   = /^(?: {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+|^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})(?:[^\n]*)(?:\n|$)(?:|(?:[\s\S]*?)(?:\n|$))(?: {0,3}\2[~`]* *(?=\n|$))|`[^`]*?`/;
				const blockDefRegex   = /^[!$]?\[((?!\s*\])(?:\\.|[^\[\]\\])+)\]:(?!\() *((?:\n? *[^\s].*)+)(?=\n+|$)/; //Matches 3, [4]:5
				const blockCallRegex  = /^[!$]?\[((?!\s*\])(?:\\.|[^\[\]\\])+)\](?=\n|$)/;                              //Matches 6, [7]
				const inlineDefRegex  = /([!$]?\[((?!\s*\])(?:\\.|[^\[\]\\])+)\])\(([^\n]+)\)/;                         //Matches 8, 9[10](11)
				const inlineCallRegex =  /[!$]?\[((?!\s*\])(?:\\.|[^\[\]\\])+)\](?!\()/;                                //Matches 12, [13]

				// Combine regexes and wrap in parens like so: (regex1)|(regex2)|(regex3)|(regex4)
				const combinedRegex = new RegExp([codeBlockSkip, blockDefRegex, blockCallRegex, inlineDefRegex, inlineCallRegex].map((s)=>`(${s.source})`).join('|'), 'gm');

				let lastIndex = 0;
				let match;
				while ((match = combinedRegex.exec(src)) !== null) {
					// Format any matches into tokens and store
					if(match.index > lastIndex) { // Any non-variable stuff
						varsQueue.push(
							{ type    : 'text',
								varName : null,
								content : src.slice(lastIndex, match.index)
							});
					}
					if(match[1]) {
						varsQueue.push(
							{ type    : 'text',
								varName : null,
								content : match[0]
							});
					}
					if(match[3]) { // Block Definition
						const label   = match[4] ? match[4].trim().replace(/\s+/g, ' ')    : null; // Trim edge spaces and shorten blocks of whitespace to 1 space
						const content = match[5] ? match[5].trim().replace(/[ \t]+/g, ' ') : null; // Trim edge spaces and shorten blocks of whitespace to 1 space

						varsQueue.push(
							{ type    : 'varDefBlock',
								varName : label,
								content : content
							});
					}
					if(match[6]) { // Block Call
						const label = match[7] ? match[7].trim().replace(/\s+/g, ' ') : null; // Trim edge spaces and shorten blocks of whitespace to 1 space

						varsQueue.push(
							{ type    : 'varCallBlock',
								varName : label,
								content : match[0]
							});
					}
					if(match[8]) { // Inline Definition
						const label = match[10] ? match[10].trim().replace(/\s+/g, ' ') : null; // Trim edge spaces and shorten blocks of whitespace to 1 space
						let content = match[11] ? match[11].trim().replace(/\s+/g, ' ') : null; // Trim edge spaces and shorten blocks of whitespace to 1 space

						// In case of nested (), find the correct matching end )
						let level = 0;
						let i;
						for (i = 0; i < content.length; i++) {
							if(content[i] === '\\') {
								i++;
							} else if(content[i] === '(') {
								level++;
							} else if(content[i] === ')') {
								level--;
								if(level < 0)
									break;
							}
						}
						if(i > -1) {
							combinedRegex.lastIndex = combinedRegex.lastIndex - (content.length - i);
							content = content.slice(0, i).trim().replace(/\s+/g, ' ');
						}

						varsQueue.push(
							{ type    : 'varDefBlock',
								varName : label,
								content : content
							});
						varsQueue.push(
							{ type    : 'varCallInline',
								varName : label,
								content : match[9]
							});
					}
					if(match[12]) { // Inline Call
						const label = match[13] ? match[13].trim().replace(/\s+/g, ' ') : null; // Trim edge spaces and shorten blocks of whitespace to 1 space

						varsQueue.push(
							{ type    : 'varCallInline',
								varName : label,
								content : match[0]
							});
					}
					lastIndex = combinedRegex.lastIndex;
				}

				if(lastIndex < src.length) {
					varsQueue.push(
						{ type    : 'text',
							varName : null,
							content : src.slice(lastIndex)
						});
				}

				processVariableQueue();

				const output = varsQueue.map((item)=>item.content).join('');
				varsQueue = []; // Must clear varsQueue because custom HTML renderer uses Marked.parse which will preprocess again without clearing the array
				return output;
			}
		}
	};
};
//^=====--------------------< Variable Handling >-------------------=====^//

Marked.use(MarkedVariables());
Marked.use({ extensions: [definitionListsMultiLine, definitionListsSingleLine, superSubScripts, mustacheSpans, mustacheDivs, mustacheInjectInline] });
Marked.use(mustacheInjectBlock);
Marked.use({ renderer: renderer, tokenizer: tokenizer, mangle: false });
Marked.use(MarkedExtendedTables(), MarkedGFMHeadingId(), MarkedSmartypantsLite());

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

const globalVarsList    = {};
let varsQueue       = [];
let globalPageNumber = 0;

module.exports = {
	marked : Marked,
	render : (rawBrewText, pageNumber=1)=>{
		globalVarsList[pageNumber] = {};						//Reset global links for current page, to ensure values are parsed in order
		varsQueue              = [];						//Could move into MarkedVariables()
		globalPageNumber        = pageNumber;

		rawBrewText = rawBrewText.replace(/^\\column$/gm, `\n<div class='columnSplit'></div>\n`)
														 .replace(/^(:+)$/gm, (match)=>`${`<div class='blank'></div>`.repeat(match.length)}\n`);
		const opts = Marked.defaults;

		rawBrewText = opts.hooks.preprocess(rawBrewText);
		const tokens = Marked.lexer(rawBrewText, opts);

		Marked.walkTokens(tokens, opts.walkTokens);

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
