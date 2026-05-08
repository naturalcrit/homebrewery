// MeasuringRenderer.
//
// React side of the paginator. Renders the document twice: once into a
// hidden offscreen container that has exactly one column at the canonical
// `.page` column width — so the browser flows real layout for each block —
// and once into the visible `.brewRenderer` shell, split into multiple
// `.page` divs at the boundaries the paginator chose.
//
// Why a single-column measurer rather than a real .page:
//   - The browser balances columns when fed `column-fill: auto`, so reading
//     `offsetTop` on blocks inside a real two-column page produces values
//     that depend on neighbours. Measuring at column width with a single
//     column gives each block its true natural height.
//   - The .page itself is read for its content-area height (so we know the
//     per-column capacity); blocks are read from the single-column flow.
//
// Caching:
//   - Heights keyed by per-block content hash via `hashBlock`. Re-renders
//     of unchanged blocks reuse cached heights without DOM measurement.
//
// Lifecycle:
//   - First mount: render measurement DOM, read heights, call paginate(),
//     setState with the resulting page split. The visible output replaces
//     itself with the paginated render.
//   - Subsequent renders with new blocks: re-measure missing blocks only.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Block from '../renderer/Block.jsx';
import Page from '../renderer/Page.jsx';
import { paginate } from './paginator.js';
import { createMeasurementCache, hashBlock } from './cache.js';
import { manifests } from '../blocks/registry.js';

// Build the keep-together type set from the manifests. This is the only
// integration point the paginator has with specific block types — the rest
// of the algorithm is content-agnostic. New block types pick up the rule
// for free by declaring `keepTogether: true` on their manifest.
const KEEP_TOGETHER_TYPES = new Set(
	Object.values(manifests).filter((m)=>m.keepTogether).map((m)=>m.type),
);

// One process-wide cache. Keyed by per-block content hash, so two distinct
// MeasuringRenderer instances showing the same block share measurements.
const sharedCache = createMeasurementCache();

// Diagnostic state published on `window.__rebornPaginator` so visual-smoke
// can assert the performance contract and re-paginate from the outside
// (warm-cache pass timing).
function publishTimings(timings, extras){
	if(typeof window === 'undefined') return;
	const slot = window.__rebornPaginator || (window.__rebornPaginator = { runs: [] });
	slot.runs.push(timings);
	slot.last = timings;
	if(extras){
		if(extras.flat) slot.lastFlat = extras.flat;
		if(extras.heights) slot.lastHeights = extras.heights;
		if(extras.paginate) slot.paginate = extras.paginate;
		if(extras.pageContentHeight) slot.lastPageContentHeight = extras.pageContentHeight;
	}
}

function flattenAst(documentAst){
	// The AST groups blocks under pages with implicit page breaks at the
	// boundaries. Wave 5's renderer flattens that to a single block stream
	// (with explicit pageBreak markers between authored pages) and lets the
	// paginator re-assemble pages. This makes incremental re-pagination
	// straightforward later: there's only one block stream to diff.
	const out = [];
	const pages = (documentAst && documentAst.pages) || [];
	pages.forEach((page, i)=>{
		if(i > 0) out.push({ type: 'pageBreak' });
		for (const block of (page.blocks || [])){
			out.push(block);
		}
	});
	return out;
}

function MeasureFrame({ blocks, refs, pageRef }){
	// `display: none` doesn't trigger layout. We need the browser to lay
	// the page out so we can read block heights, but we don't want the
	// user to see it.
	//
	// Important wrinkle: the canonical `.page` rule sets
	// `content-visibility: auto` and `contain: strict`. When the .page
	// is positioned wholly outside the viewport, the browser will skip
	// rendering its descendants (zero-height children). So we keep the
	// host inside the viewport and rely on `clip-path: inset(100%)` plus
	// zero pointer events to hide it visually, while inline styles on the
	// measurement .page itself reset content-visibility / contain so the
	// children render at full natural size.
	const measureStyle = {
		position      : 'absolute',
		top           : '0',
		left          : '0',
		width         : '0',
		height        : '0',
		overflow      : 'visible',
		clipPath      : 'inset(100%)',
		pointerEvents : 'none',
		zIndex        : -1,
	};
	// Each measurement page gets its sibling structure inline-overridden
	// where it matters (single-column, no contain, content-visibility
	// visible, no clip overflow) but keeps the `.page` class so descendant
	// selectors (.page p, .page h1, .page .monster.frame) still match.
	//
	// CRITICAL: width override. Canonical `.page` is 215.9mm wide with
	// 1.9cm side padding and column-count 2, so the per-column flow width
	// is roughly (215.9mm − 2×1.9cm − 0.9cm gap) / 2 ≈ 8cm. To measure
	// blocks at column width with column-count: 1 we shrink the page to
	// (8cm + 2×1.9cm) = 11.8cm so that the inner content box is exactly
	// 8cm wide. (This matches the canonical `.useColumns()` mixin's
	// `column-width: 8cm * @multiplier`.)
	const overrideAsSingleCol = {
		width             : '11.8cm',
		columnCount       : 1,
		MozColumnCount    : 1,
		WebkitColumnCount : 1,
		columnWidth       : 'auto',
		columnFill        : 'auto',
		// Cancel the canonical `.page` rules that would clip our
		// off-screen measurement DOM:
		contain           : 'none',
		contentVisibility : 'visible',
		overflow          : 'visible',
		height            : 'auto',
		boxShadow         : 'none',
	};
	return (
		<div className='reborn-measure-host' style={measureStyle} aria-hidden='true'>
			{/* Hidden full .page clone — used purely to read its
			    content-area height for column capacity. We do NOT touch
			    its column / padding / width settings, so it represents
			    the canonical .page exactly. */}
			<div className='brewRenderer'>
				<div className='pages'>
					<div className='page' ref={pageRef} />
				</div>
			</div>
			{/* Single-column measurement page. Same `.page` class so
			    theme rules apply, but column-count overridden to 1 so each
			    block stacks vertically. Padding kept so the column
			    width inside == content width (== 8cm * @multiplier in the
			    canonical theme), giving each block its true natural
			    height when flowed at column width. */}
			<div className='brewRenderer'>
				<div className='pages'>
					<div className='page reborn-measure-column' style={overrideAsSingleCol}>
						{/* Render blocks as direct siblings (no per-block
						    wrapper) so the canonical theme's adjacent-
						    sibling margin rules (`p + *`, `h1 + p`, etc.)
						    fire correctly. We tag each rendered block via
						    a fragment + a measurement marker; heights are
						    derived by diffing successive marker offsets. */}
						{blocks.map((block, i)=>(
							<React.Fragment key={i}>
								<span
									ref={(el)=>{ refs.current[i] = el; }}
									data-measure-marker={i}
									style={{
										display    : 'block',
										width      : 0,
										height     : 0,
										overflow   : 'hidden',
										fontSize   : 0,
										lineHeight : 0,
										margin     : 0,
										padding    : 0,
									}}
								/>
								<Block block={block} />
							</React.Fragment>
						))}
						{/* Sentinel marker after the last block to compute
						    that block's height. */}
						<span
							ref={(el)=>{ refs.current[blocks.length] = el; }}
							data-measure-marker={blocks.length}
							style={{
								display    : 'block',
								width      : 0,
								height     : 0,
								overflow   : 'hidden',
								fontSize   : 0,
								lineHeight : 0,
								margin     : 0,
								padding    : 0,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function MeasuringRenderer({ document: documentAst }){
	const flat = useMemo(()=>flattenAst(documentAst), [documentAst]);

	// Per-block hashes used for cache lookup AND for memoising the flat
	// array's identity (so we don't re-measure unless something changed).
	const hashes = useMemo(()=>flat.map(hashBlock), [flat]);

	const refs = useRef([]);
	const pageRef = useRef(null);
	const [pages, setPages] = useState(null);
	const [phase, setPhase] = useState('measuring'); // 'measuring' | 'done'

	// Resize the refs array on every render to match the current block list.
	// Doing this in render (not in useEffect) means the size is correct
	// BEFORE callback refs fire during commit. We never null entries here —
	// refs only get nulled by React when an element unmounts.
	if(refs.current.length !== flat.length + 1){
		refs.current.length = flat.length + 1;
	}

	// Trigger a fresh measurement pass whenever the block list changes.
	useEffect(()=>{
		setPhase('measuring');
		setPages(null);
	}, [flat]);

	useEffect(()=>{
		if(phase !== 'measuring') return;
		// Wait for layout: requestAnimationFrame ensures the offscreen
		// elements are mounted and measurable.
		let cancelled = false;
		const handle = requestAnimationFrame(()=>{
			if(cancelled) return;
			const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());

			// 1) Read column / page geometry from the hidden .page clone.
			//    `.page` is 215.9mm × 279.4mm with padding 1.4cm 1.9cm 1.7cm
			//    in the canonical theme. The flowable content area inside one
			//    column is page.clientHeight minus the vertical padding.
			//    `column-count: 2` means each column gets that full height
			//    (column-fill: auto, so the first column fills before the
			//    second). A page can therefore hold up to 2× this height
			//    of accumulated block content.
			const pageEl = pageRef.current;
			let pageContentHeight = 0;
			if(pageEl){
				const cs = window.getComputedStyle(pageEl);
				pageContentHeight = pageEl.clientHeight
					- parseFloat(cs.paddingTop || 0)
					- parseFloat(cs.paddingBottom || 0);
			}
			// Reserve a small bottom safety margin (footer ornament + page
			// number live in the bottom padding, but inter-block margins
			// and the `.page::after` ornament reservation can still push
			// content past the math). The footer ornament is 50px tall and
			// is positioned absolutely inside the bottom padding; that
			// padding (1.7cm = ~64px at 96dpi) more than accommodates it,
			// but we trim ~16px to absorb leading/margin slop and the slim
			// chance of a column being one line short.
			pageContentHeight = Math.max(pageContentHeight - 16, 100);

			// 2) Measure each block. We render the block list as a single
			// flow (no per-block wrappers) so the theme's adjacent-sibling
			// margin rules apply correctly. Heights are derived from
			// `offsetTop` diffs between successive zero-size marker spans.
			//
			// Cache hits still happen here — when a block's hash is in the
			// cache we use the cached height directly and skip the DOM
			// read for that block. New blocks come from the offset diff.
			let measureCalls = 0;
			let hadElements = 0;

			// Read all marker offsets up front (one DOM walk).
			const markerOffsets = new Array(flat.length + 1);
			for (let i = 0; i <= flat.length; i++){
				const el = refs.current[i];
				if(el){
					hadElements++;
					markerOffsets[i] = el.getBoundingClientRect().top;
				}
			}

			const heights = flat.map((block, i)=>{
				const hash = hashes[i];
				const cached = sharedCache.get(hash);
				if(cached !== undefined) return cached;
				measureCalls++;
				const top = markerOffsets[i];
				const next = markerOffsets[i + 1];
				let h = 0;
				if(Number.isFinite(top) && Number.isFinite(next) && next > top){
					h = next - top;
				}
				sharedCache.set(hash, h);
				return h;
			});
			// Pin a per-type measurement summary on window for diagnostics
			// (visual-smoke and the in-browser devtools both read this).
			if(typeof window !== 'undefined'){
				window.__rebornMeasureDebug = {
					hadElements,
					measureCalls,
					byType : flat.reduce((acc, block, i)=>{
						const t = block.type;
						(acc[t] = acc[t] || []).push(Math.round(heights[i]));
						return acc;
					}, {}),
				};
			}

			const measure = (block)=>{
				const idx = flat.indexOf(block);
				return idx >= 0 ? heights[idx] : 0;
			};

			const t1 = (typeof performance !== 'undefined' ? performance.now() : Date.now());

			// 3) Run the paginator.
			const result = paginate(flat, {
				measure,
				pageContentHeight,
				columnsPerPage    : 2,
				keepTogetherTypes : KEEP_TOGETHER_TYPES,
			});

			const t2 = (typeof performance !== 'undefined' ? performance.now() : Date.now());

			publishTimings({
				blockCount         : flat.length,
				pageCount          : result.pages.length,
				measureMs          : Math.round((t1 - t0) * 1000) / 1000,
				paginateMs         : Math.round((t2 - t1) * 1000) / 1000,
				totalMs            : Math.round((t2 - t0) * 1000) / 1000,
				measureCalls,
				pageContentHeight,
				totalContentHeight : Math.round(heights.reduce((a, b)=>a + b, 0)),
				cacheStats         : sharedCache.stats(),
			}, {
				flat,
				heights,
				paginate,
				pageContentHeight,
			});

			setPages(result.pages);
			setPhase('done');
		});
		return ()=>{ cancelled = true; cancelAnimationFrame(handle); };
	}, [phase, flat, hashes]);

	// While measuring, render the offscreen probes ONLY. As soon as we have
	// the page split, render the visible pages and tear the probes down.
	if(phase === 'measuring' || !pages){
		return (
			<div className='brewRenderer'>
				<div className='pages'>
					<div className='reborn-measure-placeholder' />
				</div>
				<MeasureFrame blocks={flat} refs={refs} pageRef={pageRef} />
			</div>
		);
	}

	return (
		<div className='brewRenderer'>
			<div className='pages'>
				{pages.map((page)=>(
					<Page key={page.number} page={page} number={page.number} />
				))}
			</div>
		</div>
	);
}

export { sharedCache as __sharedCache };
