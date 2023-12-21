/* eslint-disable max-lines */

const Markdown = require('naturalcrit/markdown.js');

describe('Dictionary Terms', ()=>{
	test('Single Definition', function() {
		const source = 'My term :: My First Definition\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><div><dt>My term</dt><dd>My First Definition</dd></div></dl>');
	});

	test('Two Definitions', function() {
		const source = 'My term :: My First Definition :: My Second Definition\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><div><dt>My term</dt><dd>My First Definition</dd>\n<dd>My Second Definition</dd></div></dl>');
	});

	test('Three Definitions', function() {
		const source = 'My term :: My First Definition :: My Second Definition :: My Third Definition\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><div><dt>My term</dt><dd>My First Definition</dd>\n<dd>My Second Definition</dd>\n<dd>My Third Definition</dd></div></dl>');
	});

	test('Multiline Definitions', function() {
		const source = '**Example** :: V3 uses HTML *definition lists* to create "lists" with hanging indents.\n::Three\n::Four\n\nHello::I\'m a different\n::List\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><div><dt><strong>Example</strong></dt><dd>V3 uses HTML <em>definition lists</em> to create “lists” with hanging indents.</dd>\n<dd>Three</dd>\n<dd>Four</dd></div></dl><dl><div><dt>Hello</dt><dd>I\’m a different</dd>\n<dd>List</dd></div></dl>');
	});

});
