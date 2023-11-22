/* eslint-disable max-lines */

const Markdown = require('naturalcrit/markdown.js');

describe('Dictionary Terms', ()=>{
	test('Single Definition', function() {
		const source = 'My term :: My First Definition';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>My term</dt><dd>My First Definition</dd></dl>');
	});

	test('Two Definitions', function() {
		const source = 'My term :: My First Definition :: My Second Definition';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>My term</dt><dd>My First Definition</dd>\n<dd>My Second Definition</dd></dl>');
	});

	test('Three Definitions', function() {
		const source = 'My term :: My First Definition :: My Second Definition :: My Third Definition';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>My term</dt><dd>My First Definition</dd>\n<dd>My Second Definition</dd>\n<dd>My Third Definition</dd></dl>');
	});

});
