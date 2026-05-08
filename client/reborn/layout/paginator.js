// Pure paginator.
//
// Takes a flat sequence of AST blocks plus a `measure` callback and returns
// a list of pages. Knows nothing about the DOM: callers must measure block
// heights elsewhere (see MeasuringRenderer.jsx for the React side).
//
// Page model:
//   { number: 1-indexed, blocks: [...] }
//
// The browser handles within-page two-column flow via column-count: 2 on
// `.page`. The paginator's only job is to decide which blocks land on
// which page.
//
// Capacity model:
//   - `pageContentHeight` is the total flowable height inside one column.
//   - `columnsPerPage` (default 2) multiplies that to give the page capacity.
//   - A column break (the marker block) closes the current column but stays
//     on the same page; we model it by snapping accumulated height up to
//     the next column boundary.
//   - A page break always closes the current page and starts a new one;
//     the marker block itself is not emitted.
//
// Keep-together:
//   - Marker manifest field `keepTogether: true` (statBlock, spell, table,
//     note, descriptive, blockquote). Such a block is treated as one
//     unbreakable unit; if it doesn't fit on the current page, it moves
//     whole to the next.
//
// Heading cohesion:
//   - h1/h2/h3 immediately followed by a paragraph: if the heading is the
//     last block on a page (i.e. the next block doesn't fit), push the
//     heading along with that next block to the next page. Wave 5 ships
//     the simple version described in plan.md.

const DEFAULT_KEEP_TOGETHER_TYPES = new Set([
	'statBlock', 'spell', 'table', 'note', 'descriptive', 'blockquote', 'quote',
]);

const HEADING_LEVELS_TO_KEEP_WITH_NEXT = new Set([1, 2, 3]);

function isPageBreak(block){ return block && block.type === 'pageBreak'; }
function isColumnBreak(block){ return block && block.type === 'columnBreak'; }

// A block whose CSS uses `column-span: all` (h1 in the canonical 5ePHB
// theme) consumes height from EVERY column, not just the one it lands
// in. The paginator multiplies its measured height by columnsPerPage so
// the capacity bookkeeping matches what the browser actually does.
function spansAllColumns(block){
	return !!(block && block.type === 'heading' && block.level === 1);
}

function isHeadingThatNeedsCohesion(block){
	return block
		&& block.type === 'heading'
		&& HEADING_LEVELS_TO_KEEP_WITH_NEXT.has(block.level);
}

function blockBindsWithPreviousHeading(block){
	if(!block) return false;
	// A paragraph or list immediately following a heading is the cohesion
	// target. Other block types (tables, callouts, stat blocks) are large
	// enough that the heading can stand alone above them on the previous
	// page if needed.
	return block.type === 'paragraph' || block.type === 'list';
}

/**
 * @param {object[]} blocks - flat AST block sequence (page boundaries
 *   already flattened to `pageBreak` markers if any)
 * @param {object} options
 * @param {(block) => number} options.measure - block height (any unit, must
 *   match the unit of `pageContentHeight`)
 * @param {number} options.pageContentHeight - flowable height per column
 * @param {number} [options.columnsPerPage=2]
 * @param {Set<string>} [options.keepTogetherTypes]
 * @returns {{pages: {number: number, blocks: object[]}[]}}
 */
export function paginate(blocks, options){
	const {
		measure,
		pageContentHeight,
		columnsPerPage = 2,
		keepTogetherTypes = DEFAULT_KEEP_TOGETHER_TYPES,
	} = options;

	if(!Number.isFinite(pageContentHeight) || pageContentHeight <= 0){
		throw new Error('paginate: pageContentHeight must be a positive finite number');
	}
	if(typeof measure !== 'function'){
		throw new Error('paginate: measure callback required');
	}

	const pages = [];
	let current = { number: 1, blocks: [] };
	// `used` is total height accumulated on the current page (not per-column).
	let used = 0;
	const pageCapacity = pageContentHeight * columnsPerPage;

	const startNewPage = ()=>{
		// Push the current page only if it has content. The "first page even if
		// empty" guarantee is delivered by the trailing flush at the end of
		// paginate() — emitting an empty current here would cause a leading
		// `\page` (or a `\page` after another `\page`) to produce a spurious
		// blank page.
		if(current.blocks.length){
			pages.push(current);
		}
		current = { number: pages.length + 1, blocks: [] };
		used = 0;
	};

	// Snap `used` up to the next column boundary. Used for column breaks.
	const snapToNextColumn = ()=>{
		if(pageContentHeight <= 0) return;
		const completed = Math.ceil(used / pageContentHeight);
		used = Math.min(completed * pageContentHeight, pageCapacity);
	};

	const measureSafe = (b)=>{
		const h = measure(b);
		if(!Number.isFinite(h) || h < 0) return 0;
		// column-span: all consumes vertical space in every column,
		// effectively occupying `h * columnsPerPage` of page capacity.
		if(spansAllColumns(b)) return h * columnsPerPage;
		return h;
	};

	for (let i = 0; i < blocks.length; i++){
		const block = blocks[i];

		// --- explicit page break: close current page, never emit the marker ---
		if(isPageBreak(block)){
			startNewPage();
			continue;
		}

		// --- column break: keep the marker so the browser sees it ----------
		if(isColumnBreak(block)){
			// If we haven't yet placed any block on this page, a column break
			// is a no-op; otherwise emit the marker and snap to next column.
			if(current.blocks.length){
				current.blocks.push(block);
				snapToNextColumn();
			}
			// If snapping filled the page, start a new one.
			if(used >= pageCapacity){
				startNewPage();
			}
			continue;
		}

		const h = measureSafe(block);
		const isKeep = keepTogetherTypes.has(block.type);

		// --- heading cohesion: bind heading + next paragraph ----------------
		// Pre-compute whether this heading should travel with the next block.
		// We look ahead at most one non-marker block.
		let bound = null;
		if(isHeadingThatNeedsCohesion(block)){
			let j = i + 1;
			while (j < blocks.length && (isColumnBreak(blocks[j]))){ j++; }
			const next = blocks[j];
			if(next && !isPageBreak(next) && blockBindsWithPreviousHeading(next)){
				const nextH = measureSafe(next);
				bound = { nextIndex: j, nextHeight: nextH, totalHeight: h + nextH };
			}
		}

		// --- decide where it goes -------------------------------------------
		if(bound){
			// Place heading + bound block as one unit if both fit; otherwise
			// push to a new page. This is the "heading at bottom of page"
			// rule.
			const fitsTogether = (used + bound.totalHeight <= pageCapacity);
			if(!fitsTogether && used > 0){
				// Heading + paragraph don't both fit on the current page —
				// move them together to the next page.
				startNewPage();
			}
			// Place the heading. The bound block is placed immediately as
			// part of the same atomic unit (don't re-evaluate cohesion or
			// page capacity for the bound block — it travels with the
			// heading by definition).
			current.blocks.push(block);
			used += h;
			// If there were intervening column breaks between heading and
			// bound block, walk through them so they aren't lost.
			for (let k = i + 1; k < bound.nextIndex; k++){
				const skipped = blocks[k];
				if(isColumnBreak(skipped)) current.blocks.push(skipped);
			}
			current.blocks.push(blocks[bound.nextIndex]);
			used += bound.nextHeight;
			i = bound.nextIndex; // outer loop increments past the bound block
			continue;
		}

		if(isKeep){
			// Keep-together: only place if the whole block fits, OR the page
			// is empty (in which case we have no choice — an oversized block
			// gets its own page).
			if(used + h <= pageCapacity || used === 0){
				current.blocks.push(block);
				used += h;
			} else {
				startNewPage();
				current.blocks.push(block);
				used += h;
			}
			continue;
		}

		// Plain block: simple greedy fill.
		if(used + h <= pageCapacity || used === 0){
			current.blocks.push(block);
			used += h;
		} else {
			startNewPage();
			current.blocks.push(block);
			used += h;
		}
	}

	// Push the final page if it has anything (or if no pages were emitted).
	if(current.blocks.length || pages.length === 0){
		pages.push(current);
	}

	return { pages };
}

export const __testing = {
	DEFAULT_KEEP_TOGETHER_TYPES,
	HEADING_LEVELS_TO_KEEP_WITH_NEXT,
};
