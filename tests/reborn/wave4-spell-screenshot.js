#!/usr/bin/env node
//
// Wave 4 spell-block screenshot. Runs the editor over the demo document
// (which includes the spell manifest's contribution side-by-side with the
// stat block on page 2) and captures `wave4-spell-inserted.png`.
//
// Assumes a build is already on disk; run `npm run build` first.

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

const PORT = 4174;

async function startServer(){
	const app = express();
	app.use(express.static(buildDir));
	app.get(/.*/, (_req, res)=>res.sendFile(path.join(buildDir, 'index.html')));
	return new Promise((resolve)=>{
		const srv = app.listen(PORT, ()=>resolve(srv));
	});
}

async function main(){
	await fs.mkdir(screenshotsDir, { recursive: true });

	const server = await startServer();
	const browser = await puppeteer.launch({
		headless : 'new',
		args     : ['--no-sandbox', '--disable-setuid-sandbox'],
	});
	try {
		const page = await browser.newPage();
		await page.setViewport({ width: 1024, height: 1280, deviceScaleFactor: 2 });
		page.on('pageerror', (err)=>console.error('[pageerror]', err.message));
		page.on('console',   (msg)=>{
			if(msg.type() === 'error') console.error('[console.error]', msg.text());
		});

		await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0', timeout: 60000 });
		await page.waitForSelector('.brewRenderer .page .ProseMirror', { timeout: 10000 });
		await page.waitForSelector('.brewRenderer .page .spell', { timeout: 10000 });
		await page.waitForSelector('.brewRenderer .page .monster.frame', { timeout: 10000 });
		await page.evaluate(()=>document.fonts.ready);
		await new Promise((r)=>setTimeout(r, 500));

		// Verify both blocks coexist.
		const counts = await page.evaluate(()=>({
			spell    : document.querySelectorAll('.brewRenderer .spell').length,
			monster  : document.querySelectorAll('.brewRenderer .monster.frame').length,
			h4Inside : document.querySelectorAll('.brewRenderer .spell h4').length,
		}));
		console.log('[wave4 spell] block counts:', counts);
		if(counts.spell < 1 || counts.monster < 1){
			throw new Error(`Expected at least one spell and one stat block, got ${JSON.stringify(counts)}`);
		}

		const out = path.join(screenshotsDir, 'wave4-spell-inserted.png');
		await page.screenshot({ path: out, fullPage: true });
		console.log('Wrote', out);

		// Focused screenshot: just the spell block.
		const spellEl = await page.$('.brewRenderer .spell');
		if(spellEl){
			const focused = path.join(screenshotsDir, 'wave4-spell-focused.png');
			await spellEl.screenshot({ path: focused });
			console.log('Wrote', focused);
		}
	} finally {
		await browser.close();
		server.close();
	}
}

main().catch((err)=>{
	console.error(err);
	process.exit(1);
});
