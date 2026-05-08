import React from 'react';
import Inline from '../renderer/Inline.jsx';
import { runsToPmInline, pmInlineToRuns, runsToMarkdown } from './_helpers.js';

// Bronze-bordered "Note" callout. The PM contribution is two nodes: `note`
// (the wrapper) and `noteTitle` (the inline-only title cell). Both are
// registered through the `group` shape so the registry sees them as a unit.

export default {
	type         : 'note',
	label        : 'Note',
	category     : 'Callouts',
	icon         : 'Info',
	slashAliases : ['note', 'callout', 'admonition', 'tip'],
	keepTogether : true,

	createAst   : (overrides = {})=>({ type: 'note', title: [{ text: 'Note' }], body: [{ type: 'paragraph', content: [] }], ...overrides }),
	validateAst : (n)=>{
		const errs = [];
		if(!Array.isArray(n.title)) errs.push('note.title must be an array');
		if(!Array.isArray(n.body)) errs.push('note.body must be an array');
		return errs;
	},

	pmNode : {
		kind  : 'group',
		name  : 'note',
		nodes : {
			note : {
				content  : 'noteTitle paragraph+',
				group    : 'block',
				defining : true,
				parseDOM : [{ tag: 'div.note' }],
				toDOM    : ()=>['div', { class: 'note' }, 0],
			},
			noteTitle : {
				content  : 'inline*',
				defining : true,
				parseDOM : [{ tag: 'div.note > h5' }],
				toDOM    : ()=>['h5', 0],
			},
		},
	},

	Render : ({ block })=>(
		<div className='note'>
			<h5><Inline runs={block.title} /></h5>
			{(block.body || []).map((para, i)=>(
				<p key={i}><Inline runs={Array.isArray(para) ? para : para.content} /></p>
			))}
		</div>
	),

	astToPm : (block, schema)=>{
		const title = schema.nodes.noteTitle.create(null, runsToPmInline(block.title, schema));
		const paras = (block.body || []).map((b)=>(
			Array.isArray(b)
				? schema.nodes.paragraph.create(null, runsToPmInline(b, schema))
				: schema.nodes.paragraph.create(null, runsToPmInline(b.content, schema))
		));
		if(!paras.length) paras.push(schema.nodes.paragraph.create());
		return schema.nodes.note.create(null, [title, ...paras]);
	},
	pmToAst : (node, schema)=>{
		let title = [];
		const body = [];
		node.forEach((child)=>{
			if(child.type === schema.nodes.noteTitle){
				title = pmInlineToRuns(child);
			} else if(child.type === schema.nodes.paragraph){
				body.push({ type: 'paragraph', content: pmInlineToRuns(child) });
			}
		});
		return { type: 'note', title, body };
	},

	exportMarkdown : (n)=>{
		const out = [`> ##### ${runsToMarkdown(n.title)}`];
		(n.body || []).forEach((p)=>{
			const runs = Array.isArray(p) ? p : p.content;
			out.push(`> ${runsToMarkdown(runs)}`);
		});
		return out.join('\n');
	},

	// Note's import marker is a `> ##### Title` opener, distinguishing it from
	// the plain `> ` blockquote (which becomes a `quote`). Priority is higher
	// than blockquote so it claims the run before the quote importer sees it.
	importPriority : 75,
	importMarkdown : (lines, i)=>{
		const head = lines[i] || '';
		const titleMatch = /^>\s+#####\s+(.*)$/.exec(head);
		if(!titleMatch) return null;
		const body = [];
		let j = i + 1;
		while (j < lines.length && /^>\s?/.test(lines[j])){
			const cont = lines[j].replace(/^>\s?/, '');
			if(cont.trim() === '') { j++; continue; }
			body.push({ type: 'paragraph', content: [{ text: cont }] });
			j++;
		}
		if(!body.length) body.push({ type: 'paragraph', content: [] });
		return {
			node    : { type: 'note', title: [{ text: titleMatch[1] }], body },
			advance : j - i,
		};
	},
};
