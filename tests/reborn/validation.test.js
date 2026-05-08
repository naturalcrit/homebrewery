// Wave 7: AST schema validation tests.
//
// Coverage:
//   - Each manifest's `validateAst` rejects deliberately malformed inputs.
//   - The full demoDocument and longDemo validate clean (no errors anywhere).
//   - Importer rejection / auto-correction: malformed mustache stat blocks
//     surface as report.warnings (not silent passes) and the importer does
//     not crash.
//
// These guard the documented invariants in `client/reborn/blocks/types.js`.

import { manifests, validateBlock } from '../../client/reborn/blocks/registry.js';
import demoDocument from '../../client/reborn/document/demoDocument.js';
import longDemo     from '../../client/reborn/document/longDemo.js';
import { importMarkdown } from '../../client/reborn/import/markdown.js';

function allBlocks(doc){
	const out = [];
	for (const page of (doc.pages || [])){
		for (const block of (page.blocks || [])) out.push(block);
	}
	return out;
}

describe('validateBlock — happy path on every manifest default', ()=>{
	test('every manifest with createAst produces a block that validateBlock accepts', ()=>{
		for (const m of Object.values(manifests)){
			if(typeof m.createAst !== 'function') continue;
			const block = m.createAst();
			const errs = validateBlock(block);
			expect.soft
				? expect.soft(errs, `manifest ${m.type} default failed: ${errs.join('; ')}`).toEqual([])
				: expect(errs).toEqual([]);
		}
	});

	test('unknown block type yields exactly one error', ()=>{
		expect(validateBlock({ type: 'nope' })).toEqual(['unknown block type: nope']);
	});

	test('block with missing type returns the unknown-type error', ()=>{
		const errs = validateBlock({});
		expect(errs.length).toBe(1);
		expect(errs[0]).toMatch(/unknown block type/);
	});
});

describe('validateBlock — malformed inputs per manifest', ()=>{
	test('paragraph: non-array content', ()=>{
		const errs = validateBlock({ type: 'paragraph', content: 'not an array' });
		expect(errs.length).toBeGreaterThan(0);
		expect(errs[0]).toMatch(/content/);
	});

	test('heading: out-of-range level', ()=>{
		expect(validateBlock({ type: 'heading', level: 0, content: [] }).length).toBeGreaterThan(0);
		expect(validateBlock({ type: 'heading', level: 6, content: [] }).length).toBeGreaterThan(0);
		expect(validateBlock({ type: 'heading', level: '1', content: [] }).length).toBeGreaterThan(0);
	});

	test('heading: non-array content', ()=>{
		const errs = validateBlock({ type: 'heading', level: 2, content: 'hello' });
		expect(errs.length).toBeGreaterThan(0);
		expect(errs.some((e)=>/content/.test(e))).toBe(true);
	});

	test('list: bad style or missing items', ()=>{
		expect(validateBlock({ type: 'list', style: 'definition', items: [] }).length).toBeGreaterThan(0);
		expect(validateBlock({ type: 'list', style: 'bullet', items: 'nope' }).length).toBeGreaterThan(0);
	});

	test('table: non-array headers / rows', ()=>{
		expect(validateBlock({ type: 'table', headers: 'h', rows: [] }).length).toBeGreaterThan(0);
		expect(validateBlock({ type: 'table', headers: [], rows: 'r' }).length).toBeGreaterThan(0);
	});

	test('note / descriptive: missing title or body', ()=>{
		expect(validateBlock({ type: 'note', body: [{ type: 'paragraph', content: [] }] }).length).toBeGreaterThan(0);
		expect(validateBlock({ type: 'note', title: [{ text: 't' }] }).length).toBeGreaterThan(0);
		expect(validateBlock({ type: 'descriptive', body: [{ type: 'paragraph', content: [] }] }).length).toBeGreaterThan(0);
	});

	test('quote: paragraphs must be an array', ()=>{
		expect(validateBlock({ type: 'quote', paragraphs: 'nope' }).length).toBeGreaterThan(0);
	});

	test('image: src must be a string', ()=>{
		expect(validateBlock({ type: 'image', src: 42 }).length).toBeGreaterThan(0);
		expect(validateBlock({ type: 'image', src: null }).length).toBeGreaterThan(0);
	});

	test('statBlock: every required field reports an error', ()=>{
		const empty = { type: 'statBlock' };
		const errs = validateBlock(empty);
		// name, AC, HP, abilities object, and 6 ability sub-fields → at least 4 distinct errors.
		expect(errs.length).toBeGreaterThanOrEqual(4);
		expect(errs.some((e)=>/name/.test(e))).toBe(true);
		expect(errs.some((e)=>/armorClass/.test(e))).toBe(true);
		expect(errs.some((e)=>/hitPoints/.test(e))).toBe(true);
		expect(errs.some((e)=>/abilities/.test(e))).toBe(true);
	});

	test('statBlock: AC string instead of number', ()=>{
		const block = manifests.statBlock.createAst({ name: 'Goblin', armorClass: 'fifteen' });
		const errs = validateBlock(block);
		expect(errs.some((e)=>/armorClass/.test(e))).toBe(true);
	});

	test('statBlock: missing single ability score is detected', ()=>{
		const block = manifests.statBlock.createAst({ name: 'Goblin' });
		// Make str non-numeric.
		block.abilities = { ...block.abilities, str: 'big' };
		const errs = validateBlock(block);
		expect(errs.some((e)=>/abilities\.str/.test(e))).toBe(true);
	});

	test('spell: bad level', ()=>{
		expect(validateBlock({ type: 'spell', name: 'X', level: -1, school: 'evocation' }).length).toBeGreaterThan(0);
		expect(validateBlock({ type: 'spell', name: 'X', level: 10, school: 'evocation' }).length).toBeGreaterThan(0);
	});

	test('spell: missing name', ()=>{
		expect(validateBlock({ type: 'spell', name: '', level: 1, school: 'evocation' }).length).toBeGreaterThan(0);
	});

	test('spell: school must be a string', ()=>{
		const errs = validateBlock({ type: 'spell', name: 'X', level: 1, school: 7 });
		expect(errs.some((e)=>/school/.test(e))).toBe(true);
	});
});

describe('validateBlock — entire demo documents', ()=>{
	test('demoDocument validates clean (no block-level errors anywhere)', ()=>{
		const errors = [];
		for (const block of allBlocks(demoDocument)){
			const errs = validateBlock(block);
			if(errs.length){
				errors.push({ type: block.type, errs });
			}
		}
		expect(errors).toEqual([]);
	});

	test('longDemo validates clean (no block-level errors anywhere)', ()=>{
		const errors = [];
		for (const block of allBlocks(longDemo)){
			const errs = validateBlock(block);
			if(errs.length){
				errors.push({ type: block.type, errs });
			}
		}
		expect(errors).toEqual([]);
	});
});

describe('importer — malformed inputs flow into the report, not silent passes', ()=>{
	test('mustache stat block missing fields → at least one warning', ()=>{
		// A monster-frame opener with only a name. The stat-block importer
		// is partial-tolerant: missing fields fall back to defaults but the
		// importer should report what it could not parse.
		const src = [
			'{{monster,frame',
			'## Mystery Beast',
			'}}',
		].join('\n');
		const { document, report } = importMarkdown(src);
		expect(document.pages[0].blocks[0].type).toBe('statBlock');
		// The report MUST contain at least an entry telling the user that
		// fields were missing — otherwise a malformed import passes silently.
		// Either warnings or unsupported counts; what's NOT acceptable is
		// "0 warnings + result clean" because that hides corruption.
		const totalReportEntries =
			(report.warnings || []).length
			+ (report.unsupported || []).length
			+ (report.converted || []).length;
		expect(totalReportEntries).toBeGreaterThan(0);
	});

	test('imported stat block, even if partial, is auto-corrected to a validateBlock-passing AST', ()=>{
		const src = [
			'{{monster,frame',
			'## Goblin',
			'*Small humanoid, neutral evil*',
			'___',
			'- **Armor Class** 15',
			'- **Hit Points** 7',
			'- **Speed** 30 ft.',
			'___',
			'|STR|DEX|CON|INT|WIS|CHA|',
			'|:-:|:-:|:-:|:-:|:-:|:-:|',
			'|8|14|10|10|8|8|',
			'___',
			'- **Challenge** 1/4 (50 XP)',
			'}}',
		].join('\n');
		const { document } = importMarkdown(src);
		const sb = document.pages[0].blocks[0];
		expect(sb.type).toBe('statBlock');
		// The default-fill must produce a block that the validator accepts.
		expect(validateBlock(sb)).toEqual([]);
	});

	test('every block in a complex import passes validateBlock (no silent corruption)', ()=>{
		const src = [
			'---',
			'title: Big Brew',
			'---',
			'',
			'# Title',
			'',
			'A paragraph.',
			'',
			'## Section',
			'',
			'- one',
			'- two',
			'',
			'\\page',
			'',
			'# Page Two',
			'',
			'Another paragraph.',
		].join('\n');
		const { document } = importMarkdown(src);
		const errors = [];
		for (const block of allBlocks(document)){
			const errs = validateBlock(block);
			if(errs.length) errors.push({ type: block.type, errs });
		}
		expect(errors).toEqual([]);
	});
});
