// Wave 7: performance budgets.
//
// These are aspirational ceilings: a regression here means an algorithm
// went quadratic, not that someone's machine is slow. The thresholds are
// generous — tight enough to catch a 10x regression, loose enough to not
// flap on a busy CI runner.
//
// If a budget is hit and can't be met, raise it AND file a deferred-work
// item — never delete the test.
//
// All budgets measured on a synthetic workload. We don't measure real layout
// here (that's the visual-smoke job).

import { paginate } from '../../client/reborn/layout/paginator.js';
import { hashBlock, createMeasurementCache } from '../../client/reborn/layout/cache.js';
import { astToPmDoc } from '../../client/reborn/editor/convert.js';

// Synthetic generator. Mix of paragraph, heading, list, table; no atoms (so
// the AST→PM conversion exercises the inline path heavily). Deterministic
// content via index seed.
function syntheticBlocks(n){
	const blocks = [];
	for (let i = 0; i < n; i++){
		const r = i % 7;
		if(r === 0){
			blocks.push({ type: 'heading', level: 2, content: [{ text: `Section ${i}` }] });
		} else if(r === 1){
			blocks.push({
				type    : 'list',
				style   : 'bullet',
				items   : [
					{ content: [{ text: `item ${i}.1` }] },
					{ content: [{ text: `item ${i}.2` }] },
				],
			});
		} else if(r === 2){
			blocks.push({
				type    : 'table',
				headers : [[{ text: 'A' }], [{ text: 'B' }]],
				rows    : [
					[[{ text: `${i}-a` }], [{ text: `${i}-b` }]],
					[[{ text: `${i}-c` }], [{ text: `${i}-d` }]],
				],
			});
		} else {
			blocks.push({
				type    : 'paragraph',
				content : [{ text: `Paragraph ${i}: lorem ipsum dolor sit amet, consectetur adipiscing elit.` }],
			});
		}
	}
	return blocks;
}

describe('performance budgets', ()=>{
	test('paginate 100-block synthetic doc cold-cache: under 100ms', ()=>{
		const blocks = syntheticBlocks(100);
		const measure = ()=>20;
		const start = performance.now();
		const { pages } = paginate(blocks, {
			measure, pageContentHeight: 100, columnsPerPage: 2,
		});
		const elapsed = performance.now() - start;
		// Wave 7 typical: <5ms on a developer laptop. The 100ms ceiling is
		// tight enough to catch a ~20x algorithmic regression (e.g. someone
		// adding an O(n^2) lookup to the inner loop) while remaining loose
		// enough to not flap on a busy CI runner.
		expect(elapsed).toBeLessThan(100);
		expect(pages.length).toBeGreaterThan(0);
	});

	test('paginate 100-block doc warm-cache (re-run): under 50ms', ()=>{
		// "Warm cache" here means the paginator runs again with no work
		// repeated externally. We pre-prime the measurement cache and use
		// a measure() that always hits.
		const blocks = syntheticBlocks(100);
		const cache = createMeasurementCache();
		const heights = blocks.map((b, i)=>{
			const h = 20 + (i % 3);
			cache.set(hashBlock(b), h);
			return h;
		});
		const measure = (b)=>{
			const cached = cache.get(hashBlock(b));
			return cached !== undefined ? cached : heights[blocks.indexOf(b)];
		};

		// First run priming (this isn't counted).
		paginate(blocks, { measure, pageContentHeight: 100, columnsPerPage: 2 });

		// Warm run.
		const start = performance.now();
		const { pages } = paginate(blocks, {
			measure, pageContentHeight: 100, columnsPerPage: 2,
		});
		const elapsed = performance.now() - start;
		expect(elapsed).toBeLessThan(50);
		expect(pages.length).toBeGreaterThan(0);
	});

	test('astToPmDoc on a 200-block doc: under 200ms', ()=>{
		const blocks = syntheticBlocks(200);
		const ast = { metadata: {}, pages: [{ blocks }] };
		const start = performance.now();
		const pm = astToPmDoc(ast);
		const elapsed = performance.now() - start;
		expect(elapsed).toBeLessThan(200);
		expect(pm).toBeTruthy();
		// Sanity-check: the PM doc has roughly the right child count.
		expect(pm.childCount).toBeGreaterThan(100);
	});

	test('hashBlock on 1000 blocks: under 50ms', ()=>{
		const blocks = syntheticBlocks(1000);
		const start = performance.now();
		const hashes = blocks.map(hashBlock);
		const elapsed = performance.now() - start;
		expect(elapsed).toBeLessThan(50);
		// Sanity-check: hashes are deterministic 8-char hex strings.
		expect(hashes.length).toBe(1000);
		expect(hashes[0]).toMatch(/^[0-9a-f]{8}$/);
	});

	test('paginate 500-block doc: under 500ms and produces sensible page count', ()=>{
		const blocks = syntheticBlocks(500);
		const measure = ()=>20;
		const start = performance.now();
		const { pages } = paginate(blocks, {
			measure, pageContentHeight: 100, columnsPerPage: 2,
		});
		const elapsed = performance.now() - start;
		// Wave 7 typical: <20ms. 500ms is ~25x the typical, well below the
		// 2s "open a 500-page doc" budget plan.md sets for a real document.
		expect(elapsed).toBeLessThan(500);
		// 500 blocks × 20 / 200 capacity = 50 pages baseline. Reality: cohesion
		// rules + keep-together pushes some over, so >= 30 is the floor.
		expect(pages.length).toBeGreaterThanOrEqual(30);
	});
});
