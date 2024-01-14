/* eslint-disable max-lines */

const Markdown = require('naturalcrit/markdown.js');

describe('Dictionary Terms', ()=>{
	test('Single Definition', function() {
		const source = 'My term :: My First Definition\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>My term</dt>\n<dd>My First Definition</dd>\n</dl>');
	});

	test('Two Definitions', function() {
		const source = 'My term :: My First Definition :: My Second Definition\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>My term</dt>\n<dd>My First Definition</dd>\n<dd>My Second Definition</dd>\n</dl>');
	});

	test('Three Definitions', function() {
		const source = 'My term :: My First Definition :: My Second Definition :: My Third Definition\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>My term</dt>\n<dd>My First Definition</dd>\n<dd>My Second Definition</dd>\n<dd>My Third Definition</dd>\n</dl>');
	});

	test('Multiline Definitions', function() {
		const source = '**Example** :: V3 uses HTML *definition lists* to create "lists" with hanging indents.\n::Three\n::Four\n\nHello::I\'m a different\n::List\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt><strong>Example</strong></dt>\n<dd>V3 uses HTML <em>definition lists</em> to create “lists” with hanging indents.</dd>\n<dd>Three</dd>\n<dd>Four</dd>\n</dl><dl><dt>Hello</dt>\n<dd>I\’m a different</dd>\n<dd>List</dd>\n</dl>');
	});

});
