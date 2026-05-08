// Measurement cache.
//
// The paginator wants to ask "how tall is this block when flowed at column
// width?" once per unique block content, not once per render. We hash each
// block's content and key the cache by that hash.
//
// Hash design: the cache key MUST be derived from the block's *content*, not
// its identity, so two blocks with the same payload share an entry and so a
// re-render of an unchanged block hits the cache. We use a deterministic
// JSON.stringify (key-sorted) followed by a fast 32-bit FNV-1a hash. The
// `block.type` is folded in so a paragraph and a heading with identical
// inline runs do not collide.
//
// Wave 5 ships the cache as a flat Map keyed by content hash. The hash is
// the only thing exposed to the rest of the layout module; an Incremental
// stable-prefix algorithm (Wave 6+) will read the same hashes to find the
// first changed block and repaginate from there.

// ---- deterministic stringify --------------------------------------------

function stableStringify(value){
	if(value === null) return 'null';
	const t = typeof value;
	if(t === 'number' || t === 'boolean') return JSON.stringify(value);
	if(t === 'string') return JSON.stringify(value);
	if(t === 'undefined') return 'undefined';
	if(Array.isArray(value)){
		return `[${value.map(stableStringify).join(',')}]`;
	}
	if(t === 'object'){
		const keys = Object.keys(value).sort();
		return `{${keys.map((k)=>`${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
	}
	// functions, symbols — folded out (shouldn't appear in AST)
	return 'null';
}

// ---- fast 32-bit FNV-1a --------------------------------------------------

function fnv1a32(str){
	let h = 0x811c9dc5;
	for (let i = 0; i < str.length; i++){
		h ^= str.charCodeAt(i);
		// 32-bit FNV prime: 16777619
		h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
	}
	return (`0000000${h.toString(16)}`).slice(-8);
}

/**
 * Compute the per-block content hash. Pure function of block payload.
 * @param {object} block
 * @returns {string} 8-char hex
 */
export function hashBlock(block){
	if(!block || typeof block !== 'object') return fnv1a32(String(block));
	return fnv1a32(stableStringify(block));
}

// ---- cache ---------------------------------------------------------------

/**
 * Create a fresh measurement cache. Returned object has a stable shape so
 * future incremental work (stable-prefix block lookups, generation counters)
 * can extend it without touching call sites.
 */
export function createMeasurementCache(){
	const heights = new Map();
	let hits = 0;
	let misses = 0;

	return {
		/** Look up a cached height. Returns undefined on miss. */
		get(hash){
			if(heights.has(hash)){ hits++; return heights.get(hash); }
			misses++;
			return undefined;
		},
		/** Store a height under the given hash. */
		set(hash, height){ heights.set(hash, height); },
		/** Has-check that doesn't bump hit/miss counters. */
		has(hash){ return heights.has(hash); },
		/** Drop a single hash (when a block's content changes). */
		invalidate(hash){ heights.delete(hash); },
		/** Drop everything (when the page geometry changes). */
		clear(){ heights.clear(); hits = 0; misses = 0; },
		/** Counts for diagnostics / tests. */
		stats(){ return { size: heights.size, hits, misses }; },
		/** Iterate keys (used by the stable-prefix algorithm in a later wave). */
		keys(){ return heights.keys(); },
	};
}
