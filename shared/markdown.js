
/* eslint-disable max-lines */
import _                        from 'lodash';
import { marked as Marked }     from 'marked';
import MarkedExtendedTables     from 'marked-extended-tables';
import MarkedDefinitionLists    from 'marked-definition-lists';
import MarkedAlignedParagraphs  from 'marked-alignment-paragraphs';
import MarkedNonbreakingSpaces  from 'marked-nonbreaking-spaces';
import MarkedSubSuperText       from 'marked-subsuper-text';
import MarkedMustache           from 'marked-mustache';
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
	// if(self) {
	// 	out += ' target="_self"';
	// }
	out += `>${text}</a>`;
	return out;
};

// Expose `src` attribute as `--HB_src` to make the URL accessible via CSS
renderer.image = function (token) {
	const { href, title, text } = token;
	if(href === null)
		return text;

	let out = `<img loading="lazy" src="${href}" alt="${text}" style="--HB_src:url(${href});"`;
	if(title)
		out += ` title="${title}"`;

	out += '>';
	return out;
};

// Disable default reflink behavior, as it steps on our variables extension
tokenizer.def = function () {
	return undefined;
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
Marked.use({ extensions: [forcedParagraphBreaks] });
Marked.use(MarkedMustache());
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

