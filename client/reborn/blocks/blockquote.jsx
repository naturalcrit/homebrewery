import React from 'react';
import Inline from '../renderer/Inline.jsx';
import { runsToPmInline, pmInlineToRuns, runsToMarkdown } from './_helpers.js';

// "Quote" callout. AST type is `quote`, PM node is `blockquote` (so PM's
// built-in wrapping commands keep working). The renderer emits the canonical
// .quote frame; an optional trailing paragraph is the attribution.

export default {
	type         : 'quote',
	label        : 'Quote',
	category     : 'Callouts',
	icon         : 'Quote',
	slashAliases : ['blockquote', 'pull', 'epigraph'],
	keepTogether : true,

	createAst   : (overrides = {})=>({ type: 'quote', paragraphs: [[]], ...overrides }),
	validateAst : (n)=>(Array.isArray(n.paragraphs) ? [] : ['quote.paragraphs must be an array']),

	pmNode : {
		kind : 'standard',
		spec : {
			attrs    : { hasAttribution: { default: false } },
			content  : 'paragraph+',
			group    : 'block',
			defining : true,
			parseDOM : [{ tag: 'div.quote' }, { tag: 'blockquote' }],
			toDOM    : (node)=>{
				const a = { class: 'quote' };
				if(node.attrs.hasAttribution) a['data-has-attribution'] = 'true';
				return ['div', a, 0];
			},
		},
	},
	pmName : 'blockquote',

	Render : ({ block })=>(
		<div className='quote'>
			{(block.paragraphs || []).map((p, i)=><p key={i}><Inline runs={p} /></p>)}
			{block.attribution && <p className='attribution'><Inline runs={block.attribution} /></p>}
		</div>
	),

	astToPm : (block, schema)=>{
		const paras = (block.paragraphs || []).map((p)=>(
			schema.nodes.paragraph.create(null, runsToPmInline(p, schema))
		));
		if(block.attribution){
			paras.push(schema.nodes.paragraph.create(null, runsToPmInline(block.attribution, schema)));
		}
		if(!paras.length){
			paras.push(schema.nodes.paragraph.create());
		}
		return schema.nodes.blockquote.create({ hasAttribution: !!block.attribution }, paras);
	},
	pmToAst : (node)=>{
		const paras = [];
		node.forEach((p)=>paras.push(pmInlineToRuns(p)));
		const out = { type: 'quote', paragraphs: paras };
		if(node.attrs && node.attrs.hasAttribution && paras.length){
			out.attribution = paras.pop();
			out.paragraphs = paras;
		}
		return out;
	},

	exportMarkdown : (n)=>{
		const lines = (n.paragraphs || []).map((p)=>`> ${runsToMarkdown(p)}`);
		if(n.attribution) lines.push(`> — ${runsToMarkdown(n.attribution)}`);
		return lines.join('\n');
	},
	importPriority : 70,
	importMarkdown : (lines, i)=>{
		if(!/^>\s/.test(lines[i] || '')) return null;
		const paras = [];
		let j = i;
		while (j < lines.length && /^>\s?/.test(lines[j])){
			paras.push([{ text: lines[j].replace(/^>\s?/, '') }]);
			j++;
		}
		return { node: { type: 'quote', paragraphs: paras }, advance: j - i };
	},

	slashItems : [{
		id       : 'quote',
		label    : 'Quote',
		category : 'Callouts',
		icon     : 'Quote',
		keywords : 'quote blockquote pull epigraph',
		make     : (schema)=>schema.nodes.blockquote.create(null, schema.nodes.paragraph.create()),
	}],
};
