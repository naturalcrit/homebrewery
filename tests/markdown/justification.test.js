/* eslint-disable max-lines */

import Markdown from 'naturalcrit/markdown.js';

describe('Justification', ()=>{
	test('Left Justify', function() {
		const source = ':- Hello';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p class=\"mdParagraphJustifyLeft\">Hello</p>`);
	});
	test('Right Justify', function() {
		const source = '-: Hello';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p class=\"mdParagraphJustifyRight\">Hello</p>`);
	});
	test('Center Justify', function() {
		const source = ':-: Hello';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p class=\"mdParagraphJustifyCenter\">Hello</p>`);
	});

	test('Ignored inside a code block', function() {
		const source = '```\n\n:- Hello\n\n```\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<pre><code>\n:- Hello\n</code></pre>\n`);
	});
});
