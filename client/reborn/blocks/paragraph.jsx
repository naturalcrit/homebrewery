import React from 'react';
import Inline from '../renderer/Inline.jsx';
import { runsToPmInline, pmInlineToRuns, runsToMarkdown } from './_helpers.js';

export default {
	type         : 'paragraph',
	label        : 'Paragraph',
	category     : 'Text',
	icon         : 'Text',
	slashAliases : ['p', 'body'],

	createAst   : (overrides = {})=>({ type: 'paragraph', content: [], ...overrides }),
	validateAst : (n)=>(Array.isArray(n.content) ? [] : ['paragraph.content must be an array']),

	pmNode : {
		kind : 'standard',
		spec : {
			content  : 'inline*',
			group    : 'block',
			parseDOM : [{ tag: 'p' }],
			toDOM    : ()=>['p', 0],
		},
	},

	Render : ({ block })=><p><Inline runs={block.content} /></p>,

	astToPm : (block, schema)=>schema.nodes.paragraph.create(null, runsToPmInline(block.content, schema)),
	pmToAst : (node)=>({ type: 'paragraph', content: pmInlineToRuns(node) }),

	exportMarkdown : (n)=>runsToMarkdown(n.content),
	// Paragraph is the catch-all importer (lowest priority): a non-empty line
	// that no other importer matched becomes a one-line paragraph.
	importPriority : 1,
	importMarkdown : (lines, i)=>{
		const line = lines[i];
		if(line == null) return null;
		if(line.trim() === '') return null;
		return { node: { type: 'paragraph', content: [{ text: line }] }, advance: 1 };
	},
};
