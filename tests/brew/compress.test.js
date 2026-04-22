import { gunzipSync, strFromU8 } from 'fflate';
import { compressJsonForUpload } from '../../client/homebrew/utils/compress.js';

// Remember native globals so each test can override and restore cleanly.
const realCompressionStream = globalThis.CompressionStream;
const realResponse          = globalThis.Response;
const realBlob              = globalThis.Blob;

const decode = (bytes)=>JSON.parse(strFromU8(gunzipSync(bytes)));

afterEach(()=>{
	globalThis.CompressionStream = realCompressionStream;
	globalThis.Response          = realResponse;
	globalThis.Blob              = realBlob;
});

test('compressJsonForUpload falls back to fflate when CompressionStream is absent', async ()=>{
	globalThis.CompressionStream = undefined;
	const payload = { text: 'hello world', nums: [1, 2, 3] };
	const bytes = await compressJsonForUpload(payload);
	expect(bytes).toBeInstanceOf(Uint8Array);
	expect(decode(bytes)).toEqual(payload);
});

test('compressJsonForUpload falls back to fflate when CompressionStream throws', async ()=>{
	// Simulate a runtime that advertises CompressionStream but fails mid-pipeline. The save
	// path must not blow up — we always have the sync fallback.
	globalThis.CompressionStream = class { constructor() { throw new Error('boom'); } };
	const payload = { text: 'resilient', n: 42 };
	const bytes = await compressJsonForUpload(payload);
	expect(bytes).toBeInstanceOf(Uint8Array);
	expect(decode(bytes)).toEqual(payload);
});

test('compressJsonForUpload handles large payloads round-trip', async ()=>{
	// Forces the fflate path since CompressionStream requires browser APIs not in jest's node env.
	globalThis.CompressionStream = undefined;
	const bigText = 'x'.repeat(250_000);
	const payload = { text: bigText, meta: { length: bigText.length } };
	const bytes = await compressJsonForUpload(payload);
	expect(bytes.length).toBeLessThan(bigText.length); // gzip must actually compress
	expect(decode(bytes)).toEqual(payload);
});
