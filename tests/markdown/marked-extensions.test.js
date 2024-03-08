/* eslint-disable max-lines */

const Markdown = require('naturalcrit/markdown.js');

describe('Definition Terms', ()=>{
	test('Single Definition', function() {
		const source = 'My term :: My First Definition\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>My term</dt><dd>My First Definition</dd></dl>');
	});

	test('Multiple Definition Terms, single line, single definition', function() {
		const source = 'Term 1::Definition of Term 1\nTerm 2::Definition of Term 2\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt><dd>Definition of Term 1</dd>\n<dt>Term 2</dt><dd>Definition of Term 2</dd></dl>');
	});

	test('PANdoc style list - Single Term, Single Definition', function() {
		const source = 'Term 1\n::Definition 1\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1</dd></dl>');
	});

	test('PANdoc style list - Single Term, Plural Definitions', function() {
		const source = 'Term 1\n::Definition 1\n::Definition 2\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1</dd>\n<dd>Definition 2</dd></dl>');
	});

	test('PANdoc style list - Multiple Term, Single Definitions', function() {
		const source = 'Term 1\n::Definition 1\nTerm 2\n::Definition 1\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1</dd>\n<dt>Term 2</dt>\n<dd>Definition 1</dd></dl>');
	});

	test('PANdoc style list - Multiple Term, Plural Definitions', function() {
		const source = 'Term 1\n::Definition 1\n::Definition 2\nTerm 2\n::Definition 1\n::Definition 2\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1</dd>\n<dd>Definition 2</dd>\n<dt>Term 2</dt>\n<dd>Definition 1</dd>\n<dd>Definition 2</dd></dl>');
	});

	test('PANdoc style list - Single Term, Single multiple line definition', function() {
		const source = 'Term 1\n::Definition 1\nand more and\nmore and more\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1 and more and more and more</dd></dl>');
	});

	test('PANdoc style list - Multiple Term, Single multiple line definition', function() {
		const source = 'Term 1\n::Definition 1\nand more and\nmore and more\n\n::Definition 2\n\n::Definition 3\n\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1 and more and more and more</dd>\n<dd>Definition 2</dd>\n<dd>Definition 3</dd></dl>');
	});
});
