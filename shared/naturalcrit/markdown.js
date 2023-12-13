/* eslint-disable max-lines */
const _ = require('lodash');
const Marked = require('marked');
const MarkedExtendedTables = require('marked-extended-tables');
const { markedSmartypantsLite: MarkedSmartypantsLite } = require('marked-smartypants-lite');
const { gfmHeadingId: MarkedGFMHeadingId } = require('marked-gfm-heading-id');
const renderer = new Marked.Renderer();
const tokenizer = new Marked.Tokenizer();
const lexer = new Marked.Lexer();
const mathjs = require('mathjs');

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


const edit = function (regex, opt) {
	const caret = /(^|[^\[])\^/g;
	regex = typeof regex === 'string' ? regex : regex.source;
	opt = opt || '';
	const obj = {
	  replace : (name, val)=>{
			val = typeof val === 'object' && 'source' in val ? val.source : val;
			val = val.replace(caret, '$1');
			regex = regex.replace(name, val);
			return obj;
	  },
	  getRegex : ()=>{
			return new RegExp(regex, opt);
	  }
	};
	return obj;
};

const outputLink = (cap, link, raw, lexer)=>{
	const href = link.href;
	const title = link.title ? escape(link.title) : null;
	const text = cap[1].replace(/\\([\[\]])/g, '$1');

	if(cap[0].charAt(0) !== '!') {
	  lexer.state.inLink = true;
	  const token = {
			type   : 'link',
			raw,
			href,
			title,
			text,
			tokens : lexer.inlineTokens(text)
	  };
	  lexer.state.inLink = false;
	  return token;
	}
	return {
	  type : 'image',
	  raw,
	  href,
	  title,
	  text : escape(text)
	};
};

const upsertLinks = function(lexer) {
	if(Object.keys(lexer.tokens.links).length < Object.keys(globalLinks).length) {
		lexer.tokens.links = Object.assign(lexer.tokens.links, globalLinks);
	}
};

// Lifted liberally from marked
tokenizer.reflink = function (src, links) {
	let cap;
	let reflink = /^!?\[(label)\]\[(ref)\]/;
	let nolink =  /^!?\[(ref)\](?:\[\])?/;
	const inlinelabel = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
	const blocklabel = /(?!\s*\])(?:\\.|[^\[\]\\])+/;

	upsertLinks(this.lexer);

	reflink = edit(reflink)
		.replace('label', inlinelabel)
		.replace('ref', blocklabel)
		.getRegex();

	nolink = edit(nolink)
		.replace('ref', blocklabel)
		.getRegex();

	if((cap = reflink.exec(src)) || (cap = nolink.exec(src))) {
		let link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
		link = links[link.toLowerCase()];
		if(!link) {
		  const text = cap[0].charAt(0);
		  return {
				type : 'text',
				raw  : text,
				text
		  };
		}
		return outputLink(cap, link, cap[0], this.lexer);
	  }
	return '';
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

const mustacheSpans = {
	name  : 'mustacheSpans',
	level : 'inline',                                   // Is this a block-level or inline-level tokenizer?
	start(src) { return src.match(/{{[^{]/)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		const completeSpan = /^{{[^\n]*}}/;               // Regex for the complete token
		const inlineRegex = /{{(?=((?::(?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':{}\s]*)*))\1 *|}}/g;
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
					tags = ` ${processStyleTags(delim[0].substring(2))}`;
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
		const blockRegex = /^ *{{(?=((?::(?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':{}\s]*)*))\1 *$|^ *}}$/gm;
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
					tags = ` ${processStyleTags(delim.substring(2))}`;
					endTags = delim.length;
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
		const inlineRegex = /^ *{(?=((?::(?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':{}\s]*)*))\1}/g;
		const match = inlineRegex.exec(src);
		if(match) {
			const lastToken = tokens[tokens.length - 1];
			if(!lastToken || lastToken.type == 'mustacheInjectInline')
				return false;

			const tags = ` ${processStyleTags(match[1])}`;
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
			const inlineRegex = /^ *{(?=((?::(?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':{}\s]*)*))\1}/ym;
			const match = inlineRegex.exec(src);
			if(match) {
				const lastToken = tokens[tokens.length - 1];
				if(!lastToken || lastToken.type == 'mustacheInjectBlock')
					return false;

				lastToken.originalType = 'mustacheInjectBlock';
				lastToken.tags         = ` ${processStyleTags(match[1])}`;
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

// Return an object of all variables from another array

const findVariables = function (vars) {
	const returnObj = {
	};

	const varList = typeof vars == 'string' ? [vars] : vars;

	for (const v in varList) {
		if(varList[v][0] == '$') {
			const vSub = varList[v].replace(/^\$/, '');
			if(globalUserVars.hasOwnProperty(vSub)) {
				returnObj[vSub] = globalUserVars[vSub].value;
			}
		}
	}

	return returnObj;
};

const subUserVariablesInString = function(src, raw){
	let math = false;
	let value = '';
	if(src[0] == '=') {
		src =src.replace(/^=/, '');
		math = true;
	}
	const subVariables = findVariables(src.split(' '));
	if(math){
		for (const k in subVariables) {
			src = src.replace(`\$${k}`, k);
		}
		try {
			const computation = mathjs.parse(src);
			const result = computation.evaluate(subVariables);
			if(result) { value = result.toString(); } else { value = raw; }
		} catch (error) {
			value = raw;
		}
	} else {
		for (const k in subVariables) {
			if(globalUserVars?.hasOwnProperty(k)) {
				src = src.replace(`\$${k}`, globalUserVars[k].value);
			}
		}
		value = `${src}`;
	}
	return value;
};

const userBrewVariables = {
	name  : 'userBrewVariables',
	level : 'inline',
	start(src) { return src.match(/\$\[([\S]+?)\]((?:\()([\S ]+)(?:\)))?/)?.index; },
	tokenizer(src, tokens) {
		const variableNameRegex = /^\$\[([\S]+?)\]((?:\()([\S ]+)(?:\)))?/;

		let lastOutput = '';
		let assignment = false;
		const match = variableNameRegex.exec(src);
		if(match) {
			if(match[2]) {
				const value = match[2].replace(/^\(/, '').replace(/\)$/, '').trim();
				const subVariables = value.match(/\$/) || value.match(/=/) ? subUserVariablesInString(value, match[0]) : value;
				globalUserVars[ match[1] ] = {
					value      : subVariables,
					formatting : {},
				};
				assignment = true;
				lastOutput = subVariables;
			} else {
				if(!globalUserVars.hasOwnProperty([match[1]])) {
					lastOutput = match[0];
				} else {
					lastOutput = globalUserVars[match[1]].value;
				}
			}
			const token = {
				type : 'userBrewVariables',
				raw  : match[0],
				text : lastOutput,
				assignment

			};
			return token;

		}
		return false;
	},
	renderer(token) {
		const silentOrRaw = token?.assignment ? `` : token.raw;

		return `${token?.text ? token?.text : silentOrRaw}`;
	}
};

const processBrewMacros = new Map();

// Quiet output. Used as a "last" item on a multi-operation row if you don't want output for that variable block.
processBrewMacros.set('q', (macroString)=>{
	return {
		silent : true,
		output : ''
	};
});
// Echo Parameters -
processBrewMacros.set('echo', (macroString)=>{
	return {
		silent : false,
		output : `${macroString.replace(/^\(/, '').replace(/\)$/, '')}`
	};
});

processBrewMacros.set('copy', (macroString)=>{
	const fromTo = macroString.replace(/^\(/, '').replace(/\)$/, '').split(/[ ,]/);
	if((globalUserVars[fromTo[0]]?.hasOwnProperty('formatting')) && (globalUserVars[fromTo[1]]?.hasOwnProperty('formatting'))) {
		globalUserVars[fromTo[1]].value = globalUserVars[fromTo[0]].value;
		return {
			silent : true,
			output : ''
		};
	} else {
		return {
			silent : false,
			output : macroString
		};
	}
});

const userBrewVarMacros = {
	name  : 'userBrewVarMacros',
	level : 'inline',
	start(src) { return src.match(/\:\[([\S]+)\](\([\S ]+\))*/g)?.index; },
	tokenizer(src, tokens) {
		const variableNameRegex = /^\:\[([\S]+)\](\([\S ]+\))*/g;

		let lastOutput = '';
		const match = variableNameRegex.exec(src);
		if(match) {
			if(!match[1]) {
				lastOutput = match[0];
			} else {
				const macro = processBrewMacros.get(match[1]);
				if(macro) {
					const macroResult = macro(match[2]);
					lastOutput = macroResult;
				}
			}
			const token = {
				type        : 'userBrewVarMacros',
				raw         : match[0],
				macroResult : lastOutput,
			};
			return token;
		}
		return false;
	},
	renderer(token) {
		const silentOrRaw = token?.macroResult.silent ? `` : token.raw;
		return `${token?.macroResult.output ? token?.macroResult.output : silentOrRaw}`;
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

Marked.use({ extensions : [mustacheSpans, mustacheDivs, mustacheInjectInline, definitionLists,
	superSubScripts, userBrewVariables, userBrewVarMacros] });
Marked.use(mustacheInjectBlock);
Marked.use({ renderer: renderer, lexer: lexer, tokenizer: tokenizer, mangle: false });
Marked.use(MarkedExtendedTables(), MarkedGFMHeadingId(), MarkedSmartypantsLite());

//Fix local links in the Preview iFrame to link inside the frame
renderer.link = function (href, title, text) {
	let self = false;

	upsertLinks(lexer);

	if((href) && (href[0] == '#')) {
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
	//split tags up. quotes can only occur right after colons.
	//TODO: can we simplify to just split on commas?
	const tags = string.match(/(?:[^, ":]+|:(?:"[^"]*"|))+/g);

	if(!tags)	return '"';

	const id      = _.remove(tags, (tag)=>tag.startsWith('#')).map((tag)=>tag.slice(1))[0];
	const classes = _.remove(tags, (tag)=>!tag.includes(':'));
	const styles  = tags.map((tag)=>tag.replace(/:"?([^"]*)"?/g, ':$1;'));
	return `${classes.join(' ')}" ${id ? `id="${id}"` : ''} ${styles.length ? `style="${styles.join(' ')}"` : ''}`;
};

let globalLinks = {};
let globalUserVars = {};

module.exports = {
	resetBrewVars : (defaultVars)=>{
		globalLinks = {};
		globalUserVars = defaultVars;
	},
	marked : Marked,
	render : (rawBrewText)=>{
		rawBrewText = rawBrewText.replace(/^\\column$/gm, `\n<div class='columnSplit'></div>\n`)
														 .replace(/^(:+)$/gm, (match)=>`${`<div class='blank'></div>`.repeat(match.length)}\n`);
		const opts = Marked.defaults;

		rawBrewText = opts.hooks.preprocess(rawBrewText);
		const tokens = Marked.lexer(rawBrewText, opts);
		globalLinks = Object.assign({}, tokens.links);
		Marked.walkTokens(tokens, opts.walkTokens);
		const html = Marked.parser(tokens, opts);
		for (const [key, value] of Object.entries(globalUserVars)) {
			if(key[0] == '$') {
				delete globalUserVars[key];
			}
		}
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
