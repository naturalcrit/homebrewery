

import Markdown from 'markdown.js';

describe('Inline Definition Lists', ()=>{
	test('No Term 1 Definition', function() {
		const source = ':: My First Definition\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt></dt><dd>My First Definition</dd>\n</dl>');
	});

	test('Single Definition Term', function() {
		const source = 'My term :: My First Definition\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>My term</dt><dd>My First Definition</dd>\n</dl>');
	});

	test('Multiple Definition Terms', function() {
		const source = 'Term 1::Definition of Term 1\nTerm 2::Definition of Term 2\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt><dd>Definition of Term 1</dd>\n<dt>Term 2</dt><dd>Definition of Term 2</dd>\n</dl>');
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
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1 and more and more</dd>\n<dt>Term 2</dt>\n<dd>Definition 1</dd>\n<dd>Definition 2</dd></dl><dl><dt></dt><dd>Inline Definition (no term)</dd>\n</dl>');
	});

	test('Multiple Term, Single multi-line definition, followed by paragraph', function() {
		const source = 'Term 1\n::Definition 1\nand more and more\n\nTerm 2\n::Definition 1\n::Definition 2\n\nParagraph';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt>\n<dd>Definition 1 and more and more</dd>\n<dt>Term 2</dt>\n<dd>Definition 1</dd>\n<dd>Definition 2</dd></dl><p>Paragraph</p>');
	});

	test('Block Token cannot be the Term of a multi-line definition', function() {
		const source = '## Header\n::Definition 1 of a single-line DL\n::Definition 1 of another single-line DL';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<h2 id="header">Header</h2>\n<dl><dt></dt><dd>Definition 1 of a single-line DL</dd>\n<dt></dt><dd>Definition 1 of another single-line DL</dd>\n</dl>');
	});

	test('Inline DL has priority over Multiline', function() {
		const source = 'Term 1 :: Inline definition 1\n:: Inline definition 2 (no DT)';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<dl><dt>Term 1</dt><dd>Inline definition 1</dd>\n<dt></dt><dd>Inline definition 2 (no DT)</dd>\n</dl>');
	});

	test('Multiline Definition Term must have at least one non-empty Definition', function() {
		const source = 'Term 1\n::';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>Term 1</p>\n<div class='blank'></div>\n<div class='blank'></div>`);
	});

	test('Multiline Definition List must have at least one non-newline character after ::', function() {
		const source = 'Term 1\n::\nDefinition 1\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>Term 1</p>\n<div class='blank'></div>\n<div class='blank'></div>\n<p>Definition 1</p>`);
	});
});
