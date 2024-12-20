/* eslint-disable max-lines */

import Markdown from 'naturalcrit/markdown.js';

describe('Non-Breaking Spaces', ()=>{
	test('Single Space', function() {
		const source = ':>\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>&nbsp;</p>`);
	});

	test('Double Space', function() {
		const source = ':>>\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>&nbsp;&nbsp;</p>`);
	});

	test('Triple Space', function() {
		const source = ':>>>\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>&nbsp;&nbsp;&nbsp;</p>`);
	});

	test('Many Space', function() {
		const source = ':>>>>>>>>>>\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>`);
	});

	test('Multiple sets of Spaces', function() {
		const source = ':>>>\n:>>>\n:>>>';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>&nbsp;&nbsp;&nbsp;\n&nbsp;&nbsp;&nbsp;\n&nbsp;&nbsp;&nbsp;</p>`);
	});

	test('Pair of inline Spaces', function() {
		const source = ':>>:>>';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>&nbsp;&nbsp;&nbsp;&nbsp;</p>`);
	});

	test('Space directly between two paragraphs', function() {
		const source = 'Line 1\n:>>\nLine 2';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>Line 1\n&nbsp;&nbsp;\nLine 2</p>`);
	});

	test('Ignored inside a code block', function() {
		const source = '```\n\n:>\n\n```\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<pre><code>\n:&gt;\n</code></pre>`);
	});


	test('I am actually a definition list!', function() {
		const source = 'Term\n::> Definition 1\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<dl><dt>Term</dt>\n<dd>> Definition 1</dd></dl>`);
	});

	test('I am actually a two-term definition list!', function() {
		const source = 'Term\n::> Definition 1\n::>> Definition 2';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<dl><dt>Term</dt>\n<dd>> Definition 1</dd>\n<dd>>> Definition 2</dd></dl>`);
	});
});

