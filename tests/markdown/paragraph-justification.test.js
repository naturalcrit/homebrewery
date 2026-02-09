

import Markdown from 'markdown.js';

describe('Justification', ()=>{
	test('Left Justify', function() {
		const source = ':- Hello';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p align=\"Left\">Hello</p>`);
	});
	test('Right Justify', function() {
		const source = '-: Hello';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p align=\"Right\">Hello</p>`);
	});
	test('Center Justify', function() {
		const source = ':-: Hello';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p align=\"Center\">Hello</p>`);
	});

	test('Ignored inside a code block', function() {
		const source = '```\n\n:- Hello\n\n```\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<pre><code>\n:- Hello\n</code></pre>\n`);
	});
});
