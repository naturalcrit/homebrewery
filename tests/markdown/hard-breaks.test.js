

import Markdown from 'markdown.js';

describe('Hard Breaks', ()=>{
	test('Single Break', function() {
		const source = ':\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class='blank'></div>`);
	});

	test('Double Break', function() {
		const source = '::\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class='blank'></div>\n<div class='blank'></div>`);
	});

	test('Triple Break', function() {
		const source = ':::\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>`);
	});

	test('Many Break', function() {
		const source = '::::::::::\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>`);
	});

	test('Multiple sets of Breaks', function() {
		const source = ':::\n:::\n:::';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>\n<div class='blank'></div>`);
	});

	test('Break directly between two paragraphs', function() {
		const source = 'Line 1\n::\nLine 2';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>Line 1</p>\n<div class='blank'></div>\n<div class='blank'></div>\n<p>Line 2</p>`);
	});

	test('Ignored inside a code block', function() {
		const source = '```\n\n:\n\n```\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<pre><code>\n:\n</code></pre>`);
	});
});
