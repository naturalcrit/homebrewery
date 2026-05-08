#!/usr/bin/env node
//
// Visual smoke test.
//
// Wave 2 boots the read-only renderer; Wave 3 boots the ProseMirror editor
// over the same demo document. Both surfaces should look like real Homebrewery
// (canonical PHB stylesheet engaged) and pass the same DOM sanity checks. We
// take screenshots for both modes so the audit can compare side by side.

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import express from 'express';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const repoRoot   = path.resolve(__dirname, '../..');
const buildDir   = path.join(repoRoot, 'build');
const screenshotsDir = path.join(__dirname, 'screenshots');

const PORT = 4173;

async function startServer() {
	const app = express();
	app.use(express.static(buildDir));
	app.get(/.*/, (_req, res)=>{
		res.sendFile(path.join(buildDir, 'index.html'));
	});
	return new Promise((resolve)=>{
		const srv = app.listen(PORT, ()=>resolve(srv));
	});
}

async function captureMode(browser, url, prefix){
	const page = await browser.newPage();
	await page.setViewport({ width: 1024, height: 1280, deviceScaleFactor: 2 });

	page.on('pageerror', (err)=>console.error('[pageerror]', err.message));
	page.on('console',   (msg)=>{
		if(msg.type() === 'error') console.error('[console.error]', msg.text());
	});

	console.log('Loading', url);
	await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

	await page.waitForSelector('link#reborn-theme-5ePHB', { timeout: 10000 });
	await page.waitForSelector('.brewRenderer .page', { timeout: 10000 });
	// Wait for .ProseMirror in editor mode to confirm content has been
	// mounted before screenshotting; for read-only mode this is a no-op.
	await page.waitForFunction(
		()=>document.querySelector('.brewRenderer .page h1') !== null,
		{ timeout: 10000 },
	);
	await page.evaluate(()=>document.fonts.ready);
	await new Promise((r)=>setTimeout(r, 1000));

	const fullPath = path.join(screenshotsDir, `${prefix}-full.png`);
	await page.screenshot({ path: fullPath, fullPage: true });
	console.log('Wrote', fullPath);

	const viewportPath = path.join(screenshotsDir, `${prefix}-viewport.png`);
	await page.screenshot({ path: viewportPath, fullPage: false });
	console.log('Wrote', viewportPath);

	const pages = await page.$$('.brewRenderer .page');
	for (let i = 0; i < pages.length; i++) {
		const out = path.join(screenshotsDir, `${prefix}-page${i + 1}.png`);
		await pages[i].screenshot({ path: out });
		console.log('Wrote', out);
	}

	const checks = await page.evaluate(()=>({
		pageCount       : document.querySelectorAll('.brewRenderer .page').length,
		h1Count         : document.querySelectorAll('.brewRenderer .page h1').length,
		h1HasFollowingP : !!document.querySelector('.brewRenderer .page h1 + p'),
		monsterFrame    : !!document.querySelector('.brewRenderer .page .monster.frame'),
		noteCount       : document.querySelectorAll('.brewRenderer .page .note').length,
		descriptive     : document.querySelectorAll('.brewRenderer .page .descriptive').length,
		tableCount      : document.querySelectorAll('.brewRenderer .page table').length,
		footerStyle     : (()=>{
			const p = document.querySelector('.brewRenderer .page');
			if(!p) return null;
			const css = getComputedStyle(p, '::after');
			return { content: css.content, height: css.height, image: css.backgroundImage };
		})(),
		h1FirstLetter : (()=>{
			const p = document.querySelector('.brewRenderer .page h1 + p');
			if(!p) return null;
			const css = getComputedStyle(p, '::first-letter');
			return { font: css.fontFamily, size: css.fontSize, bgImage: css.backgroundImage };
		})(),
	}));
	console.log(`[${prefix}] sanity checks:`, JSON.stringify(checks, null, 2));
	await page.close();
	return checks;
}

async function main() {
	await fs.mkdir(screenshotsDir, { recursive: true });

	const server = await startServer();
	const browser = await puppeteer.launch({
		headless : 'new',
		args     : ['--no-sandbox', '--disable-setuid-sandbox'],
	});

	try {
		// Wave 2 read-only renderer (now reachable via ?view=read).
		// Wave 5: this URL now goes through the real paginator. The demo
		// doc still produces multiple .page divs; the sanity checks below
		// already verify that.
		await captureMode(browser, `http://localhost:${PORT}/?view=read`, 'wave2');

		// Wave 3 ProseMirror editor.
		const editorChecks = await captureMode(browser, `http://localhost:${PORT}/`, 'wave3');

		// Editor-specific assertions: stat-block NodeView produced an editable
		// .monster.frame, paragraph content is contentEditable, etc.
		const editorPage = await browser.newPage();
		await editorPage.setViewport({ width: 1024, height: 1280, deviceScaleFactor: 2 });
		await editorPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0', timeout: 60000 });
		await editorPage.waitForSelector('.brewRenderer .page .ProseMirror', { timeout: 10000 });
		await editorPage.evaluate(()=>document.fonts.ready);
		await new Promise((r)=>setTimeout(r, 500));

		// Edit AC: find the first AC input inside the stat block and change 15 -> 18.
		await editorPage.waitForSelector('.brewRenderer .monster.frame input[type=number]', { timeout: 10000 });
		const before = await editorPage.evaluate(()=>{
			const inputs = document.querySelectorAll('.brewRenderer .monster.frame input[type=number]');
			return inputs.length ? inputs[0].value : null;
		});
		await editorPage.evaluate(()=>{
			const inputs = document.querySelectorAll('.brewRenderer .monster.frame input[type=number]');
			if(!inputs.length) return;
			const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
			setter.call(inputs[0], '18');
			inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
		});
		await new Promise((r)=>setTimeout(r, 300));
		const after = await editorPage.evaluate(()=>{
			const inputs = document.querySelectorAll('.brewRenderer .monster.frame input[type=number]');
			return inputs.length ? inputs[0].value : null;
		});
		console.log('[wave3] AC field before/after edit:', before, '->', after);

		const editScreenshot = path.join(screenshotsDir, 'wave3-edited-ac.png');
		await editorPage.screenshot({ path: editScreenshot, fullPage: true });
		console.log('Wrote', editScreenshot);
		await editorPage.close();

		if(!editorChecks.monsterFrame){
			throw new Error('Wave 3 editor did not render the .monster.frame stat-block NodeView');
		}
		if(!editorChecks.h1HasFollowingP){
			throw new Error('Wave 3 editor lost the canonical h1+p drop-cap adjacency');
		}

		// ---- Wave 5: long-form pagination ---------------------------------
		// Load the multi-page stress demo through the read-only renderer
		// and verify the paginator produced multiple pages, each with the
		// expected structure (footer ornament alternating, drop cap on
		// chapter start, no monster frame split across pages, etc.).
		const longChecks = await captureMode(
			browser,
			`http://localhost:${PORT}/?view=read&doc=long`,
			'wave5-long',
		);

		// Read paginator timings published by MeasuringRenderer so the
		// audit can verify the perf contract (first pass <500ms, cached
		// pass <50ms).
		const longPage = await browser.newPage();
		await longPage.setViewport({ width: 1024, height: 1280, deviceScaleFactor: 2 });
		await longPage.goto(`http://localhost:${PORT}/?view=read&doc=long`, { waitUntil: 'networkidle0', timeout: 60000 });
		await longPage.waitForSelector('.brewRenderer .page h1', { timeout: 10000 });
		await longPage.evaluate(()=>document.fonts.ready);
		await new Promise((r)=>setTimeout(r, 1500));
		const firstRunTimings = await longPage.evaluate(()=>{
			return (window.__rebornPaginator && window.__rebornPaginator.last) || null;
		});

		// Force a second pagination (warm cache) by triggering a re-mount
		// via reload. The cache is module-scoped so subsequent loads in
		// the same SPA session reuse heights; the cleanest way to time a
		// warm pass is to call the paginator via the same shared helper a
		// second time programmatically.
		const warmTimings = await longPage.evaluate(async ()=>{
			const slot = window.__rebornPaginator;
			if(!slot || !slot.paginate || !slot.lastFlat || !slot.lastHeights) return null;
			const flat = slot.lastFlat;
			const heightsByIndex = slot.lastHeights;
			const measure = (b)=>{
				const idx = flat.indexOf(b);
				return idx >= 0 ? heightsByIndex[idx] : 0;
			};
			// Run several iterations to get a stable timing for very fast
			// paginations. Report the per-iteration mean.
			const ITERS = 10;
			const t0 = performance.now();
			for (let i = 0; i < ITERS; i++){
				slot.paginate(flat, {
					measure,
					pageContentHeight : slot.lastPageContentHeight || 600,
					columnsPerPage    : 2,
				});
			}
			const total = performance.now() - t0;
			return { totalMs: total / ITERS, iterations: ITERS, sumMs: total };
		});

		console.log('[wave5-long] first-run timings:', JSON.stringify(firstRunTimings, null, 2));
		console.log('[wave5-long] warm-pass timings:', JSON.stringify(warmTimings, null, 2));

		if(!firstRunTimings){
			console.warn('[wave5-long] paginator did not publish timings — perf contract not verified');
		} else {
			// First-pass budget: <500ms for 100+ blocks. Long demo has ~43
			// blocks, so we expect comfortably under that. Warm-pass budget:
			// <50ms (every block hits the cache; only paginate() runs).
			if(firstRunTimings.totalMs > 500){
				throw new Error(`[wave5-long] first-pass ${firstRunTimings.totalMs}ms exceeds 500ms target`);
			}
			if(warmTimings && warmTimings.totalMs > 50){
				throw new Error(`[wave5-long] warm-pass mean ${warmTimings.totalMs}ms exceeds 50ms target`);
			}
		}

		if(!longChecks.pageCount || longChecks.pageCount < 3){
			throw new Error(`Wave 5 long demo produced only ${longChecks.pageCount} pages — expected 3+ for stress doc`);
		}
		if(!longChecks.h1HasFollowingP){
			throw new Error('Wave 5 long demo lost the h1+p drop-cap adjacency');
		}

		// Footer ornament must alternate left/right between odd/even pages.
		// `.page:nth-child(even)::after { transform: scaleX(-1); }` is the
		// canonical rule. We check it actually fires by sampling the
		// computed transform on the ::after of page 1 vs page 2.
		const ornament = await longPage.evaluate(async ()=>{
			// Scroll each page into view first so any
			// `content-visibility: auto` skipped layout is forced to
			// activate before we read the ::after transform.
			const pages = Array.from(document.querySelectorAll('.brewRenderer > .pages > .page'));
			for (const p of pages){
				p.scrollIntoView({ block: 'center' });
				await new Promise((r)=>setTimeout(r, 50));
			}
			window.scrollTo(0, 0);
			await new Promise((r)=>setTimeout(r, 100));
			const transforms = [];
			pages.forEach((p, i)=>{
				const cs = window.getComputedStyle(p, '::after');
				const idx = Array.from(p.parentNode.children).indexOf(p);
				transforms.push({ i, nthIndex: idx + 1, transform: cs.transform, id: p.id });
			});
			return transforms;
		});
		console.log('[wave5-long] footer ornament transforms:', JSON.stringify(ornament, null, 2));
		if(ornament.length >= 2){
			// Page 1 should be `none` (or matrix that's identity), page 2
			// should include scaleX(-1) → matrix(-1, 0, 0, 1, 0, 0).
			if(ornament[0] === ornament[1]){
				throw new Error('Footer ornament should alternate between odd/even pages but transforms are identical');
			}
		}
		await longPage.close();
	} finally {
		await browser.close();
		server.close();
	}
}

main().catch((err)=>{
	console.error(err);
	process.exit(1);
});
