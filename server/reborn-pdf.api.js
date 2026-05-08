/* eslint max-lines: ["warn", {"max": 400, "skipBlankLines": true, "skipComments": true}] */
//
// Reborn PDF route.
//
// POST /api/reborn/pdf
//   Body: { documentJson: <Reborn AST>, options?: { ... } }
//   Response: 200 application/pdf (binary blob) on success.
//             503 application/json `{ error }` if puppeteer is unavailable
//             (the binary isn't installed, sandbox issues, etc.).
//             400 / 500 on malformed input or rendering errors.
//
// Architecture: we launch a single headless Chromium and reuse it across
// requests. Chromium navigates to `<baseUrl>/?print=true&docPayload=<base64>`
// where the client React bundle picks up the AST, renders it through the
// same MeasuringRenderer the screen uses, and signals readiness via
// `window.__rebornReady = true` (PrintShell in App.jsx). We then call
// `page.pdf({ format: 'Letter', printBackground: true, preferCSSPageSize: true })`
// and stream the buffer back.
//
// "Screen and print never diverge" — they can't, because they use the same
// renderer. The print-mode CSS only kills chrome and resets the dark
// background; layout, fonts, drop caps, ornaments are all the canonical
// 5ePHB stylesheet running in the page just like the editor.

import express from 'express';

const router = express.Router();

// In-memory store of pending render payloads, keyed by a one-time id. Sized
// to a single concurrent request per ~5s; anything older is garbage-collected
// so a stalled render can't leak. The print-mode page fetches from
// `/api/reborn/pdf/payload/:id` rather than receiving the doc through the URL,
// because base64-encoding a large document into a query string blows past
// Node's 8KB header limit (HTTP 431).
const pendingPayloads = new Map();
const PAYLOAD_TTL_MS = 60 * 1000;
function stashPayload(doc){
	const id = `r${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
	pendingPayloads.set(id, { doc, createdAt: Date.now() });
	// Lazy GC.
	for (const [k, v] of pendingPayloads){
		if(Date.now() - v.createdAt > PAYLOAD_TTL_MS) pendingPayloads.delete(k);
	}
	return id;
}

router.get('/api/reborn/pdf/payload/:id', (req, res)=>{
	const entry = pendingPayloads.get(req.params.id);
	if(!entry) return res.status(404).json({ error: 'unknown payload id' });
	res.setHeader('Content-Type', 'application/json');
	return res.status(200).end(JSON.stringify(entry.doc));
});

// Lazy-loaded puppeteer; we don't import it at module scope so a missing
// install doesn't crash the server (the route just returns 503).
let puppeteerImport = null;
let cachedBrowser = null;
let browserLaunchPromise = null;

async function loadPuppeteer(){
	if(puppeteerImport) return puppeteerImport;
	try {
		const mod = await import('puppeteer');
		puppeteerImport = mod.default || mod;
	} catch (e) {
		puppeteerImport = null;
		throw new Error(`puppeteer module not available: ${e.message}`);
	}
	return puppeteerImport;
}

async function getBrowser(){
	if(cachedBrowser){
		try {
			// `process` may have been killed by the OS or by an idle timeout.
			const proc = cachedBrowser.process();
			if(!proc || proc.killed){ cachedBrowser = null; }
		} catch (e) {
			cachedBrowser = null;
		}
	}
	if(cachedBrowser) return cachedBrowser;
	if(browserLaunchPromise) return browserLaunchPromise;
	browserLaunchPromise = (async ()=>{
		const puppeteer = await loadPuppeteer();
		const browser = await puppeteer.launch({
			headless : 'new',
			args     : [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--font-render-hinting=none',
			],
		});
		cachedBrowser = browser;
		browserLaunchPromise = null;
		// If the browser dies, reset the cache so the next request relaunches.
		browser.on('disconnected', ()=>{ if(cachedBrowser === browser) cachedBrowser = null; });
		return browser;
	})();
	try {
		return await browserLaunchPromise;
	} catch (e) {
		browserLaunchPromise = null;
		throw e;
	}
}

export async function shutdownPdfBrowser(){
	const b = cachedBrowser;
	cachedBrowser = null;
	if(b){
		try { await b.close(); } catch (e) { /* ignore */ }
	}
}

function getBaseUrl(req, options){
	if(options && options.baseUrl) return options.baseUrl;
	if(process.env.REBORN_PDF_BASE_URL) return process.env.REBORN_PDF_BASE_URL;
	const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').toString().split(',')[0].trim();
	const host  = req.get && req.get('host');
	if(host) return `${proto}://${host}`;
	return `http://localhost:${process.env.PORT || 8000}`;
}

router.post('/api/reborn/pdf', express.json({ limit: '25mb' }), async (req, res, next)=>{
	const { documentJson, options = {} } = req.body || {};
	if(!documentJson || typeof documentJson !== 'object'){
		return res.status(400).json({ error: 'documentJson is required and must be the AST object' });
	}

	let browser;
	try {
		browser = await getBrowser();
	} catch (e) {

		console.warn('[reborn-pdf] puppeteer unavailable:', e.message);
		return res.status(503).json({
			error  : 'PDF export unavailable: headless Chromium could not be launched on this server.',
			detail : e.message,
		});
	}

	// Stash the doc in the payload store and reference it via id. This keeps
	// the URL short enough to fit in any sane HTTP header limit.
	const payloadId = stashPayload(documentJson);
	const baseUrl = getBaseUrl(req, options);
	const url = `${baseUrl}/?print=true&payloadId=${encodeURIComponent(payloadId)}`;

	let page;
	try {
		page = await browser.newPage();
		await page.setViewport({ width: 1024, height: 1280, deviceScaleFactor: 2 });
		page.on('pageerror', (err)=>console.error('[reborn-pdf pageerror]', err.message));
		page.on('console',   (msg)=>{
			if(msg.type() === 'error') console.error('[reborn-pdf console.error]', msg.text());
		});

		await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
		// Wait for the canonical 5ePHB stylesheet to load and for the
		// MeasuringRenderer to settle. PrintShell in App.jsx flips
		// `window.__rebornReady = true` when the paginator has produced its
		// final page DOM and fonts are ready.
		await page.waitForSelector('link#reborn-theme-5ePHB', { timeout: 15000 });
		await page.waitForFunction(()=>window.__rebornReady === true, { timeout: 30000 });

		// Belt-and-suspenders: a final rAF + 100ms idle window so any final
		// paint (e.g. drop-cap background images) lands before we capture.
		await page.evaluate(()=>new Promise((r)=>requestAnimationFrame(()=>setTimeout(r, 100))));

		const pdfOptions = {
			format            : options.format || 'Letter',
			printBackground   : options.printBackground !== false,
			preferCSSPageSize : true,
			margin            : { top: 0, right: 0, bottom: 0, left: 0 },
		};
		const pdfBuffer = await page.pdf(pdfOptions);
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Length', pdfBuffer.length);
		res.setHeader('Content-Disposition', `inline; filename="${(documentJson.metadata && documentJson.metadata.title) || 'reborn-document'}.pdf"`);
		return res.status(200).end(pdfBuffer);
	} catch (e) {

		console.error('[reborn-pdf] render failed:', e);
		return res.status(500).json({ error: `PDF render failed: ${e.message}` });
	} finally {
		// Drop the stashed payload now that we've consumed it.
		pendingPayloads.delete(payloadId);
		if(page){
			try { await page.close(); } catch (err) { /* ignore */ }
		}
	}
});

// Health check — useful for the test harness to know whether puppeteer is
// available without paying the cost of an actual render.
router.get('/api/reborn/pdf/health', async (_req, res)=>{
	try {
		await loadPuppeteer();
		return res.status(200).json({ ok: true, puppeteer: 'available' });
	} catch (e) {
		return res.status(503).json({ ok: false, error: e.message });
	}
});

export default router;
