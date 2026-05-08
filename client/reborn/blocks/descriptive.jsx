import React from 'react';
import Inline from '../renderer/Inline.jsx';
import { runsToPmInline, pmInlineToRuns, runsToMarkdown } from './_helpers.js';

// Darker-frame descriptive box. Same structure as `note` but distinct CSS class
// — kept as a separate manifest because they're distinct block types (the
// reader sees a different container) even though their wiring rhymes.

export default {
	type         : 'descriptive',
	label        : 'Descriptive Box',
	category     : 'Callouts',
	icon         : 'BookOpen',
	slashAliases : ['descriptive', 'box', 'flavor', 'readout'],
	keepTogether : true,

	createAst   : (overrides = {})=>({ type: 'descriptive', title: [{ text: 'Descriptive' }], body: [{ type: 'paragraph', content: [] }], ...overrides }),
	validateAst : (n)=>{
		const errs = [];
		if(!Array.isArray(n.title)) errs.push('descriptive.title must be an array');
		if(!Array.isArray(n.body)) errs.push('descriptive.body must be an array');
		return errs;
	},

	pmNode : {
		kind  : 'group',
		name  : 'descriptive',
		nodes : {
			descriptive : {
				content  : 'descriptiveTitle paragraph+',
				group    : 'block',
				defining : true,
				parseDOM : [{ tag: 'div.descriptive' }],
				toDOM    : ()=>['div', { class: 'descriptive' }, 0],
			},
			descriptiveTitle : {
				content  : 'inline*',
				defining : true,
				parseDOM : [{ tag: 'div.descriptive > h5' }],
				toDOM    : ()=>['h5', 0],
			},
		},
	},

	Render : ({ block })=>(
		<div className='descriptive'>
			<h5><Inline runs={block.title} /></h5>
			{(block.body || []).map((para, i)=>(
				<p key={i}><Inline runs={Array.isArray(para) ? para : para.content} /></p>
			))}
		</div>
	),

	astToPm : (block, schema)=>{
		const title = schema.nodes.descriptiveTitle.create(null, runsToPmInline(block.title, schema));
		const paras = (block.body || []).map((b)=>(
			Array.isArray(b)
				? schema.nodes.paragraph.create(null, runsToPmInline(b, schema))
				: schema.nodes.paragraph.create(null, runsToPmInline(b.content, schema))
		));
		if(!paras.length) paras.push(schema.nodes.paragraph.create());
		return schema.nodes.descriptive.create(null, [title, ...paras]);
	},
	pmToAst : (node, schema)=>{
		let title = [];
		const body = [];
		node.forEach((child)=>{
			if(child.type === schema.nodes.descriptiveTitle){
				title = pmInlineToRuns(child);
			} else if(child.type === schema.nodes.paragraph){
				body.push({ type: 'paragraph', content: pmInlineToRuns(child) });
			}
		});
		return { type: 'descriptive', title, body };
	},

	exportMarkdown : (n)=>{
		const out = [`{{descriptive`, `##### ${runsToMarkdown(n.title)}`];
		(n.body || []).forEach((p)=>{
			const runs = Array.isArray(p) ? p : p.content;
			out.push(runsToMarkdown(runs));
		});
		out.push('}}');
		return out.join('\n');
	},

	importPriority : 78,
	importMarkdown : (lines, i)=>{
		// Recognize `{{descriptive` ... `}}`, with an `##### Title` first line.
		const head = (lines[i] || '').trim();
		if(head !== '{{descriptive') return null;
		let j = i + 1;
		let title = [{ text: 'Descriptive' }];
		const body = [];
		// Skip blank lines; first non-blank `##### …` becomes the title.
		while (j < lines.length && lines[j].trim() === '') j++;
		const tm = /^#####\s+(.*)$/.exec(lines[j] || '');
		if(tm){ title = [{ text: tm[1] }]; j++; }
		while (j < lines.length){
			const line = lines[j];
			if(line.trim() === '}}'){ j++; break; }
			if(line.trim() !== ''){
				body.push({ type: 'paragraph', content: [{ text: line }] });
			}
			j++;
		}
		if(!body.length) body.push({ type: 'paragraph', content: [] });
		return {
			node    : { type: 'descriptive', title, body },
			advance : j - i,
		};
	},
};
