import React from 'react';
import Inline from '../renderer/Inline.jsx';
import { runsToPmInline, pmInlineToRuns, runsToMarkdown } from './_helpers.js';

export default {
	type         : 'heading',
	label        : 'Heading',
	category     : 'Text',
	icon         : 'Heading',
	slashAliases : ['h1', 'h2', 'h3', 'h4', 'h5', 'title', 'chapter', 'section'],

	createAst   : (overrides = {})=>({ type: 'heading', level: 1, content: [], ...overrides }),
	validateAst : (n)=>{
		const errs = [];
		if(typeof n.level !== 'number' || n.level < 1 || n.level > 5) errs.push('heading.level must be 1..5');
		if(!Array.isArray(n.content)) errs.push('heading.content must be an array');
		return errs;
	},

	pmNode : {
		kind : 'standard',
		spec : {
			attrs    : { level: { default: 1 }, id: { default: null } },
			content  : 'inline*',
			group    : 'block',
			defining : true,
			parseDOM : [
				{ tag: 'h1', attrs: { level: 1 } },
				{ tag: 'h2', attrs: { level: 2 } },
				{ tag: 'h3', attrs: { level: 3 } },
				{ tag: 'h4', attrs: { level: 4 } },
				{ tag: 'h5', attrs: { level: 5 } },
			],
			toDOM : (node)=>{
				const a = {};
				if(node.attrs.id) a.id = node.attrs.id;
				return [`h${node.attrs.level}`, a, 0];
			},
		},
	},

	Render : ({ block })=>{
		const Tag = `h${block.level}`;
		return <Tag id={block.id}><Inline runs={block.content} /></Tag>;
	},

	astToPm : (block, schema)=>schema.nodes.heading.create(
		{ level: block.level, id: block.id || null },
		runsToPmInline(block.content, schema),
	),
	pmToAst : (node)=>{
		const out = { type: 'heading', level: node.attrs.level, content: pmInlineToRuns(node) };
		if(node.attrs.id) out.id = node.attrs.id;
		return out;
	},

	exportMarkdown : (n)=>`${'#'.repeat(n.level)} ${runsToMarkdown(n.content)}`,
	importPriority : 90,
	importMarkdown : (lines, i)=>{
		const m = /^(#{1,5})\s+(.*)$/.exec(lines[i] || '');
		if(!m) return null;
		return {
			node    : { type: 'heading', level: m[1].length, content: [{ text: m[2] }] },
			advance : 1,
		};
	},
};
