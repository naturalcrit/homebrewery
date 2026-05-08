/**
 * Wave 7: DOM contract tests.
 *
 * The canonical PHB stylesheet (and every theme that overrides it) targets
 * specific DOM shapes. If the renderer reorders, wraps, or strips elements,
 * the painted look silently breaks even though every functional test still
 * passes. These tests pin the structural contracts the stylesheet relies on:
 *
 *   - Stat block: `<div class="monster frame">` with `<dl>`, `<table>`,
 *     `<hr>` triangle dividers in canonical positions.
 *   - Chapter opener: `<h1>` followed by `<p>` as adjacent siblings (no
 *     wrapper) so `h1 + p::first-letter` drop-cap selector still fires.
 *   - `.page` is a direct child of `.pages` so the alternating-ornament
 *     `:nth-child(even)` rule still works.
 *
 * Implementation: render via `react-dom/server.renderToStaticMarkup` and parse
 * the output through jsdom. We don't mount into a real browser — that's the
 * job of `tests/reborn/visual-smoke.js`.
 */

// jest-environment-jsdom isn't a project dep; reach for jsdom-global, which
// the safeHTML test already uses for the same reason.
import globalJsdom from 'jsdom-global';
globalJsdom();

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Block from '../../client/reborn/renderer/Block.jsx';
import Page  from '../../client/reborn/renderer/Page.jsx';
import { manifests } from '../../client/reborn/blocks/registry.js';

function htmlOf(element){
	return renderToStaticMarkup(element);
}
function parse(html){
	const div = document.createElement('div');
	div.innerHTML = html;
	return div;
}

describe('DOM contract — stat block', ()=>{
	const goblin = manifests.statBlock.createAst({
		name           : 'Goblin',
		armorClass     : 15,
		armorClassNote : 'leather, shield',
		hitPoints      : 7,
		hitDice        : '2d6',
		speed          : '30 ft.',
		abilities      : { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
		skills         : 'Stealth +6',
		senses         : 'darkvision 60 ft., passive Perception 9',
		languages      : 'Common, Goblin',
		challenge      : '1/4 (50 XP)',
		actions        : [{ name: 'Scimitar', text: [{ text: 'Melee Weapon Attack' }] }],
	});

	test('emits the canonical .monster.frame container', ()=>{
		const root = parse(htmlOf(<Block block={goblin} />));
		const frame = root.querySelector('div.monster.frame');
		expect(frame).not.toBeNull();
	});

	test('has at least two <dl> blocks (top attrs + bottom attrs) with <dt><dd> pairs', ()=>{
		const root = parse(htmlOf(<Block block={goblin} />));
		const dls = root.querySelectorAll('div.monster.frame > dl');
		expect(dls.length).toBeGreaterThanOrEqual(2);
		// First <dl> must contain Armor Class / Hit Points / Speed (at least).
		const firstText = dls[0].textContent;
		expect(firstText).toMatch(/Armor Class/);
		expect(firstText).toMatch(/Hit Points/);
		expect(firstText).toMatch(/Speed/);
		// Each <dt> matched by a <dd> sibling.
		for (const dl of dls){
			const dts = dl.querySelectorAll('dt');
			const dds = dl.querySelectorAll('dd');
			expect(dts.length).toBe(dds.length);
			expect(dts.length).toBeGreaterThan(0);
		}
	});

	test('has the ability <table> with STR/DEX/CON/INT/WIS/CHA headers', ()=>{
		const root = parse(htmlOf(<Block block={goblin} />));
		const table = root.querySelector('div.monster.frame > table');
		expect(table).not.toBeNull();
		const ths = [...table.querySelectorAll('th')].map((th)=>th.textContent);
		expect(ths).toEqual(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']);
	});

	test('has the four canonical <hr> triangle dividers in order', ()=>{
		const root = parse(htmlOf(<Block block={goblin} />));
		const frame = root.querySelector('div.monster.frame');
		// The PHB stat block uses 4 hrs: after the type/alignment line, after
		// the top dl, after the abilities table, and after the bottom dl.
		const hrs = frame.querySelectorAll(':scope > hr');
		expect(hrs.length).toBe(4);

		// Order check: between the children of frame, the dividers should
		// alternate with the structural blocks. Concretely, the immediate
		// children should match the pattern: h2, p, hr, dl, hr, table, hr,
		// dl, hr, [more...].
		const childTags = [...frame.children].map((c)=>c.tagName.toLowerCase());
		const sentinel = childTags.slice(0, 9);
		expect(sentinel).toEqual(['h2', 'p', 'hr', 'dl', 'hr', 'table', 'hr', 'dl', 'hr']);
	});

	test('the action heading appears as <h3>Actions</h3> followed by <p> entries', ()=>{
		const root = parse(htmlOf(<Block block={goblin} />));
		const frame = root.querySelector('div.monster.frame');
		const h3 = [...frame.querySelectorAll('h3')].find((h)=>h.textContent === 'Actions');
		expect(h3).toBeDefined();
		// nextElementSibling must be a <p> (the trait/action paragraph).
		expect(h3.nextElementSibling.tagName.toLowerCase()).toBe('p');
		// And the action <em><strong>Scimitar.</strong></em> shape is intact.
		expect(h3.nextElementSibling.querySelector('em > strong')).not.toBeNull();
	});
});

describe('DOM contract — chapter opener (h1 + p drop-cap)', ()=>{
	test('h1 immediately followed by p with no intervening wrapper', ()=>{
		// Render two blocks in sequence inside a div: h1 chapter heading +
		// opening paragraph. The PHB drop-cap selector targets `h1 + p`,
		// which only matches when the two are adjacent SIBLINGS.
		const html = htmlOf(
			<div className='page'>
				<Block block={{ type: 'heading', level: 1, content: [{ text: 'The Sunken Grove' }] }} />
				<Block block={{ type: 'paragraph', content: [{ text: 'Centuries before the coast was charted, an emerald spring fed a grove…' }] }} />
				<div className='pageNumber'>1</div>
			</div>,
		);
		const root = parse(html);
		const page = root.querySelector('.page');
		const h1 = page.querySelector('h1');
		expect(h1).not.toBeNull();
		// nextElementSibling must be a <p>.
		const next = h1.nextElementSibling;
		expect(next).not.toBeNull();
		expect(next.tagName.toLowerCase()).toBe('p');
		// And the parent IS .page (no wrapper between them).
		expect(h1.parentElement.classList.contains('page')).toBe(true);
		expect(next.parentElement.classList.contains('page')).toBe(true);
	});
});

describe('DOM contract — Page child structure', ()=>{
	test('Page renders as <div class="page" id="pN"> with blocks as direct children', ()=>{
		const page = {
			blocks : [
				{ type: 'heading', level: 1, content: [{ text: 'A Page' }] },
				{ type: 'paragraph', content: [{ text: 'Body text.' }] },
				{ type: 'hr' },
			],
		};
		const root = parse(htmlOf(<Page page={page} number={3} />));
		const div = root.querySelector('div.page');
		expect(div).not.toBeNull();
		expect(div.getAttribute('id')).toBe('p3');
		// Direct children: h1, p, hr, .pageNumber. No wrappers.
		const childTags = [...div.children].map((c)=>c.tagName.toLowerCase());
		expect(childTags).toEqual(['h1', 'p', 'hr', 'div']);
		expect(div.children[3].className).toBe('pageNumber');
		expect(div.children[3].textContent).toBe('3');
	});

	test('multiple Pages mounted as siblings under a .pages parent preserve nth-child(even)', ()=>{
		// We don't render through BrewRenderer directly here (it uses
		// MeasuringRenderer with browser layout). We assert the static
		// invariant that <Page> is itself the right element so
		// `.pages > .page:nth-child(even)` still resolves.
		const html = htmlOf(
			<div className='pages'>
				<Page page={{ blocks: [{ type: 'paragraph', content: [{ text: 'p1' }] }] }} number={1} />
				<Page page={{ blocks: [{ type: 'paragraph', content: [{ text: 'p2' }] }] }} number={2} />
				<Page page={{ blocks: [{ type: 'paragraph', content: [{ text: 'p3' }] }] }} number={3} />
			</div>,
		);
		const root = parse(html);
		const pages = root.querySelector('.pages');
		expect(pages).not.toBeNull();
		// Direct children must all be `.page` — no wrappers.
		const childClasses = [...pages.children].map((c)=>c.className);
		expect(childClasses).toEqual(['page', 'page', 'page']);
		// And :nth-child(even) selects exactly p2 (index 1, 0-based; 2nd in 1-based).
		const evens = pages.querySelectorAll(':scope > .page:nth-child(even)');
		expect(evens.length).toBe(1);
		expect(evens[0].getAttribute('id')).toBe('p2');
	});
});

describe('DOM contract — note callout structure', ()=>{
	test('renders <div class="note"> with <h5> title then <p> body', ()=>{
		const block = manifests.note.createAst({
			title : [{ text: 'Heads Up' }],
			body  : [{ type: 'paragraph', content: [{ text: 'Body line.' }] }],
		});
		const root = parse(htmlOf(<Block block={block} />));
		const note = root.querySelector('div.note');
		expect(note).not.toBeNull();
		const childTags = [...note.children].map((c)=>c.tagName.toLowerCase());
		expect(childTags[0]).toBe('h5');
		expect(childTags[1]).toBe('p');
	});
});
