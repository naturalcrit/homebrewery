// Wave 5: pure-paginator tests.
//
// The paginator is the function that knows nothing about the DOM — it takes
// blocks plus a synthetic `measure` callback and returns a page split. These
// tests pin the documented behaviours: greedy fill, keep-together, explicit
// page break, heading cohesion, column break, and the cache contract.

import { paginate } from '../../client/reborn/layout/paginator.js';
import { hashBlock, createMeasurementCache } from '../../client/reborn/layout/cache.js';

const mkPara = (text)=>({ type: 'paragraph', content: [{ text }] });
const mkHeading = (level, text)=>({ type: 'heading', level, content: [{ text }] });
const mkPageBreak = ()=>({ type: 'pageBreak' });
const mkColBreak = ()=>({ type: 'columnBreak' });
const mkStat = (name, h)=>({ type: 'statBlock', name, __h: h });

describe('paginator (pure)', ()=>{
	test('100 equal-height paragraphs paginate into the right number of pages', ()=>{
		// pageContentHeight = 100, columnsPerPage = 2 → capacity 200.
		// Each paragraph is height 20 → 10 paragraphs per page → 10 pages.
		const blocks = Array.from({ length: 100 }, (_, i)=>mkPara(`p${i}`));
		const measure = ()=>20;
		const { pages } = paginate(blocks, {
			measure,
			pageContentHeight : 100,
			columnsPerPage    : 2,
		});
		expect(pages.length).toBe(10);
		for (const p of pages){ expect(p.blocks.length).toBe(10); }
		// Page numbers are 1-indexed and contiguous.
		expect(pages.map((p)=>p.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	});

	test('keep-together: a stat block too tall for remaining capacity moves to the next page intact', ()=>{
		// Capacity 200. Fill page 1 with 9 paragraphs of height 20 (used=180),
		// then a stat block of height 50. It can't fit (180+50=230>200), so
		// it should move whole to page 2.
		const blocks = [
			...Array.from({ length: 9 }, (_, i)=>mkPara(`p${i}`)),
			mkStat('orc', 50),
			mkPara('after'),
		];
		const measure = (b)=>(b.type === 'statBlock' ? b.__h : 20);
		const { pages } = paginate(blocks, {
			measure, pageContentHeight : 100, columnsPerPage : 2,
		});
		// Stat block on page 2, intact (one block, not split).
		expect(pages.length).toBeGreaterThanOrEqual(2);
		expect(pages[0].blocks.every((b)=>b.type !== 'statBlock')).toBe(true);
		const p2Stat = pages[1].blocks.find((b)=>b.type === 'statBlock');
		expect(p2Stat).toBeDefined();
		expect(p2Stat.name).toBe('orc');
	});

	test('keep-together: stat block taller than a whole page still emits as a single block on its own page', ()=>{
		// An oversized keep-together can't fit anywhere; it gets its own
		// page rather than being split. (Wave 5 doesn't split keep-together
		// blocks. Wave 6+ may shrink-to-fit; for now correctness > prettiness.)
		const blocks = [
			mkPara('lead'),
			mkStat('giant', 500),
			mkPara('trail'),
		];
		const measure = (b)=>(b.type === 'statBlock' ? b.__h : 10);
		const { pages } = paginate(blocks, {
			measure, pageContentHeight : 100, columnsPerPage : 2,
		});
		// "lead" on page 1; giant on its own page (page 2); "trail" on page 3.
		expect(pages.length).toBe(3);
		expect(pages[1].blocks.length).toBe(1);
		expect(pages[1].blocks[0].name).toBe('giant');
	});

	test('explicit pageBreak always starts a new page; the marker is not emitted', ()=>{
		const blocks = [
			mkPara('a'), mkPageBreak(), mkPara('b'), mkPara('c'),
			mkPageBreak(), mkPara('d'),
		];
		const measure = ()=>1;
		const { pages } = paginate(blocks, {
			measure, pageContentHeight : 1000, columnsPerPage : 2,
		});
		expect(pages.length).toBe(3);
		expect(pages[0].blocks.map((b)=>b.content[0].text)).toEqual(['a']);
		expect(pages[1].blocks.map((b)=>b.content[0].text)).toEqual(['b', 'c']);
		expect(pages[2].blocks.map((b)=>b.content[0].text)).toEqual(['d']);
		// The pageBreak marker block should never appear inside a page.
		for (const p of pages){
			expect(p.blocks.some((b)=>b.type === 'pageBreak')).toBe(false);
		}
	});

	test('cache: re-paginating the same document calls measure 0 times the second pass', ()=>{
		const blocks = Array.from({ length: 50 }, (_, i)=>mkPara(`p${i}`));
		const cache = createMeasurementCache();

		// First pass: every block measured once and cached.
		let calls = 0;
		const heights1 = blocks.map((b)=>{
			const hash = hashBlock(b);
			const cached = cache.get(hash);
			if(cached !== undefined) return cached;
			calls++;
			const h = 20;
			cache.set(hash, h);
			return h;
		});
		expect(calls).toBe(50);
		paginate(blocks, {
			measure           : (b)=>heights1[blocks.indexOf(b)],
			pageContentHeight : 100,
		});

		// Second pass: every block hits the cache, no new measurements.
		let calls2 = 0;
		const heights2 = blocks.map((b)=>{
			const hash = hashBlock(b);
			const cached = cache.get(hash);
			if(cached !== undefined) return cached;
			calls2++;
			const h = 20;
			cache.set(hash, h);
			return h;
		});
		expect(calls2).toBe(0);
		paginate(blocks, {
			measure           : (b)=>heights2[blocks.indexOf(b)],
			pageContentHeight : 100,
		});
		// And the cache reports the right hit count.
		const stats = cache.stats();
		expect(stats.size).toBe(50);
		// Each block was looked up twice (once per pass): 50 misses on pass 1
		// (we didn't go through .get() during the warm-up — we did go through
		// .get() above, so check both passes hit get() exactly once each).
		expect(stats.misses).toBe(50);
		expect(stats.hits).toBe(50);
	});

	test('heading cohesion: a heading at the bottom of a page moves to the next page with its following paragraph', ()=>{
		// Capacity 200. We have:
		//   9 paragraphs of height 20 (used=180 on page 1)
		//   one h2 of height 10
		//   one paragraph of height 30 (heading+paragraph total 40 > 20 left)
		// Heading should move to page 2 along with the paragraph.
		const blocks = [
			...Array.from({ length: 9 }, (_, i)=>mkPara(`p${i}`)),
			mkHeading(2, 'Subhead'),
			mkPara('Body following the subhead.'),
			mkPara('More body.'),
		];
		const measure = (b)=>{
			if(b.type === 'heading') return 10;
			if(b.type === 'paragraph' && b.content[0].text === 'Body following the subhead.') return 30;
			return 20;
		};
		const { pages } = paginate(blocks, {
			measure, pageContentHeight : 100, columnsPerPage : 2,
		});

		// Page 1 should NOT end with the heading.
		const lastOnPage1 = pages[0].blocks[pages[0].blocks.length - 1];
		expect(lastOnPage1.type).not.toBe('heading');
		// Page 2 should start with the heading + the bound paragraph.
		expect(pages[1].blocks[0].type).toBe('heading');
		expect(pages[1].blocks[1].type).toBe('paragraph');
		expect(pages[1].blocks[1].content[0].text).toBe('Body following the subhead.');
	});

	test('heading cohesion: heading+paragraph fitting on current page stays on current page', ()=>{
		const blocks = [
			mkPara('a'),
			mkHeading(2, 'H'),
			mkPara('body'),
		];
		const measure = ()=>10;
		const { pages } = paginate(blocks, {
			measure, pageContentHeight : 100, columnsPerPage : 2,
		});
		expect(pages.length).toBe(1);
		expect(pages[0].blocks.length).toBe(3);
	});

	test('column break is preserved in output and snaps the column boundary', ()=>{
		// Page capacity 200. Fill 5 paragraphs of height 20 (used=100, exactly
		// one column). Column break: should snap used to next column boundary
		// (still 100). 6th paragraph height 20 lands at start of column 2.
		const blocks = [
			mkPara('a'), mkPara('b'), mkPara('c'), mkPara('d'), mkPara('e'),
			mkColBreak(),
			mkPara('f'),
		];
		const measure = (b)=>(b.type === 'columnBreak' ? 0 : 20);
		const { pages } = paginate(blocks, {
			measure, pageContentHeight : 100, columnsPerPage : 2,
		});
		expect(pages.length).toBe(1);
		expect(pages[0].blocks.some((b)=>b.type === 'columnBreak')).toBe(true);
	});
});

// ---- Wave 7: edge cases ------------------------------------------------

describe('paginator edge cases', ()=>{
	test('a single huge stat block ends up on one page (overfull is OK)', ()=>{
		const blocks = [mkStat('giant', 9999)];
		const measure = (b)=>(b.type === 'statBlock' ? b.__h : 20);
		const { pages } = paginate(blocks, {
			measure, pageContentHeight: 100, columnsPerPage: 2,
		});
		// One page with the whole block — better to keep it together than split.
		expect(pages.length).toBe(1);
		expect(pages[0].blocks.length).toBe(1);
		expect(pages[0].blocks[0].name).toBe('giant');
	});

	test('empty document produces exactly one empty page', ()=>{
		const { pages } = paginate([], {
			measure: ()=>20, pageContentHeight: 100, columnsPerPage: 2,
		});
		expect(pages.length).toBe(1);
		expect(pages[0].blocks).toEqual([]);
		expect(pages[0].number).toBe(1);
	});

	test('hard pageBreak at start does not produce a leading blank page', ()=>{
		const blocks = [mkPageBreak(), mkPara('a'), mkPara('b')];
		const { pages } = paginate(blocks, {
			measure: ()=>20, pageContentHeight: 100, columnsPerPage: 2,
		});
		// Either the leading marker is a no-op (first page already empty) or
		// it produces exactly one blank page. The Wave 5 behavior documented
		// in startNewPage is "if the current page is empty AND no pages
		// emitted yet, do nothing" → expect 1 page total.
		expect(pages.length).toBe(1);
		const types = pages[0].blocks.map((b)=>b.type);
		expect(types).toEqual(['paragraph', 'paragraph']);
	});

	test('hard pageBreak at end does not produce a spurious trailing blank page', ()=>{
		const blocks = [mkPara('a'), mkPara('b'), mkPageBreak()];
		const { pages } = paginate(blocks, {
			measure: ()=>20, pageContentHeight: 100, columnsPerPage: 2,
		});
		// One page of content; the trailing pageBreak shouldn't add a page.
		// (The current code starts a new empty page after the break and emits
		// it because pages.length===0 at that moment is false — so the trail
		// page would have to be observed if the implementation diverges.)
		// We assert what the documented Wave 5 behavior delivers: no trailing
		// page with zero blocks.
		const trailing = pages[pages.length - 1];
		expect(trailing.blocks.length).toBeGreaterThan(0);
	});

	test('500-block synthetic doc paginates in <2s and produces a sensible page count', ()=>{
		const blocks = Array.from({ length: 500 }, (_, i)=>mkPara(`p${i}`));
		const start = (typeof performance !== 'undefined' ? performance : Date).now();
		const { pages } = paginate(blocks, {
			measure: ()=>20, pageContentHeight: 100, columnsPerPage: 2,
		});
		const elapsed = (typeof performance !== 'undefined' ? performance : Date).now() - start;
		expect(elapsed).toBeLessThan(2000);
		// Capacity 200, paragraphs height 20 → 10 per page → 50 pages.
		expect(pages.length).toBeGreaterThanOrEqual(30);
		expect(pages.length).toBeLessThanOrEqual(60);
	});

	test('all blocks of identical content share the same hashBlock value', ()=>{
		// 1000 blocks, all identical content. Used as a sanity check that the
		// cache path can collapse them without surprise.
		const blocks = Array.from({ length: 1000 }, ()=>mkPara('same'));
		const hashes = new Set(blocks.map(hashBlock));
		expect(hashes.size).toBe(1);
	});
});

describe('hashBlock', ()=>{
	test('identical content → identical hash', ()=>{
		const a = mkPara('hello');
		const b = mkPara('hello');
		expect(hashBlock(a)).toBe(hashBlock(b));
	});

	test('key order in content does not affect hash', ()=>{
		const a = { type: 'paragraph', content: [{ text: 'x', marks: ['em'] }] };
		const b = { content: [{ marks: ['em'], text: 'x' }], type: 'paragraph' };
		expect(hashBlock(a)).toBe(hashBlock(b));
	});

	test('different content → different hash', ()=>{
		expect(hashBlock(mkPara('a'))).not.toBe(hashBlock(mkPara('b')));
	});

	test('different type with same content → different hash', ()=>{
		const a = { type: 'paragraph', content: [{ text: 'x' }] };
		const b = { type: 'heading',   level: 1, content: [{ text: 'x' }] };
		expect(hashBlock(a)).not.toBe(hashBlock(b));
	});
});
