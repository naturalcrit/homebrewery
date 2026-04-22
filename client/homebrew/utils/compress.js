import { gzipSync, strToU8 } from 'fflate';

// Compresses a JS value to gzip-encoded bytes for upload. Previously the editor's save path
// ran `gzipSync(strToU8(JSON.stringify(obj)))` synchronously on the main thread; on a 50k-line
// brew that's ~100-300ms of jank during save. This helper:
//   1. Prefers the browser-native streaming CompressionStream API — runs off-thread, chunked,
//      yields to layout/paint between chunks.
//   2. Falls back to fflate's sync gzip for Safari < 16.4, SSR/test envs, and any runtime
//      where CompressionStream throws mid-pipeline (spec quirks, OOM, etc). Save must not
//      fail just because the faster path is unavailable.
export const compressJsonForUpload = async (obj)=>{
	const json = JSON.stringify(obj);
	if(typeof CompressionStream === 'function' && typeof Response === 'function' && typeof Blob === 'function') {
		try {
			const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
			const buffer = await new Response(stream).arrayBuffer();
			return new Uint8Array(buffer);
		} catch (err) {
			// Fall through to the sync path. Log but don't surface — the save should still succeed.
			console.warn('CompressionStream failed, falling back to fflate:', err);
		}
	}
	return gzipSync(strToU8(json));
};
