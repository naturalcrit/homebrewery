

import Markdown from 'markdown.js';

describe('Non-Breaking Spaces Interactions', ()=>{
	test('I am actually a single-line definition list!', function() {
		const source = 'Term ::> Definition 1\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<dl><dt>Term</dt><dd>&gt; Definition 1</dd>\n</dl>`);
	});

	test('I am actually a definition list!', function() {
		const source = 'Term\n::> Definition 1\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<dl><dt>Term</dt>\n<dd>&gt; Definition 1</dd></dl>`);
	});

	test('I am actually a two-term definition list!', function() {
		const source = 'Term\n::> Definition 1\n::>> Definition 2';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<dl><dt>Term</dt>\n<dd>&gt; Definition 1</dd>\n<dd>&gt;&gt; Definition 2</dd></dl>`);
	});
});

