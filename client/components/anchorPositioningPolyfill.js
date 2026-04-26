let polyfillPromise;

const supportsAnchorPositioning = ()=>'anchorName' in document.documentElement.style;

const afterInitialRender = ()=>new Promise((resolve)=>{
	requestAnimationFrame(()=>{
		requestAnimationFrame(resolve);
	});
});

export const bootstrapAnchorPositioningPolyfill = ()=>{
	if(supportsAnchorPositioning()) return Promise.resolve(false);
	if(polyfillPromise) return polyfillPromise;

	polyfillPromise = afterInitialRender()
		.then(async ()=>{
			const { default: polyfill } = await import('@oddbird/css-anchor-positioning/fn');
			await polyfill();
			return true;
		})
		.catch((error)=>{
			polyfillPromise = undefined;
			throw error;
		});

	return polyfillPromise;
};