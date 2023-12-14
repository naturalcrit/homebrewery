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


	it('Renders a mustache span with text with quotes and css property which contains double quotes', function() {
		const source = '{{font-family:"trebuchet ms" text "with quotes"}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block" style="font-family:trebuchet ms;">text “with quotes”</span>');
	});


	it('Renders a mustache span with text with quotes and css property which contains double and simple quotes', function() {
		const source = `{{--stringVariable:"'string'" text "with quotes"}}`;
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<span class="inline-block" style="--stringVariable:'string';">text “with quotes”</span>`);
	});


	it('Renders a mustache span with text, id, class and a couple of css properties', function() {
		const source = '{{pen,#author,color:orange,font-family:"trebuchet ms" text}}';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block pen" id="author" style="color:orange; font-family:trebuchet ms;">text</span>');
	});

	it('Renders a span with added attributes', function() {
		const source = 'Text and {{pen,#author,color:orange,font-family:"trebuchet ms",a="b and c",d=e, text}} and more text!';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>Text and <span class="inline-block pen" id="author" style="color:orange; font-family:trebuchet ms;" a="b and c" d="e">text</span> and more text!</p>\n');
	});
});

//  BLOCK SYNTAX

describe(`Block: When using the Block syntax {{tags\\ntext\\n}}`, ()=>{
	it('Renders a div with text only', function() {
		const source = dedent`{{
		text
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block"><p>text</p></div>`);
	});

	it('Renders an empty div', function() {
		const source = dedent`{{

		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block"></div>`);
	});

	it('Renders a single paragraph with opening and closing brackets', function() {
		const source = dedent`{{
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>{{}}</p>`);
	});

	it('Renders a div with a single class', function() {
		const source = dedent`{{cat

		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block cat"></div>`);
	});

	it('Renders a div with a single class and text', function() {
		const source = dedent`{{cat
		Sample text.
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block cat"><p>Sample text.</p></div>`);
	});

	it('Renders a div with two classes and text', function() {
		const source = dedent`{{cat,dog
		Sample text.
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block cat dog"><p>Sample text.</p></div>`);
	});

	it('Renders a div with a style and text', function() {
		const source = dedent`{{color:red
		Sample text.
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block" style="color:red;"><p>Sample text.</p></div>`);
	});

	it('Renders a div with a style that has a string variable, and text', function() {
		const source = dedent`{{--stringVariable:"'string'"
		Sample text.
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block" style="--stringVariable:'string';"><p>Sample text.</p></div>`);
	});

	it('Renders a div with a style that has a string variable, and text', function() {
		const source = dedent`{{--stringVariable:"'string'"
		Sample text.
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block" style="--stringVariable:'string';"><p>Sample text.</p></div>`);
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
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block cat" id="dog" style="color:red;"><p>Sample text.</p></div>`);
	});

	it('Renders a div with a single ID', function() {
		const source = dedent`{{#cat,#dog
		Sample text.
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block" id="cat"><p>Sample text.</p></div>`);
	});

	it('Renders a div with an ID, class, style and text, and a variable assignment', function() {
		const source = dedent`{{color:red,cat,#dog,a="b and c",d="e"
		Sample text.
		}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class=\"block cat\" id=\"dog\" style=\"color:red;\" a=\"b and c\" d=\"e\"><p>Sample text.</p></div>`);
	});

	it('Renders a div with added attributes', function() {
		const source = '{{pen,#author,color:orange,font-family:"trebuchet ms",a="b and c",d=e\nText and text and more text!\n}}\n';
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<div class="block pen" id="author" style="color:orange; font-family:trebuchet ms;" a="b and c" d="e"><p>Text and text and more text!</p>\n</div>');
	});
});

// MUSTACHE INJECTION SYNTAX

describe('Injection: When an injection tag follows an element', ()=>{
	// FIXME: Most of these fail because injections currently replace attributes, rather than append to.  Or just minor extra whitespace issues.
	describe('and that element is an inline-block', ()=>{
		it.failing('Renders a span "text" with no injection', function() {
			const source = '{{ text}}{}';
			const rendered = Markdown.render(source);
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block">text</span>');
		});

		it.failing('Renders a span "text" with injected Class name', function() {
			const source = '{{ text}}{ClassName}';
			const rendered = Markdown.render(source);
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block ClassName">text</span>');
		});

		it.failing('Renders a span "text" with injected attribute', function() {
			const source = '{{ text}}{a="b and c"}';
			const rendered = Markdown.render(source);
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span a="b and c" class="inline-block ">text</span>');
		});

		it.failing('Renders a span "text" with injected style', function() {
			const source = '{{ text}}{color:red}';
			const rendered = Markdown.render(source);
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block" style="color:red;">text</span>');
		});

		it.failing('Renders a span "text" with injected style using a string variable', function() {
			const source = `{{ text}}{--stringVariable:"'string'"}`;
			const rendered = Markdown.render(source);
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<span class="inline-block" style="--stringVariable:'string';">text</span>`);
		});

		it.failing('Renders a span "text" with two injected styles', function() {
			const source = '{{ text}}{color:red,background:blue}';
			const rendered = Markdown.render(source);
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<span class="inline-block" style="color:red; background:blue;">text</span>');
		});

		it.failing('Renders an emphasis element with injected Class name', function() {
			const source = '*emphasis*{big}';
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p><em class="big">emphasis</em></p>');
		});

		it.failing('Renders a code element with injected style', function() {
			const source = '`code`{background:gray}';
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p><code style="background:gray;">code</code></p>');
		});

		it.failing('Renders an image element with injected style', function() {
			const source = '![alt text](http://i.imgur.com/hMna6G0.png){position:absolute}';
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p><img src="http://i.imgur.com/hMna6G0.png" alt="homebrew mug" style="position:absolute;"></p>');
		});

		it.failing('Renders an element modified by only the first of two consecutive injections', function() {
			const source = '{{ text}}{color:red}{background:blue}';
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p><span class="inline-block" style="color:red;">text</span>{background:blue}</p>');
		});

		it('Renders an image with added attributes', function() {
			const source = `![homebrew mug](https://i.imgur.com/hMna6G0.png) {position:absolute,bottom:20px,left:130px,width:220px,a="b and c",d=e}`;
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p><img class="" style="position:absolute; bottom:20px; left:130px; width:220px;" a="b and c" d="e" src="https://i.imgur.com/hMna6G0.png" alt="homebrew mug"></p>`);
		});
	});

	describe('and that element is a block', ()=>{
		it.failing('renders a div "text" with no injection', function() {
			const source = '{{\ntext\n}}\n{}';
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<div class="block"><p>text</p></div>');
		});

		it.failing('renders a div "text" with injected Class name', function() {
			const source = '{{\ntext\n}}\n{ClassName}';
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<div class="block ClassName"><p>text</p></div>');
		});

		it.failing('renders a div "text" with injected style', function() {
			const source = '{{\ntext\n}}\n{color:red}';
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<div class="block" style="color:red;"><p>text</p></div>');
		});

		it.failing('renders a div "text" with two injected styles', function() {
			const source = dedent`{{
			text
			}}
			{color:red,background:blue}`;
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block" style="color:red; background:blue"><p>text</p></div>`);
		});

		it.failing('renders a div "text" with injected variable string', function() {
			const source = dedent`{{
			text
			}}
			{--stringVariable:"'string'"}`;
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block" style="--stringVariable:'string'"><p>text</p></div>`);
		});

		it.failing('renders an h2 header "text" with injected class name', function() {
			const source = dedent`## text
			{ClassName}`;
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<h2 class="ClassName">text</h2>');
		});

		it.failing('renders a table with injected class name', function() {
			const source = dedent`| Experience Points | Level |
			|:------------------|:-----:|
			| 0                 | 1     |
			| 300               | 2     |

			{ClassName}`;
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<table class="ClassName"><thead><tr><th align=left>Experience Points</th><th align=center>Level</th></tr></thead><tbody><tr><td align=left>0</td><td align=center>1</td></tr><tr><td align=left>300</td><td align=center>2</td></tr></tbody></table>`);
		});

		// it('renders a list with with a style injected into the <ul> tag', function() {
		// 	const source = dedent`- Cursed Ritual of Bad Hair
		// - Eliminate Vindictiveness in Gym Teacher
		// - Ultimate Rite of the Confetti Angel
		// - Dark Chant of the Dentists
		// - Divine Spell of Crossdressing
		// {color:red}`;
		// 	const rendered = Markdown.render(source).trimReturns();
		// 	expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`...`);   // FIXME: expect this to be injected into <ul>?  Currently injects into last <li>
		// });

		it.failing('renders an h2 header "text" with injected class name, and "secondInjection" as regular text on the next line.', function() {
			const source = dedent`## text
			{ClassName}
			{secondInjection}`;
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<h2 class="ClassName">text</h2><p>{secondInjection}</p>');
		});

		it.failing('renders a div nested into another div, the inner with class=innerDiv and the other class=outerDiv', function() {
			const source = dedent`{{
			outer text
			{{
			inner text
			}}
			{innerDiv}
			}}
			{outerDiv}`;
			const rendered = Markdown.render(source).trimReturns();
			expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<div class="block outerDiv"><p>outer text</p><div class="block innerDiv"><p>inner text</p></div></div>');
		});
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
