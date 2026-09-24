/*
This file basically checks support for Anchor Positioning API in the browser,
and then loads the Oddbird polyfill if support is lacking. 
*/

let polyfillPromise;

// look for `anchorName` in the computed styles
const supportsAnchorPositioning = ()=>'anchorName' in document.documentElement.style;

export const bootstrapAnchorPositioningPolyfill = ()=>{
	if(supportsAnchorPositioning()) return Promise.resolve(false);
	if(polyfillPromise) return polyfillPromise;

	polyfillPromise = (async ()=>{
		try {
			const { default: polyfill } = await import('@oddbird/css-anchor-positioning/fn');
			await polyfill();
			return true;
		} catch (error){
			polyfillPromise = undefined;
			throw error;
		}
	})();

	return polyfillPromise;
};