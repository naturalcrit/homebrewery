/* eslint-disable max-lines */

import Markdown from 'naturalcrit/markdown.js';

describe('Hard Breaks', ()=>{
	test('Single Break', function() {
		const source = ':\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<br>`);
	});

	test('Double Break', function() {
		const source = '::\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<br>\n<br>`);
	});

	test('Triple Break', function() {
		const source = ':::\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<br>\n<br>\n<br>`);
	});

	test('Many Break', function() {
		const source = '::::::::::\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<br>\n<br>\n<br>\n<br>\n<br>\n<br>\n<br>\n<br>\n<br>\n<br>`);
	});

	test('Multiple sets of Breaks', function() {
		const source = ':::\n:::\n:::';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<br>\n<br>\n<br>\n<br>\n<br>\n<br>\n<br>\n<br>\n<br>`);
	});

	test('Break directly between two paragraphs', function() {
		const source = 'Line 1\n::\nLine 2';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>Line 1</p>\n<br>\n<br>\n<p>Line 2</p>`);
	});

	test('Ignored inside a code block', function() {
		const source = '```\n\n:\n\n```\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<pre><code>\n:\n</code></pre>`);
	});
});
