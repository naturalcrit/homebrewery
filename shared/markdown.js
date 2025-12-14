/* eslint-disable max-depth */
/* eslint-disable max-lines */
import _                        from 'lodash';
import { marked as Marked }     from 'marked';
import MarkedExtendedTables     from 'marked-extended-tables';
import MarkedDefinitionLists    from 'marked-definition-lists';
import MarkedAlignedParagraphs  from 'marked-alignment-paragraphs';
import MarkedNonbreakingSpaces  from 'marked-nonbreaking-spaces';
import MarkedSubSuperText       from 'marked-subsuper-text';
import { markedVariables,
				setMarkedVariablePage,
				setMarkedVariable,
				getMarkedVariable }  from 'marked-variables';
import { markedSmartypantsLite as MarkedSmartypantsLite }                                from 'marked-smartypants-lite';
import { gfmHeadingId as MarkedGFMHeadingId, resetHeadings as MarkedGFMResetHeadingIDs } from 'marked-gfm-heading-id';
import { markedEmoji as MarkedEmojis }                                                   from 'marked-emoji';

//Icon fonts included so they can appear in emoji autosuggest dropdown
import diceFont      from '../themes/fonts/iconFonts/diceFont.js';
import elderberryInn from '../themes/fonts/iconFonts/elderberryInn.js';
import gameIcons     from '../themes/fonts/iconFonts/gameIcons.js';
import fontAwesome   from '../themes/fonts/iconFonts/fontAwesome.js';

const renderer  = new Marked.Renderer();
const tokenizer = new Marked.Tokenizer();

//Processes the markdown within an HTML block if it's just a class-wrapper
renderer.html = function (token) {
	let html = token.text;
	if(_.startsWith(_.trim(html), '<div') && _.endsWith(_.trim(html), '</div>')){
		const openTag = html.substring(0, html.indexOf('>')+1);
		html = html.substring(html.indexOf('>')+1);
		html = html.substring(0, html.lastIndexOf('</div>'));

		// Repeat the markdown processing for content inside the div, minus the preprocessing and postprocessing hooks which should only run once globally
		const opts = Marked.defaults;
		const tokens = Marked.lexer(html, opts);
		Marked.walkTokens(tokens, opts.walkTokens);
		return `${openTag} ${Marked.parser(tokens, opts)} </div>`;
	}
	return html;
};

// Don't wrap {{ Spans alone on a line, or {{ Divs in <p> tags
renderer.paragraph = function(token){
	let match;
	const text = this.parser.parseInline(token.tokens);
	if(text.startsWith('<div') || text.startsWith('</div'))
		return `${text}`;
	else if(match = text.match(/(^|^.*?\n)<span class="inline-block(.*?<\/span>)$/))
		return `${match[1].trim() ? `<p>${match[1]}</p>` : ''}<span class="inline-block${match[2]}`;
	else
		return `<p>${text}</p>\n`;
};

//Fix local links in the Preview iFrame to link inside the frame
renderer.link = function (token) {
	let { href, title, tokens } = token;
	const text = this.parser.parseInline(tokens);
	let self = false;
	if(href[0] == '#') {
		self = true;
	}
	href = cleanUrl(href);

	if(href === null) {
		return text;
	}
	let out = `<a href="${escape(href)}"`;
	if(title) {
		out += ` title="${escape(title)}"`;
	}
	if(self) {
		out += ' target="_self"';
	}
	out += `>${text}</a>`;
	return out;
};

// Expose `src` attribute as `--HB_src` to make the URL accessible via CSS
renderer.image = function (token) {
	const { href, title, text } = token;
	if(href === null)
		return text;

	let out = `<img src="${href}" alt="${text}" style="--HB_src:url(${href});"`;
	if(title)
		out += ` title="${title}"`;

	out += '>';
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
		const inlineRegex = /{{(?=((?:[:=](?:"['\w,\-+*/()#%=?.&:!@$^;:\[\]_= ]*"|[\w\-+*/()#%.]*)|[^"=':{}\s]*)*))\1 *|}}/g;
		const match = completeSpan.exec(src);
		if(match) {
			//Find closing delimiter
			let blockCount = 0;
			let tags = {};
			let endTags = 0;
			let endToken = 0;
			let delim;
			while (delim = inlineRegex.exec(match[0])) {
				if(_.isEmpty(tags)) {
					tags = processStyleTags(delim[0].substring(2));
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
		const tags = token.tags;
		tags.classes = ['inline-block', tags.classes].join(' ').trim();
		return `<span` +
			`${tags.classes    ? ` class="${tags.classes}"` : ''}` +
			`${tags.id         ? ` id="${tags.id}"`         : ''}` +
			`${tags.styles     ? ` style="${Object.entries(tags.styles).map(([key, value])=>`${key}:${value};`).join(' ')}"` : ''}` +
			`${tags.attributes ? ` ${Object.entries(tags.attributes).map(([key, value])=>`${key}="${value}"`).join(' ')}`     : ''}` +
			`>${this.parser.parseInline(token.tokens)}</span>`; // parseInline to turn child tokens into HTML
	}
};

const mustacheDivs = {
	name  : 'mustacheDivs',
	level : 'block',
	start(src) { return src.match(/\n *{{[^{]/m)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		const completeBlock = /^ *{{[^\n}]* *\n.*\n *}}/s;                // Regex for the complete token
		const blockRegex = /^ *{{(?=((?:[:=](?:"['\w,\-+*/()#%=?.&:!@$^;:\[\]_= ]*"|[\w\-()#%.]*)|[^"=':{}\s]*)*))\1 *$|^ *}}$/gm;
		const match = completeBlock.exec(src);
		if(match) {
			//Find closing delimiter
			let blockCount = 0;
			let tags = {};
			let endTags = 0;
			let endToken = 0;
			let delim;
			while (delim = blockRegex.exec(match[0])?.[0].trim()) {
				if(_.isEmpty(tags)) {
					tags = processStyleTags(delim.substring(2));
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
		const tags = token.tags;
		tags.classes = ['block', tags.classes].join(' ').trim();
		return `<div` +
			`${tags.classes    ? ` class="${tags.classes}"` : ''}` +
			`${tags.id         ? ` id="${tags.id}"`         : ''}` +
			`${tags.styles     ? ` style="${Object.entries(tags.styles).map(([key, value])=>`${key}:${value};`).join(' ')}"` : ''}` +
			`${tags.attributes ? ` ${Object.entries(tags.attributes).map(([key, value])=>`${key}="${value}"`).join(' ')}` : ''}` +
			`>${this.parser.parse(token.tokens)}</div>`; // parse to turn child tokens into HTML
	}
};

const mustacheInjectInline = {
	name  : 'mustacheInjectInline',
	level : 'inline',
	start(src) { return src.match(/ *{[^{\n]/)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		const inlineRegex = /^ *{(?=((?:[:=](?:"['\w,\-+*/()#%=?.&:!@$^;:\[\]_= ]*"|[\w\-()#%.]*)|[^"=':{}\s]*)*))\1}/g;
		const match = inlineRegex.exec(src);
		if(match) {
			const lastToken = tokens[tokens.length - 1];
			if(!lastToken || lastToken.type == 'mustacheInjectInline')
				return false;

			const tags = processStyleTags(match[1]);
			lastToken.originalType = lastToken.type;
			lastToken.type         = 'mustacheInjectInline';
			lastToken.injectedTags = tags;
			return {
				type : 'mustacheInjectInline',            // Should match "name" above
				raw  : match[0],          // Text to consume from the source
				text : ''
			};
		}
	},
	renderer(token) {
		if(!token.originalType){
			return;
		}
		token.type = token.originalType;
		const text = this.parser.parseInline([token]);
		const originalTags = extractHTMLStyleTags(text);
		const injectedTags = token.injectedTags;
		const tags         = mergeHTMLTags(originalTags, injectedTags);
		const openingTag = /(<[^\s<>]+)[^\n<>]*(>.*)/s.exec(text);
		if(openingTag) {
			return `${openingTag[1]}` +
				`${tags.classes    ? ` class="${tags.classes}"` : ''}` +
				`${tags.id         ? ` id="${tags.id}"`         : ''}` +
				`${!_.isEmpty(tags.styles)     ? ` style="${Object.entries(tags.styles).map(([key, value])=>`${key}:${value};`).join(' ')}"` : ''}` +
				`${!_.isEmpty(tags.attributes) ? ` ${Object.entries(tags.attributes).map(([key, value])=>`${key}="${value}"`).join(' ')}` : ''}` +
				`${openingTag[2]}`; // parse to turn child tokens into HTML
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
			const inlineRegex = /^ *{(?=((?:[:=](?:"['\w,\-+*/()#%=?.&:!@$^;:\[\]_= ]*"|[\w\-+*/()#%.]*)|[^"=':{}\s]*)*))\1}/ym;
			const match = inlineRegex.exec(src);
			if(match) {
				const lastToken = tokens[tokens.length - 1];
				if(!lastToken || lastToken.type == 'mustacheInjectBlock')
					return false;

				lastToken.originalType = 'mustacheInjectBlock';
				lastToken.injectedTags = processStyleTags(match[1]);
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
			const originalTags = extractHTMLStyleTags(text);
			const injectedTags = token.injectedTags;
			const tags         = mergeHTMLTags(originalTags, injectedTags);
			const openingTag = /(<[^\s<>]+)[^\n<>]*(>.*)/s.exec(text);
			if(openingTag) {
				return `${openingTag[1]}` +
					`${tags.classes    ? ` class="${tags.classes}"` : ''}` +
					`${tags.id         ? ` id="${tags.id}"`         : ''}` +
					`${!_.isEmpty(tags.styles)     ? ` style="${Object.entries(tags.styles).map(([key, value])=>`${key}:${value};`).join(' ')}"` : ''}` +
					`${!_.isEmpty(tags.attributes) ? ` ${Object.entries(tags.attributes).map(([key, value])=>`${key}="${value}"`).join(' ')}` : ''}` +
					`${openingTag[2]}`; // parse to turn child tokens into HTML
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

const forcedParagraphBreaks = {
	name  : 'hardBreaks',
	level : 'block',
	start(src) { return src.match(/\n:+$/m)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		const regex  = /^(:+)(?:\n|$)/ym;
		const match = regex.exec(src);
		if(match?.length) {
			return {
				type   : 'hardBreaks', // Should match "name" above
				raw    : match[0],     // Text to consume from the source
				length : match[1].length,
				text   : ''
			};
		}
	},
	renderer(token) {
		return `<div class='blank'></div>\n`.repeat(token.length);
	}
};

// Emoji options
// To add more icon fonts, need to do these things
// 1) Add the font file as .woff2 to themes/fonts/iconFonts folder
// 2) Create a .less file mapping CSS class names to the font character
// 3) Create a .js file mapping Autosuggest names to CSS class names
// 4) Import the .less file into shared/naturalcrit/codeEditor/codeEditor.less
// 5) Import the .less file into themes/V3/blank.style.less
// 6) Import the .js file to shared/naturalcrit/codeEditor/autocompleteEmoji.js and add to `emojis` object
// 7) Import the .js file here to markdown.js, and add to `emojis` object below
const MarkedEmojiOptions = {
	emojis : {
		...diceFont,
		...elderberryInn,
		...fontAwesome,
		...gameIcons,
	},
	renderer : (token)=>`<i class="${token.emoji}"></i>`
};

const tableTerminators = [
	`:+\\n`,                // hardBreak
	` *{[^\n]+}`,           // blockInjector
	` *{{[^{\n]*\n.*?\n}}`  // mustacheDiv
];

Marked.use(markedVariables());
Marked.use(MarkedDefinitionLists());
Marked.use({ extensions: [forcedParagraphBreaks, mustacheSpans, mustacheDivs, mustacheInjectInline] });
Marked.use(mustacheInjectBlock);
Marked.use(MarkedAlignedParagraphs());
Marked.use(MarkedSubSuperText());
Marked.use(MarkedNonbreakingSpaces());
Marked.use({ renderer: renderer, tokenizer: tokenizer, mangle: false });
Marked.use(MarkedExtendedTables({ interruptPatterns: tableTerminators }), MarkedGFMHeadingId({ globalSlugs: true }),
	MarkedSmartypantsLite(), MarkedEmojis(MarkedEmojiOptions));

function cleanUrl(href) {
	try {
		href = encodeURI(href).replace(/%25/g, '%');
	} catch {
		return null;
	}
	return href;
}

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

	const id         = _.remove(tags, (tag)=>tag.startsWith('#')).map((tag)=>tag.slice(1))[0]        || null;
	const classes    = _.remove(tags, (tag)=>(!tag.includes(':')) && (!tag.includes('='))).join(' ') || null;
	const attributes = _.remove(tags, (tag)=>(tag.includes('='))).map((tag)=>tag.replace(/="?([^"]*)"?/g, '="$1"'))
		?.filter((attr)=>!attr.startsWith('class="') && !attr.startsWith('style="') && !attr.startsWith('id="'))
		.reduce((obj, attr)=>{
			const index = attr.indexOf('=');
			let [key, value] = [attr.substring(0, index), attr.substring(index + 1)];
			value = value.replace(/"/g, '');
			obj[key.trim()] = value.trim();
			return obj;
		}, {}) || null;
	const styles = tags?.length ? tags.reduce((styleObj, style)=>{
		const index = style.indexOf(':');
		const [key, value] = [style.substring(0, index), style.substring(index + 1)];
		styleObj[key.trim()] = value.replace(/"?([^"]*)"?/g, '$1').trim();
		return styleObj;
	}, {}) : null;

	return {
		id         : id,
		classes    : classes,
		styles     : _.isEmpty(styles)     ? null : styles,
		attributes : _.isEmpty(attributes) ? null : attributes
	};
};

//Given a string representing an HTML element, extract all of its properties (id, class, style, and other attributes)
const extractHTMLStyleTags = (htmlString)=>{
	const firstElementOnly = htmlString.split('>')[0];
	const id         = firstElementOnly.match(/id="([^"]*)"/)?.[1]    || null;
	const classes    = firstElementOnly.match(/class="([^"]*)"/)?.[1] || null;
	const styles     = firstElementOnly.match(/style="([^"]*)"/)?.[1]
		?.split(';').reduce((styleObj, style)=>{
			if(style.trim() === '') return styleObj;
			const index = style.indexOf(':');
			const [key, value] = [style.substring(0, index), style.substring(index + 1)];
			styleObj[key.trim()] = value.trim();
			return styleObj;
		}, {}) || null;
	const attributes = firstElementOnly.match(/[a-zA-Z]+="[^"]*"/g)
		?.filter((attr)=>!attr.startsWith('class="') && !attr.startsWith('style="') && !attr.startsWith('id="'))
		.reduce((obj, attr)=>{
			const index = attr.indexOf('=');
			const [key, value] = [attr.substring(0, index), attr.substring(index + 1)];
			obj[key.trim()] = value.replace(/"/g, '');
			return obj;
		}, {}) || null;

	return {
		id         : id,
		classes    : classes,
		styles     : _.isEmpty(styles)     ? null : styles,
		attributes : _.isEmpty(attributes) ? null : attributes
	};
};

const mergeHTMLTags = (originalTags, newTags)=>{
	return {
		id         : newTags.id || originalTags.id || null,
		classes    : [originalTags.classes, newTags.classes].join(' ').trim() || null,
		styles     : Object.assign(originalTags.styles     ?? {}, newTags.styles     ?? {}),
		attributes : Object.assign(originalTags.attributes ?? {}, newTags.attributes ?? {})
	};
};

const Markdown = {
	marked : Marked,
	render : (rawBrewText, pageNumber=0)=>{
		setMarkedVariablePage(pageNumber);

		const lastPageNumber = pageNumber > 0 ? getMarkedVariable('HB_pageNumber', pageNumber - 1) : 0;
		setMarkedVariable('HB_pageNumber',  //Add document variables for this page
			!isNaN(Number(lastPageNumber)) ? Number(lastPageNumber) + 1 : lastPageNumber,
			pageNumber);

		if(pageNumber==0) MarkedGFMResetHeadingIDs();

		rawBrewText = rawBrewText.replace(/^\\column(?:break)?$/gm, `\n<div class='columnSplit'></div>\n`);

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

export default Markdown;

