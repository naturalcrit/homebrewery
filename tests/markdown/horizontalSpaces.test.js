/* eslint-disable max-lines */

import Markdown from 'naturalcrit/markdown.js';

describe('Hard Breaks', ()=>{
	test('Single Break', function() {
		const source = ':>\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>&nbsp;\n</p>`);
	});

	test('Double Break', function() {
		const source = ':>>\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>&nbsp;&nbsp;\n</p>`);
	});

	test('Triple Break', function() {
		const source = ':>>>\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>&nbsp;&nbsp;&nbsp;\n</p>`);
	});

	test('Many Break', function() {
		const source = ':>>>>>>>>>>\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n</p>`);
	});

	test('Multiple sets of Breaks', function() {
		const source = ':>>>\n:>>>\n:>>>';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>&nbsp;&nbsp;&nbsp;\n\n&nbsp;&nbsp;&nbsp;\n\n&nbsp;&nbsp;&nbsp;\n</p>`);
	});

	test('Break directly between two paragraphs', function() {
		const source = 'Line 1\n:>>\nLine 2';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>Line 1\n&nbsp;&nbsp;\n\nLine 2</p>`);
	});

	test('Ignored inside a code block', function() {
		const source = '```\n\n:>\n\n```\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<pre><code>\n:&gt;\n</code></pre>`);
	});

});

