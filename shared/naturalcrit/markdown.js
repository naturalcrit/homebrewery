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
		const inlineRegex = /{{(?::(?:"[\w,\-()#%. ]*"|[\w\,\-()#%.]*)|[^"'{}\s])*\s*|}}/g;
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
					tokens : this.inlineTokens(text)    // inlineTokens to process **bold**, *italics*, etc.
				};
			}
		}
	},
	renderer(token) {
		return `<span class="inline-block${token.tags}>${this.parseInline(token.tokens)}</span>`; // parseInline to turn child tokens into HTML
	}
};

const mustacheDivs = {
	name  : 'mustacheDivs',
	level : 'block',
	start(src) { return src.match(/\n *{{[^{]/m)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		const completeBlock = /^ *{{[^\n}]* *\n.*\n *}}/s;                // Regex for the complete token
		const blockRegex = /^ *{{(?::(?:"[\w,\-()#%. ]*"|[\w\,\-()#%.]*)|[^"'{}\s])* *$|^ *}}$/gm;
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
					tokens : this.inline(this.blockTokens(text))
				};
			}
		}
	},
	renderer(token) {
		return `<div class="block${token.tags}>${this.parse(token.tokens)}</div>`; // parseInline to turn child tokens into HTML
	}
};

const mustacheInjectInline = {
	name  : 'mustacheInjectInline',
	level : 'inline',
	start(src) { return src.match(/ *{[^{\n]/)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		const inlineRegex = /^ *{((?::(?:"[\w,\-()#%. ]*"|[\w\,\-()#%.]*)|[^"'{}\s])*)}/g;
		const match = inlineRegex.exec(src);
		if(match) {
			const lastToken = tokens[tokens.length - 1];
			if(!lastToken)
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
		const text = this.parseInline([token]);
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
			const inlineRegex = /^ *{((?::(?:"[\w,\-()#%. ]*"|[\w\,\-()#%.]*)|[^"'{}\s])*)}/ym;
			const match = inlineRegex.exec(src);
			if(match) {
				const lastToken = tokens[tokens.length - 1];
				if(!lastToken)
					return false;

				lastToken.originalType = 'mustacheInjectBlock';
				lastToken.tags         = ` ${processStyleTags(match[1])}`;
				return {
					type : 'text',            // Should match "name" above
					raw  : match[0],          // Text to consume from the source
					text : ''
				};
			}
		},
		renderer(token) {
			token.type = token.originalType;
			const text = this.parse([token]);
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

const definitionLists = {
	name  : 'definitionLists',
	level : 'block',
	start(src) { return src.match(/^.*?::.*/m)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		const regex = /^([^\n]*?)::([^\n]*)/ym;
		let match;
		let endIndex = 0;
		const definitions = [];
		while (match = regex.exec(src)) {
			definitions.push({
				dt : this.inlineTokens(match[1].trim()),
				dd : this.inlineTokens(match[2].trim())
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
		return `<dl>
						${token.definitions.reduce((html, def)=>{
		return `${html}<dt>${this.parseInline(def.dt)}</dt>`
									 + `<dd>${this.parseInline(def.dd)}</dd>\n`;
	}, '')}
		 				</dl>`;
	}
};

const spanTable = {
	name  : 'spanTable',
	level : 'block',                                   // Is this a block-level or inline-level tokenizer?
	start(src) { return src.match(/^\n *([^\n ].*\|.*)\n/)?.index; },  // Hint to Marked.js to stop and check for a match
	tokenizer(src, tokens) {
		//const regex = this.tokenizer.rules.block.table;
		const regex = new RegExp('^ *([^\\n ].*\\|.*\\n(?: *[^\\s].*\\n)*?)' // Header
		    + ' {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)\\|?' // Align
		    + '(?:\\n *((?:(?!\\n| {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})' // Cells
				+ '(?:\\n+|$)| {0,3}#{1,6} | {0,3}>| {4}[^\\n]| {0,3}(?:`{3,}'
				+ '(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n| {0,3}(?:[*+-]|1[.)]) |'
				+ '<\\/?(?:address|article|aside|base|basefont|blockquote|body|'
				+ 'caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?: +|\\n|\\/?>)|<(?:script|pre|style|textarea|!--)).*(?:\\n|$))*)\\n*|$)'); // Cells
		const cap = regex.exec(src);

		if(cap) {
			const item = {
				type   : 'spanTable',
				header : cap[1].replace(/\n$/, '').split('\n'),
				align  : cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
				rows   : cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
			};

			// Get first header row to determine how many columns
			item.header[0] = splitCells(item.header[0]);

			const colCount = item.header[0].reduce((length, header)=>{
				return length + header.colspan;
			}, 0);

			if(colCount === item.align.length) {
				item.raw = cap[0];

				let i, j, k, row;

				// Get alignment row (:---:)
				let l = item.align.length;

				for (i = 0; i < l; i++) {
					if(/^ *-+: *$/.test(item.align[i])) {
						item.align[i] = 'right';
					} else if(/^ *:-+: *$/.test(item.align[i])) {
						item.align[i] = 'center';
					} else if(/^ *:-+ *$/.test(item.align[i])) {
						item.align[i] = 'left';
					} else {
						item.align[i] = null;
					}
				}

				// Get any remaining header rows
				l = item.header.length;
				for (i = 1; i < l; i++) {
					item.header[i] = splitCells(item.header[i], colCount, item.header[i-1]);
				}

				// Get main table cells
				l = item.rows.length;
				for (i = 0; i < l; i++) {
					item.rows[i] = splitCells(item.rows[i], colCount, item.rows[i-1]);
				}

				// header child tokens
				l = item.header.length;
				for (j = 0; j < l; j++) {
					row = item.header[j];
					for (k = 0; k < row.length; k++) {
						row[k].tokens = [];
						this.inlineTokens(row[k].text, row[k].tokens);
					}
				}

				// cell child tokens
				l = item.rows.length;
				for (j = 0; j < l; j++) {
					row = item.rows[j];
					for (k = 0; k < row.length; k++) {
						row[k].tokens = [];
						this.inlineTokens(row[k].text, row[k].tokens);
					}
				}
				return item;
			}
		}
	},
	renderer(token) {
		let i, j, row, cell, col, text;
		let output = `<table>`;
		output += `<thead>`;
		for (i = 0; i < token.header.length; i++) {
			row = token.header[i];
			let col = 0;
			output += `<tr>`;
			for (j = 0; j < row.length; j++) {
				cell = row[j];
				text = this.parseInline(cell.tokens);
				output += getTableCell(text, cell, 'th', token.align[col]);
				col += cell.colspan;
			}
			output += `</tr>`;
		}
		output += `</thead>`;
		if(token.rows.length) {
			output += `<tbody>`;
			for (i = 0; i < token.rows.length; i++) {
				row = token.rows[i];
				col = 0;
				output += `<tr>`;
				for (j = 0; j < row.length; j++) {
					cell = row[j];
					text = this.parseInline(cell.tokens);
					output += getTableCell(text, cell, 'td', token.align[col]);
					col += cell.colspan;
				}
				output += `</tr>`;
			}
			output += `</tbody>`;
		}
		output += `</table>`;
		return output;
	}
};

const getTableCell = (text, cell, type, align)=>{
	if(!cell.rowspan) {
		return '';
	}
	const tag = `<${type}`
						+ `${cell.colspan > 1 ? ` colspan=${cell.colspan}` : ''}`
						+ `${cell.rowspan > 1 ? ` rowspan=${cell.rowspan}` : ''}`
						+ `${align ? ` align=${align}` : ''}>`;
	return `${tag + text}</${type}>\n`;
};

const splitCells = (tableRow, count, prevRow = [])=>{
	const cells = [...tableRow.matchAll(/(?:[^|\\]|\\.?)+(?:\|+|$)/g)].map((x)=>x[0]);

	// Remove first/last cell in a row if whitespace only and no leading/trailing pipe
	if(!cells[0]?.trim()) { cells.shift(); }
	if(!cells[cells.length - 1]?.trim()) { cells.pop(); }

	let numCols = 0;
	let i, j, trimmedCell, prevCell, prevCols;

	for (i = 0; i < cells.length; i++) {
		trimmedCell = cells[i].split(/\|+$/)[0];
		cells[i] = {
			rowspan : 1,
			colspan : Math.max(cells[i].length - trimmedCell.length, 1),
			text    : trimmedCell.trim().replace(/\\\|/g, '|')
			// display escaped pipes as normal character
		};

		// Handle Rowspan
		if(trimmedCell.slice(-1) == '^' && prevRow.length) {
			// Find matching cell in previous row
			prevCols = 0;
			for (j = 0; j < prevRow.length; j++) {
				prevCell = prevRow[j];
				if((prevCols == numCols) && (prevCell.colspan == cells[i].colspan)) {
					// merge into matching cell in previous row (the "target")
					cells[i].rowSpanTarget = prevCell.rowSpanTarget ?? prevCell;
					cells[i].rowSpanTarget.text += ` ${cells[i].text.slice(0, -1)}`;
					cells[i].rowSpanTarget.rowspan += 1;
					cells[i].rowspan = 0;
					break;
				}
				prevCols += prevCell.colspan;
				if(prevCols > numCols)
					break;
			}
		}

		numCols += cells[i].colspan;
	}

	// Force main cell rows to match header column count
	if(numCols > count) {
		cells.splice(count);
	} else {
		while (numCols < count) {
			cells.push({
				colspan : 1,
				text    : ''
			});
			numCols += 1;
		}
	}
	return cells;
};

Markdown.use({ extensions: [mustacheSpans, mustacheDivs, mustacheInjectInline, definitionLists, spanTable] });
Markdown.use(mustacheInjectBlock);
Markdown.use({ smartypants: true });

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
	//split tags up. quotes can only occur right after colons.
	//TODO: can we simplify to just split on commas?
	const tags = string.match(/(?:[^, ":]+|:(?:"[^"]*"|))+/g);

	if(!tags)	return '"';

	const id      = _.remove(tags, (tag)=>tag.startsWith('#')).map((tag)=>tag.slice(1))[0];
	const classes = _.remove(tags, (tag)=>!tag.includes(':'));
	const styles  = tags.map((tag)=>tag.replace(/:"?([^"]*)"?/g, ':$1;'));
	return `${classes.join(' ')}" ${id ? `id="${id}"` : ''} ${styles.length ? `style="${styles.join(' ')}"` : ''}`;
};

module.exports = {
	marked : Markdown,
	render : (rawBrewText)=>{
		rawBrewText = rawBrewText.replace(/^\\column$/gm, `\n<div class='columnSplit'></div>\n`)
														 .replace(/^(:+)$/gm, (match)=>`${`<div class='blank'></div>`.repeat(match.length)}\n`);
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
