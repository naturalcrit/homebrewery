/* eslint-disable max-lines */

const dedent = require('dedent-tabs').default;
const Markdown = require('naturalcrit/markdown.js');

// Marked.js adds line returns after closing tags on some default tokens.
// This removes those line returns for comparison sake.
String.prototype.trimReturns = function(){
	return this.replace(/\r?\n|\r/g, '');
};

// Adding `.failing()` method to `describe` or `it` will make failing tests "pass" as long as they continue to fail.
// Remove the `.failing()` method once you have fixed the issue.

describe('Inline: When using the Inline syntax {{ }}', ()=>{
	it('Renders a mustache span with text only', function() {
		const source = '{{ text}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block">text</span>');
	});

	it('Renders a mustache span with text only, but with spaces', function() {
		const source = '{{ this is a text}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block">this is a text</span>');
	});

	it('Renders an empty mustache span', function() {
		const source = '{{}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block"></span>');
	});

	it('Renders a mustache span with just a space', function() {
		const source = '{{ }}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block"></span>');
	});

	it('Renders a mustache span with a few spaces only', function() {
		const source = '{{     }}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block"></span>');
	});

	it('Renders a mustache span with text and class', function() {
		const source = '{{my-class text}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block my-class">text</span>');
	});

	it('Renders a mustache span with text and two classes', function() {
		const source = '{{my-class,my-class2 text}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block my-class my-class2">text</span>');
	});

	it('Renders a mustache span with text with spaces and class', function() {
		const source = '{{my-class this is a text}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block my-class">this is a text</span>');
	});

	it('Renders a mustache span with text and id', function() {
		const source = '{{#my-span text}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block" id="my-span">text</span>');
	});

	it('Renders a mustache span with text and two ids', function() {
		const source = '{{#my-span,#my-favorite-span text}}';
		const rendered = Markdown.render(source);
		// FIXME: do we need to report an error here somehow?
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block" id="my-span">text</span>');
	});

	it('Renders a mustache span with text and css property', function() {
		const source = '{{color:red text}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block" style="color:red;">text</span>');
	});

	it('Renders a mustache span with text and two css properties', function() {
		const source = '{{color:red,padding:5px text}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block" style="color:red; padding:5px;">text</span>');
	});

	it('Renders a mustache span with text and css property which contains quotes', function() {
		const source = '{{font-family:"trebuchet ms" text}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block" style="font-family:trebuchet ms;">text</span>');
	});

	it('Renders a mustache span with text and two css properties which contains quotes', function() {
		const source = '{{font-family:"trebuchet ms",padding:"5px 10px" text}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block" style="font-family:trebuchet ms; padding:5px 10px;">text</span>');
	});


	it('Renders a mustache span with text with quotes and css property which contains quotes', function() {
		const source = '{{font-family:"trebuchet ms" text "with quotes"}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block" style="font-family:trebuchet ms;">text “with quotes”</span>');
	});

	it('Renders a mustache span with text, id, class and a couple of css properties', function() {
		const source = '{{pen,#author,color:orange,font-family:"trebuchet ms" text}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block pen" id="author" style="color:orange; font-family:trebuchet ms;">text</span>');
	});
});

describe(`Block: When using the Block syntax {{tags\\ntext\\n}}`, ()=>{
	it('Renders a div with text only', function() {
		const source = dedent`{{
		text
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block"><p>text</p></div>`);
	});

	it('Renders an empty div', function() {
		const source = dedent`{{
		
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block"></div>`);
	});

	it('Renders a single paragraph with opening and closing brackets', function() {
		const source = dedent`{{
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		// this actually renders in HB as '{{ }}'...
		expect(rendered, `Input:\n${source}`, { showPrefix: false }, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>{{}}</p>`);
	});

	it('Renders a div with a single class', function() {
		const source = dedent`{{cat
		
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block cat"></div>`);
	});

	it('Renders a div with a single class and text', function() {
		const source = dedent`{{cat
		Sample text.
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block cat"><p>Sample text.</p></div>`);
	});

	it('Renders a div with two classes and text', function() {
		const source = dedent`{{cat,dog
		Sample text.
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block cat dog"><p>Sample text.</p></div>`);
	});

	it('Renders a div with a style and text', function() {
		const source = dedent`{{color:red
		Sample text.
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block" style="color:red;"><p>Sample text.</p></div>`);
	});

	it('Renders a div with a class, style and text', function() {
		const source = dedent`{{cat,color:red
		Sample text.
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block cat" style="color:red;"><p>Sample text.</p></div>`);
	});

	it('Renders a div with an ID, class, style and text (different order)', function() {
		const source = dedent`{{color:red,cat,#dog
		Sample text.
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div id="dog" class="block cat" style="color:red;"><p>Sample text.</p></div>`);
	});

	it('Renders a div with a single ID', function() {
		const source = dedent`{{#cat,#dog
		Sample text.
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block" id="cat"><p>Sample text.</p></div>`);
	});
});

// TODO: add tests for ID with accordance to CSS spec:
//
// From https://drafts.csswg.org/selectors/#id-selectors:
//
// > An ID selector consists of a “number sign” (U+0023, #) immediately followed by the ID value, which must be a CSS identifier.
//
// From: https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier:
//
// > In CSS, identifiers (including element names, classes, and IDs in selectors) can contain only the characters [a-zA-Z0-9]
// > and ISO 10646 characters U+00A0 and higher, plus the hyphen (-) and the underscore (_);
// > they cannot start with a digit, two hyphens, or a hyphen followed by a digit.
// > Identifiers can also contain escaped characters and any ISO 10646 character as a numeric code (see next item).
// > For instance, the identifier "B&W?" may be written as "B\&W\?" or "B\26 W\3F".
// > Note that Unicode is code-by-code equivalent to ISO 10646 (see [UNICODE] and [ISO10646]).

// TODO: add tests for class with accordance to CSS spec:
//
// From: https://drafts.csswg.org/selectors/#class-html:
//
// > The class selector is given as a full stop (. U+002E) immediately followed by an identifier.

