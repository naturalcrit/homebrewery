import brewsEqual, { BREWS_EQUAL_FIELDS, BREWS_EQUAL_IGNORED_FIELDS } from '../../client/homebrew/pages/editPage/brewsEqual.js';
import { DEFAULT_BREW } from '../../server/brewDefaults.js';

const baseBrew = {
	...DEFAULT_BREW,
	text     : 'hello',
	snippets : '',
	authors  : ['alice'],
	tags     : ['fantasy'],
};

describe('brewsEqual', ()=>{
	test('returns true for the same reference', ()=>{
		expect(brewsEqual(baseBrew, baseBrew)).toBe(true);
	});

	test('returns true for value-equal brews', ()=>{
		expect(brewsEqual({ ...baseBrew }, { ...baseBrew })).toBe(true);
	});

	test('returns false when null/undefined supplied', ()=>{
		expect(brewsEqual(null, baseBrew)).toBe(false);
		expect(brewsEqual(baseBrew, null)).toBe(false);
		expect(brewsEqual(undefined, baseBrew)).toBe(false);
	});

	test('detects a change in each compared field', ()=>{
		// Per-field check: mutate one field at a time and assert brewsEqual is false.
		// If you add a new field to brewsEqual, add a sample mutation here.
		const mutations = {
			text        : 'changed',
			style       : '/* changed */',
			snippets    : '\\snippet new',
			title       : 'Changed',
			description : 'changed',
			theme       : 'V3-Blank',
			renderer    : 'legacy',
			lang        : 'fr',
			thumbnail   : 'https://example.com/t.png',
			published   : true,
			gDrive      : true,
			trashed     : true,
			authors     : ['bob'],
			tags        : ['horror'],
		};

		for (const field of BREWS_EQUAL_FIELDS) {
			const sample = mutations[field];
			expect(sample, `BREWS_EQUAL_FIELDS lists "${field}" but the test has no mutation sample for it — add one to mutations above.`).toBeDefined();
			const mutated = { ...baseBrew, [field]: sample };
			expect(brewsEqual(baseBrew, mutated), `Expected change in "${field}" to be detected`).toBe(false);
		}
	});

	test('every key on DEFAULT_BREW is either compared or explicitly ignored', ()=>{
		// Guards against silent autosave breakage when a new brew field is added without
		// updating brewsEqual. If this fails: either add the field to BREWS_EQUAL_FIELDS
		// (and the comparison in brewsEqual.js) or to BREWS_EQUAL_IGNORED_FIELDS.
		const known = new Set([...BREWS_EQUAL_FIELDS, ...BREWS_EQUAL_IGNORED_FIELDS]);
		const unaccounted = Object.keys(DEFAULT_BREW).filter((k)=>!known.has(k));
		expect(unaccounted, `Unaccounted fields on DEFAULT_BREW: ${unaccounted.join(', ')}`).toEqual([]);
	});

	test('arrays compare by element equality, not reference', ()=>{
		const a = { ...baseBrew, tags: ['a', 'b'] };
		const b = { ...baseBrew, tags: ['a', 'b'] };
		expect(brewsEqual(a, b)).toBe(true);
		expect(brewsEqual(a, { ...baseBrew, tags: ['a', 'c'] })).toBe(false);
		expect(brewsEqual(a, { ...baseBrew, tags: ['a'] })).toBe(false);
	});
});
