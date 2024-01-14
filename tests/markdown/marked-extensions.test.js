/* eslint-disable max-lines */

const Markdown = require('naturalcrit/markdown.js');

describe('Dictionary Terms', ()=>{
	test('Single Definition', function() {
		const source = 'My term :: My First Definition\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>My term</dt><dd>My First Definition</dd>\n</dl>');
	});

	test('Two Definitions', function() {
		const source = 'My term :: My First Definition :: My Second Definition\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>My term</dt><dd>My First Definition</dd><dd>My Second Definition</dd>\n</dl>');
	});

	test('Three Definitions', function() {
		const source = 'My term :: My First Definition :: My Second Definition :: My Third Definition\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>My term</dt><dd>My First Definition</dd><dd>My Second Definition</dd><dd>My Third Definition</dd>\n</dl>');
	});

	test('Multiple Definition Terms, multiple mixed-line definitions', function() {
		const source = 'Term 1::Definition 1 of Term 1\n::Definition 2 of Term 1::Definition 3 of Term 1\nTerm 2::Definition of Term 2';
		const rendered = Markdown.render(source);
	});

});
