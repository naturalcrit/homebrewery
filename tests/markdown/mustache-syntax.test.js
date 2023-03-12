/* eslint-disable max-lines */

const Markdown = require('naturalcrit/markdown.js');

describe('Inline: When using the Inline syntax ({{}})', ()=>{
	it('Renders a mustache span with text only', function() {
		const source = '{{ text}}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block">text</span>');
	});

	it('Renders a mustache span with text only, but with spaces', function() {
		const source = '{{ this is a text}}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block">this is a text</span>');
	});

	it('Renders an empty mustache span', function() {
		const source = '{{}}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block"></span>');
	});

	it('Renders a mustache span with just a space', function() {
		const source = '{{ }}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block"></span>');
	});

	it('Renders a mustache span with a few spaces only', function() {
		const source = '{{     }}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block"></span>');
	});

	it('Renders a mustache span with text and class', function() {
		const source = '{{my-class text}}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block my-class">text</span>');
	});

	it('Renders a mustache span with text and two classes', function() {
		const source = '{{my-class,my-class2 text}}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block my-class my-class2">text</span>');
	});

	it('Renders a mustache span with text with spaces and class', function() {
		const source = '{{my-class this is a text}}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block my-class">this is a text</span>');
	});

	it('Renders a mustache span with text and id', function() {
		const source = '{{#my-span text}}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block" id="my-span">text</span>');
	});

	it('Renders a mustache span with text and two ids', function() {
		const source = '{{#my-span,#my-favorite-span text}}';
		const rendered = Markdown.render(source);
		// FIXME: do we need to report an error here somehow?
		expect(rendered).toBe('<span class="inline-block" id="my-span">text</span>');
	});

	it('Renders a mustache span with text and css property', function() {
		const source = '{{color:red text}}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block" style="color:red;">text</span>');
	});

	it('Renders a mustache span with text and two css properties', function() {
		const source = '{{color:red,padding:5px text}}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block" style="color:red; padding:5px;">text</span>');
	});

	it('Renders a mustache span with text and css property which contains quotes', function() {
		const source = '{{font-family:"trebuchet ms" text}}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block" style="font-family:trebuchet ms;">text</span>');
	});

	it('Renders a mustache span with text and two css properties which contains quotes', function() {
		const source = '{{font-family:"trebuchet ms",padding:"5px 10px" text}}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block" style="font-family:trebuchet ms; padding:5px 10px;">text</span>');
	});


	it('Renders a mustache span with text with quotes and css property which contains quotes', function() {
		const source = '{{font-family:"trebuchet ms" text "with quotes"}}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block" style="font-family:trebuchet ms;">text “with quotes”</span>');
	});

	it('Renders a mustache span with text, id, class and a couple of css properties', function() {
		const source = '{{pen,#author,color:orange,font-family:"trebuchet ms" text}}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block pen" id="author" style="color:orange; font-family:trebuchet ms;">text</span>');
	});


})



// MUSTACHE INJECTION SYNTAX

describe('Injection: When an injection tag follows an element', ()=>{
	it('Renders a span "text" with no injection', function() {
		const source = '{{ text}}{}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block">text</span>');
	});

	it('Renders a span "text" with injected Class name', function() {
		const source = '{{ text}}{ClassName}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block ClassName">text</span>');
	});

	it('Renders a span "text" with injected style', function() {
		const source = '{{ text}}{color:red}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block" style="color:red;">text</span>');
	});

	it('Renders a span "text" with two injected styles', function() {
		const source = '{{ text}}{color:red,background:blue}';
		const rendered = Markdown.render(source);
		expect(rendered).toBe('<span class="inline-block" style="color:red; background:blue;">text</span>');
	});

	it('Renders an emphasis element with injected Class name', function() {
		const source = '*emphasis*{big}';
		const rendered = Markdown.render(source);
		// fixme: not sure why it returns a new line (\n) at end of string?
		expect(rendered).toBe('<p><em class="big">emphasis</em></p>\n');
	});

	it('Renders a code element with injected style', function() {
		const source = '`code`{background:gray}';
		const rendered = Markdown.render(source);
		// fixme: not sure why it returns a new line (\n) at end of string?
		expect(rendered).toBe('<p><code style="background:gray;">code</code></p>\n');
	});

	it('Renders an element modified by only the first of two consecutive injections', function() {
		const source = '{{ text}}{color:red}{background:blue}';
		const rendered = Markdown.render(source);
		// fixme: not sure why it returns a new line (\n) at end of string?
		expect(rendered).toBe('<p><span class="inline-block" style="color:red;">text</span>{background:blue}</p>\n');
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

