// Reborn AST schema (Wave 2: read-only)
//
// A Document is composed of Pages; each Page is an array of Block nodes.
// Inline runs are flat arrays of { text, marks } where marks is a subset of
// ['strong', 'em', 'underline', 'link']. Link runs additionally carry { href }.
//
// This file deliberately avoids a class hierarchy. Plain objects are easier to
// hand-author for the demo and easier to swap for a ProseMirror schema later.

/**
 * @typedef {Object} InlineRun
 * @property {string} text
 * @property {Array<'strong'|'em'|'underline'|'link'>} [marks]
 * @property {string} [href]   // present when 'link' is in marks
 */

/**
 * @typedef {Object} ParagraphBlock
 * @property {'paragraph'} type
 * @property {InlineRun[]} content
 */

/**
 * @typedef {Object} HeadingBlock
 * @property {'heading'} type
 * @property {1|2|3|4|5} level
 * @property {InlineRun[]} content
 * @property {string} [id]
 */

/**
 * @typedef {Object} ListBlock
 * @property {'list'} type
 * @property {'bullet'|'ordered'} style
 * @property {Array<{ content: InlineRun[], children?: ListBlock }>} items
 */

/**
 * @typedef {Object} TableBlock
 * @property {'table'} type
 * @property {InlineRun[][]} headers   // one row of header cells
 * @property {InlineRun[][][]} rows    // body rows; each row is an array of cells
 */

/**
 * @typedef {Object} NoteBlock
 * @property {'note'} type
 * @property {InlineRun[]} title
 * @property {ParagraphBlock[]} body
 */

/**
 * @typedef {Object} DescriptiveBlock
 * @property {'descriptive'} type
 * @property {InlineRun[]} title
 * @property {ParagraphBlock[]} body
 */

/**
 * @typedef {Object} QuoteBlock
 * @property {'quote'} type
 * @property {InlineRun[][]} paragraphs  // each entry is one <p> of inline runs
 * @property {InlineRun[]} [attribution]
 */

/**
 * @typedef {Object} HrBlock
 * @property {'hr'} type
 */

/**
 * @typedef {Object} TraitEntry
 * @property {string} name
 * @property {InlineRun[]} text
 */

/**
 * @typedef {Object} StatBlock
 * @property {'statBlock'} type
 * @property {string} variant
 * @property {string} name
 * @property {string} size
 * @property {string} creatureType
 * @property {string} alignment
 * @property {number} armorClass
 * @property {string} [armorClassNote]
 * @property {number} hitPoints
 * @property {string} hitDice
 * @property {string} speed
 * @property {{ str: number, dex: number, con: number, int: number, wis: number, cha: number }} abilities
 * @property {string} [saves]
 * @property {string} [skills]
 * @property {string} [damageResistances]
 * @property {string} [damageImmunities]
 * @property {string} [conditionImmunities]
 * @property {string} [senses]
 * @property {string} [languages]
 * @property {string} challenge
 * @property {TraitEntry[]} [traits]
 * @property {TraitEntry[]} [actions]
 * @property {TraitEntry[]} [legendaryActions]
 * @property {TraitEntry[]} [lairActions]
 * @property {TraitEntry[]} [regionalEffects]
 */

/**
 * @typedef {ParagraphBlock|HeadingBlock|ListBlock|TableBlock|NoteBlock|DescriptiveBlock|QuoteBlock|HrBlock|StatBlock} Block
 */

/**
 * @typedef {Object} Page
 * @property {Block[]} blocks
 */

/**
 * @typedef {Object} DocumentMeta
 * @property {string} title
 * @property {string} [author]
 * @property {string} [theme]      // e.g. '5ePHB'
 * @property {string} [pageSize]   // e.g. 'Letter'
 */

/**
 * @typedef {Object} BrewDocument
 * @property {DocumentMeta} metadata
 * @property {Page[]} pages
 */

// ---- factories (unmarked plain text helper, etc.) -------------------------

/** @returns {InlineRun} */
export const t = (text, marks = [], extras = {})=>({ text, marks, ...extras });

/** Strong text run */
export const strong = (text)=>t(text, ['strong']);
/** Italic text run */
export const em = (text)=>t(text, ['em']);
/** Italic + strong (the canonical "trait name" run inside stat blocks) */
export const emStrong = (text)=>t(text, ['em', 'strong']);
/** Underline text run */
export const underline = (text)=>t(text, ['underline']);
/** Hyperlink run */
export const link = (text, href)=>t(text, ['link'], { href });

/** Sugar: convert a plain string to a single-run inline. */
export const inline = (s)=>[t(s)];

export const paragraph = (...content)=>({ type: 'paragraph', content: content.flat() });
export const heading = (level, ...content)=>({ type: 'heading', level, content: content.flat() });
export const hr = ()=>({ type: 'hr' });

export const bulletList = (...items)=>({
	type  : 'list',
	style : 'bullet',
	items : items.map((i)=>(Array.isArray(i) ? { content: i } : i)),
});
export const orderedList = (...items)=>({
	type  : 'list',
	style : 'ordered',
	items : items.map((i)=>(Array.isArray(i) ? { content: i } : i)),
});

export const table = (headers, rows)=>({ type: 'table', headers, rows });

export const note = (title, body)=>({
	type : 'note',
	title,
	body : body.map((b)=>(Array.isArray(b) ? { type: 'paragraph', content: b } : b)),
});
export const descriptive = (title, body)=>({
	type : 'descriptive',
	title,
	body : body.map((b)=>(Array.isArray(b) ? { type: 'paragraph', content: b } : b)),
});
export const quote = (paragraphs, attribution)=>({
	type : 'quote',
	paragraphs,
	attribution,
});

export const statBlock = (fields)=>({ type: 'statBlock', variant: '5e', ...fields });

/** Compute the 5e ability modifier for a raw score. */
export const abilityMod = (score)=>{
	const mod = Math.floor((score - 10) / 2);
	return mod >= 0 ? `+${mod}` : `${mod}`;
};

/** Format a stat-block ability cell as e.g. "12 (+1)". */
export const abilityCell = (score)=>`${score} (${abilityMod(score)})`;
