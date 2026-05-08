#!/usr/bin/env node
//
// PDF pipeline end-to-end harness.
//
// 1. Boots a tiny static-file Express that serves the build directory and
//    mounts the reborn-pdf API route. The route launches Puppeteer, navigates
//    back to the static server's `/?print=true` URL, and returns a PDF.
// 2. Calls the route with the long demo doc, saves the PDF to
//    tests/reborn/artifacts/wave6-long.pdf, and counts pages from the PDF
//    catalog.
// 3. Renders the print-mode page directly (no PDF) and screenshots page 1
//    so we can visually compare against tests/reborn/screenshots/wave5-long-page1.png.
//
// Run with: node tests/reborn/pdf-e2e.js

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import express from 'express';
import puppeteer from 'puppeteer';
import rebornPdfApi, { shutdownPdfBrowser } from '../../server/reborn-pdf.api.js';
import longDemo from '../../client/reborn/document/longDemo.js';
import demoDocument from '../../client/reborn/document/demoDocument.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const repoRoot   = path.resolve(__dirname, '../..');
const buildDir   = path.join(repoRoot, 'build');
const artifacts  = path.join(__dirname, 'artifacts');
const screenshots = path.join(__dirname, 'screenshots');

const PORT = 4174;

async function startServer(){
	const app = express();
	app.use(rebornPdfApi);
	app.use('/', express.static(buildDir));
	app.get(/.*/, (_req, res)=>{
		res.sendFile(path.join(buildDir, 'index.html'));
	});
	return new Promise((resolve)=>{
		const srv = app.listen(PORT, '127.0.0.1', ()=>resolve(srv));
	});
}

// Cheap-and-cheerful PDF page count: Chromium's PDFs include a `/Count N`
// entry in the catalog's `/Pages` object. This is a "tell me roughly the
// page count" test, not a parser. We scan for `/Type /Pages` and grab the
// `/Count` after it.
function countPdfPages(buf){
	const haystack = buf.toString('latin1');
	const m = /\/Type\s*\/Pages[^>]*\/Count\s+(\d+)/.exec(haystack);
	if(m) return Number(m[1]);
	// Fallback: count `/Type /Page` (singular) occurrences, which is the
	// number of leaf page objects in the doc.
	return (haystack.match(/\/Type\s*\/Page\b/g) || []).length;
}

async function main(){
	await fs.mkdir(artifacts, { recursive: true });
	const server = await startServer();

	// Use REBORN_PDF_BASE_URL so the route's getBaseUrl picks the right host
	// when receiving the synthetic request.
	process.env.REBORN_PDF_BASE_URL = `http://127.0.0.1:${PORT}`;

	try {
		// (a) demo doc round-trip via the API.
		console.log('[pdf-e2e] requesting PDF for demoDocument');
		let resp;
		try {
			resp = await fetch(`http://127.0.0.1:${PORT}/api/reborn/pdf`, {
				method  : 'POST',
				headers : { 'Content-Type': 'application/json' },
				body    : JSON.stringify({ documentJson: demoDocument }),
			});
		} catch (e) {
			console.error('[pdf-e2e] fetch failed:', e.message);
			process.exit(1);
		}
		if(!resp.ok){
			const txt = await resp.text();
			console.error(`[pdf-e2e] PDF API returned ${resp.status}: ${txt}`);
			process.exit(2);
		}
		const ct = resp.headers.get('content-type') || '';
		if(!/application\/pdf/.test(ct)){
			console.error(`[pdf-e2e] expected application/pdf, got ${ct}`);
			process.exit(3);
		}
		const demoBuf = Buffer.from(await resp.arrayBuffer());
		const demoPath = path.join(artifacts, 'wave6-demo.pdf');
		await fs.writeFile(demoPath, demoBuf);
		console.log(`[pdf-e2e] wrote ${demoPath} (${demoBuf.length} bytes, ~${countPdfPages(demoBuf)} pages)`);

		// (b) long demo via the API. Save + count pages.
		console.log('[pdf-e2e] requesting PDF for longDemo');
		const longResp = await fetch(`http://127.0.0.1:${PORT}/api/reborn/pdf`, {
			method  : 'POST',
			headers : { 'Content-Type': 'application/json' },
			body    : JSON.stringify({ documentJson: longDemo }),
		});
		if(!longResp.ok){
			const txt = await longResp.text();
			console.error(`[pdf-e2e] long PDF API returned ${longResp.status}: ${txt}`);
			process.exit(4);
		}
		const longBuf = Buffer.from(await longResp.arrayBuffer());
		const longPath = path.join(artifacts, 'wave6-long.pdf');
		await fs.writeFile(longPath, longBuf);
		const pageCount = countPdfPages(longBuf);
		console.log(`[pdf-e2e] wrote ${longPath} (${longBuf.length} bytes, ~${pageCount} pages)`);

		// (c) Compare against the screen paginator: load the long demo in
		// `?print=true` mode and count the .page divs the renderer produced.
		const browser = await puppeteer.launch({
			headless : 'new',
			args     : ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		try {
			const page = await browser.newPage();
			await page.setViewport({ width: 1024, height: 1280, deviceScaleFactor: 2 });
			page.on('pageerror', (err)=>console.error('[pageerror]', err.message));
			const url = `http://127.0.0.1:${PORT}/?view=read&doc=long`;
			await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
			await page.waitForSelector('.brewRenderer .page h1', { timeout: 15000 });
			await page.evaluate(()=>document.fonts.ready);
			await new Promise((r)=>setTimeout(r, 1500));
			const screenPageCount = await page.evaluate(
				()=>document.querySelectorAll('.brewRenderer > .pages > .page').length,
			);
			console.log(`[pdf-e2e] long demo: PDF=${pageCount} pages, screen=${screenPageCount} pages`);
			if(Math.abs(pageCount - screenPageCount) > 1){
				console.error(`[pdf-e2e] PDF / screen page-count mismatch: ${pageCount} vs ${screenPageCount}`);
				process.exit(5);
			}

			// (d) Screenshot page 1 of the print-mode render so the audit can
			// eyeball it against wave5-long-page1.png.
			const printPage = await browser.newPage();
			await printPage.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });
			const printUrl = `http://127.0.0.1:${PORT}/?print=true&doc=long`;
			await printPage.goto(printUrl, { waitUntil: 'networkidle0', timeout: 60000 });
			await printPage.waitForFunction(()=>window.__rebornReady === true, { timeout: 30000 });
			await new Promise((r)=>setTimeout(r, 500));
			const pages = await printPage.$$('.brewRenderer > .pages > .page');
			if(pages.length){
				const out = path.join(screenshots, 'wave6-print-page1.png');
				await pages[0].screenshot({ path: out });
				console.log(`[pdf-e2e] wrote print-mode screenshot ${out}`);
			}
			await printPage.close();
			await page.close();
		} finally {
			await browser.close();
		}
	} finally {
		await shutdownPdfBrowser();
		server.close();
	}
}

main().catch((err)=>{
	console.error(err);
	process.exit(1);
});
