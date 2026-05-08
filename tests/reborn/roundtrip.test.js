// Wave 3: AST <-> PM doc round-trip tests.
//
// Run with: npx jest tests/reborn/roundtrip.test.js

import { astToPmDoc, pmDocToAst } from '../../client/reborn/editor/convert.js';
import demoDocument from '../../client/reborn/document/demoDocument.js';
import { manifests } from '../../client/reborn/blocks/registry.js';
import {
	t, em, strong, underline,
	paragraph, heading, hr,
	bulletList, table,
	note, descriptive, quote,
	statBlock,
} from '../../client/reborn/document/schema.js';

// Normalise: drop empty `marks` arrays, undefined fields, and reduce empty
// `armorClassNote: ''` differences. The converter intentionally fills in
// schema defaults; demoDocument omits some optional fields (which then
// become defaults). Compare on the union of intentional fields.
function normaliseRun(run){
	if(typeof run === 'string') return { text: run };
	const out = { text: run.text || '' };
	if(run.marks && run.marks.length) out.marks = [...run.marks];
	if(run.href !== undefined) out.href = run.href;
	if(run.title) out.title = run.title;
	if(run.color !== undefined) out.color = run.color;
	return out;
}
function normaliseInline(runs){
	// Collapse adjacent runs whose mark set + extras are identical. PM's
	// model auto-merges these; the AST sometimes spells them out as separate
	// hand-authored runs. The two are semantically equal.
	const result = [];
	for (const run of (runs || [])){
		const norm = normaliseRun(run);
		const prev = result[result.length - 1];
		const sameMarks = (a, b)=>{
			const am = a.marks ? [...a.marks].sort().join(',') : '';
			const bm = b.marks ? [...b.marks].sort().join(',') : '';
			return am === bm
				&& (a.href || null) === (b.href || null)
				&& (a.title || null) === (b.title || null)
				&& (a.color || null) === (b.color || null);
		};
		if(prev && sameMarks(prev, norm)){
			prev.text += norm.text;
		} else {
			result.push(norm);
		}
	}
	return result;
}

function normaliseBlock(block){
	switch (block.type){
	case 'paragraph':
		return { type: 'paragraph', content: normaliseInline(block.content) };
	case 'heading':
		return {
			type    : 'heading',
			level   : block.level,
			content : normaliseInline(block.content),
			...(block.id ? { id: block.id } : {}),
		};
	case 'hr':
		return { type: 'hr' };
	case 'list':
		return {
			type  : 'list',
			style : block.style,
			items : (block.items || []).map((i)=>({
				content : normaliseInline(i.content),
				...(i.children ? { children: normaliseBlock(i.children) } : {}),
			})),
		};
	case 'table':
		return {
			type    : 'table',
			headers : (block.headers || []).map(normaliseInline),
			rows    : (block.rows || []).map((row)=>row.map(normaliseInline)),
		};
	case 'note':
	case 'descriptive':
		return {
			type  : block.type,
			title : normaliseInline(block.title),
			body  : (block.body || []).map((p)=>({
				type    : 'paragraph',
				content : normaliseInline(Array.isArray(p) ? p : p.content),
			})),
		};
	case 'quote': {
		const out = {
			type       : 'quote',
			paragraphs : (block.paragraphs || []).map(normaliseInline),
		};
		if(block.attribution) out.attribution = normaliseInline(block.attribution);
		return out;
	}
	case 'statBlock': {
		const fields = [
			'variant', 'name', 'size', 'creatureType', 'alignment',
			'armorClass', 'armorClassNote', 'hitPoints', 'hitDice', 'speed',
			'abilities', 'saves', 'skills',
			'damageResistances', 'damageImmunities', 'conditionImmunities',
			'senses', 'languages', 'challenge',
		];
		const out = { type: 'statBlock' };
		for (const f of fields){
			out[f] = block[f] !== undefined ? block[f] : defaultStatBlockField(f);
		}
		for (const f of ['traits', 'actions', 'legendaryActions', 'lairActions', 'regionalEffects']){
			out[f] = (block[f] || []).map((entry)=>({
				name : entry.name,
				text : normaliseInline(entry.text),
			}));
		}
		return out;
	}
	default:
		return block;
	}
}
function defaultStatBlockField(field){
	const defaults = {
		variant             : '5e',
		armorClassNote      : '',
		hitDice             : '',
		saves               : '',
		skills              : '',
		damageResistances   : '',
		damageImmunities    : '',
		conditionImmunities : '',
		senses              : '',
		languages           : '',
	};
	return defaults[field];
}
function normaliseDoc(docAst){
	return {
		pages : docAst.pages.map((p)=>({ blocks: p.blocks.map(normaliseBlock) })),
	};
}

describe('AST <-> PM round-trip', ()=>{
	test('demoDocument survives a round trip', ()=>{
		const pm = astToPmDoc(demoDocument);
		const back = pmDocToAst(pm, demoDocument.metadata);
		expect(normaliseDoc(back)).toEqual(normaliseDoc(demoDocument));
	});

	test('paragraph with mixed marks', ()=>{
		const ast = { pages : [{ blocks : [
			paragraph(t('plain '), strong('bold'), t(' '), em('italic')),
		] }] };
		const back = pmDocToAst(astToPmDoc(ast));
		expect(normaliseDoc(back)).toEqual(normaliseDoc(ast));
	});

	test('nested list', ()=>{
		const ast = { pages : [{ blocks : [
			bulletList(
				[t('one')],
				{ content: [t('two')], children: bulletList([t('two.a')], [t('two.b')]) },
				[t('three')],
			),
		] }] };
		const back = pmDocToAst(astToPmDoc(ast));
		expect(normaliseDoc(back)).toEqual(normaliseDoc(ast));
	});

	test('table with header + body', ()=>{
		const ast = { pages : [{ blocks : [
			table([[t('A')], [t('B')]], [
				[[t('1')], [t('2')]],
				[[t('3')], [t('4')]],
			]),
		] }] };
		const back = pmDocToAst(astToPmDoc(ast));
		expect(normaliseDoc(back)).toEqual(normaliseDoc(ast));
	});

	test('callouts and quote with attribution', ()=>{
		const ast = { pages : [{ blocks : [
			heading(2, t('Hi')),
			note([t('N')], [[t('body')]]),
			descriptive([t('D')], [[t('flavor')]]),
			quote([[t('only one breath')]], [t('Anon')]),
			hr(),
		] }] };
		const back = pmDocToAst(astToPmDoc(ast));
		expect(normaliseDoc(back)).toEqual(normaliseDoc(ast));
	});

	test('statBlock attrs preserved', ()=>{
		const ast = { pages : [{ blocks : [
			statBlock({
				name           : 'Test',
				size           : 'Tiny',
				creatureType   : 'beast',
				alignment      : 'unaligned',
				armorClass     : 12,
				armorClassNote : 'leather',
				hitPoints      : 10,
				hitDice        : '3d4 + 3',
				speed          : '20 ft.',
				abilities      : { str: 8, dex: 14, con: 10, int: 2, wis: 12, cha: 6 },
				challenge      : '1/4 (50 XP)',
				traits         : [{ name: 'Keen', text: [t('senses')] }],
				actions        : [{ name: 'Bite', text: [t('claws')] }],
			}),
		] }] };
		const back = pmDocToAst(astToPmDoc(ast));
		expect(normaliseDoc(back)).toEqual(normaliseDoc(ast));
	});

	test('multi-page documents preserve page boundaries via pageBreak', ()=>{
		const ast = {
			pages : [
				{ blocks: [paragraph(t('page 1'))] },
				{ blocks: [paragraph(t('page 2'))] },
				{ blocks: [paragraph(t('page 3'))] },
			],
		};
		const back = pmDocToAst(astToPmDoc(ast));
		expect(back.pages.length).toBe(3);
		expect(normaliseDoc(back)).toEqual(normaliseDoc(ast));
	});
});

describe('schema-AST parity: every manifest survives a default-block round trip', ()=>{
	// For every manifest with createAst, push a default block through the
	// editor's PM doc round-trip and assert the AST type is preserved. This
	// is the contract: a manifest's default value MUST be representable in
	// the PM schema and recoverable from it.
	//
	// Internal-only PM nodes (noteTitle, descriptiveTitle, list_item) don't
	// appear in MANIFESTS, so we don't iterate them here; they're covered
	// indirectly via their parents.

	for (const m of Object.values(manifests)){
		if(typeof m.createAst !== 'function') continue;
		// `pageBreak` is the marker that becomes the boundary between AST
		// pages — it is intentionally not preserved as a block in any single
		// page after a round trip. Test it separately below.
		if(m.type === 'pageBreak') continue;
		test(`${m.type}: createAst → PM → AST preserves type`, ()=>{
			const block = m.createAst();
			const ast = { metadata: {}, pages: [{ blocks: [block] }] };
			let back;
			try {
				back = pmDocToAst(astToPmDoc(ast));
			} catch (e){
				throw new Error(`round-trip failed for manifest ${m.type}: ${e.message}`);
			}
			expect(back.pages[0].blocks.length).toBe(1);
			expect(back.pages[0].blocks[0].type).toBe(m.type);
		});
	}

	test('pageBreak round-trips by splitting into two empty AST pages', ()=>{
		const ast = { metadata: {}, pages: [{ blocks: [
			{ type: 'paragraph', content: [{ text: 'before' }] },
			manifests.pageBreak.createAst(),
			{ type: 'paragraph', content: [{ text: 'after' }] },
		] }] };
		const back = pmDocToAst(astToPmDoc(ast));
		expect(back.pages.length).toBe(2);
		expect(back.pages[0].blocks[0].content[0].text).toBe('before');
		expect(back.pages[1].blocks[0].content[0].text).toBe('after');
	});
});

describe('schema-AST parity: inline mark edge cases', ()=>{
	test('underline mark survives the round trip', ()=>{
		const ast = { pages: [{ blocks: [paragraph(t('plain '), underline('ulined'), t(' tail'))] }] };
		const back = pmDocToAst(astToPmDoc(ast));
		const runs = back.pages[0].blocks[0].content;
		const ulRun = runs.find((r)=>(r.marks || []).includes('underline'));
		expect(ulRun).toBeDefined();
		expect(ulRun.text).toContain('ulined');
	});

	test('link mark with href + title survives the round trip', ()=>{
		// Build the link directly so we can attach a title attribute.
		const linkRun = { text: 'See here', marks: ['link'], href: 'https://example.com', title: 'External' };
		const ast = { pages: [{ blocks: [paragraph(t('Visit '), linkRun)] }] };
		const back = pmDocToAst(astToPmDoc(ast));
		const runs = back.pages[0].blocks[0].content;
		const lr = runs.find((r)=>(r.marks || []).includes('link'));
		expect(lr).toBeDefined();
		expect(lr.href).toBe('https://example.com');
		expect(lr.title).toBe('External');
	});

	test('nested marks (em + strong) are preserved as a combined mark set', ()=>{
		const both = { text: 'super-emphatic', marks: ['em', 'strong'] };
		const ast = { pages: [{ blocks: [paragraph(both)] }] };
		const back = pmDocToAst(astToPmDoc(ast));
		const runs = back.pages[0].blocks[0].content;
		const r = runs.find((x)=>x.text.includes('super-emphatic'));
		expect(r).toBeDefined();
		expect(new Set(r.marks)).toEqual(new Set(['em', 'strong']));
	});

	test('color mark round-trips with its color attribute', ()=>{
		// `color` is a registered mark in marks.js but the AST schema's
		// inline factories don't have a sugar helper for it; build the run
		// by hand. If the schema stores `color` as an attr (not a mark),
		// then PM → AST also surfaces the color via the `color` field.
		const colored = { text: 'crimson', marks: ['color'], color: '#c00' };
		const ast = { pages: [{ blocks: [paragraph(t('plain '), colored, t(' tail'))] }] };
		let back;
		try {
			back = pmDocToAst(astToPmDoc(ast));
		} catch (e){
			throw new Error(`color round-trip threw: ${e.message}`);
		}
		const runs = back.pages[0].blocks[0].content;
		const cr = runs.find((r)=>(r.color === '#c00') || ((r.marks || []).includes('color')));
		expect(cr).toBeDefined();
		// At minimum: the colored text content survives.
		expect(runs.map((r)=>r.text).join('')).toBe('plain crimson tail');
	});

	test('link to relative href round-trips', ()=>{
		const linkRun = { text: 'sibling', marks: ['link'], href: '#anchor' };
		const ast = { pages: [{ blocks: [paragraph(linkRun)] }] };
		const back = pmDocToAst(astToPmDoc(ast));
		const r = back.pages[0].blocks[0].content.find((x)=>(x.marks || []).includes('link'));
		expect(r.href).toBe('#anchor');
	});
});
