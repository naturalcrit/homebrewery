/* eslint-disable max-lines */

const Markdown = require('naturalcrit/markdown.js');

describe('Inline Definition Lists', ()=>{
	test('No Term 1 Definition', function() {
		const source = ':: My First Definition\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt></dt><dd>My First Definition</dd></dl>');
	});

	test('Single Definition Term', function() {
		const source = 'My term :: My First Definition\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>My term</dt><dd>My First Definition</dd></dl>');
	});

	test('Multiple Definition Terms', function() {
		const source = 'Term 1::Definition of Term 1\nTerm 2::Definition of Term 2\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt><dd>Definition of Term 1</dd><dt>Term 2</dt><dd>Definition of Term 2</dd></dl>');
	});
});

describe('Multiline Definition Lists', ()=>{
	test('Single Term, Single Definition', function() {
		const source = 'Term 1\n::Definition 1\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1</dd></dl>');
	});

	test('Single Term, Plural Definitions', function() {
		const source = 'Term 1\n::Definition 1\n::Definition 2\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1</dd>\n<dd>Definition 2</dd></dl>');
	});

	test('Multiple Term, Single Definitions', function() {
		const source = 'Term 1\n::Definition 1\n\nTerm 2\n::Definition 1\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1</dd>\n<dt>Term 2</dt>\n<dd>Definition 1</dd></dl>');
	});

	test('Multiple Term, Plural Definitions', function() {
		const source = 'Term 1\n::Definition 1\n::Definition 2\n\nTerm 2\n::Definition 1\n::Definition 2\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1</dd>\n<dd>Definition 2</dd>\n<dt>Term 2</dt>\n<dd>Definition 1</dd>\n<dd>Definition 2</dd></dl>');
	});

	test('Single Term, Single multi-line definition', function() {
		const source = 'Term 1\n::Definition 1\nand more and\nmore and more\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1 and more and more and more</dd></dl>');
	});

	test('Single Term, Plural multi-line definitions', function() {
		const source = 'Term 1\n::Definition 1\nand more and more\n::Definition 2\nand more\nand more\n::Definition 3\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1 and more and more</dd>\n<dd>Definition 2 and more and more</dd>\n<dd>Definition 3</dd></dl>');
	});

	test('Multiple Term, Single multi-line definition', function() {
		const source = 'Term 1\n::Definition 1\nand more and more\n\nTerm 2\n::Definition 1\n::Definition 2\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1 and more and more</dd>\n<dt>Term 2</dt>\n<dd>Definition 1</dd>\n<dd>Definition 2</dd></dl>');
	});

	test('Multiple Term, Single multi-line definition, followed by an inline dl', function() {
		const source = 'Term 1\n::Definition 1\nand more and more\n\nTerm 2\n::Definition 1\n::Definition 2\n\n::Inline Definition (no term)';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1 and more and more</dd>\n<dt>Term 2</dt>\n<dd>Definition 1</dd>\n<dd>Definition 2</dd></dl><dl><dt></dt><dd>Inline Definition (no term)</dd></dl>');
	});

	test('Multiple Term, Single multi-line definition, followed by paragraph', function() {
		const source = 'Term 1\n::Definition 1\nand more and more\n\nTerm 2\n::Definition 1\n::Definition 2\n\nParagraph';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1 and more and more</dd>\n<dt>Term 2</dt>\n<dd>Definition 1</dd>\n<dd>Definition 2</dd></dl><p>Paragraph</p>');
	});
});
