/* eslint-disable max-lines */

const dedent = require('dedent-tabs').default;
const Markdown = require('naturalcrit/markdown.js');

// Marked.js adds line returns after closing tags on some default tokens.
// This removes those line returns for comparison sake.
String.prototype.trimReturns = function(){
	return this.replace(/\r?\n|\r/g, '').trim();
};

// Adding `.failing()` method to `describe` or `it` will make failing tests "pass" as long as they continue to fail.
// Remove the `.failing()` method once you have fixed the issue.

describe('Block-level variables', ()=>{
	it('Handles variable assignment and recall with simple text', function() {
		const source = dedent`
			[var]: string

			$[var]
		`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>string</p>');
	});

	it('Handles variable assignment and recall with multiline string', function() {
		const source = dedent`
			[var]: string
			across multiple
			lines

			$[var]`;
		const rendered = Markdown.render(source).replace(/\s/g,' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>string across multiple lines</p>');
	});

	it('Handles variable assignment and recall with tables', function() {
		const source = dedent`
			[var]:
			##### Title
			| H1 | H2 | 
			|:---|:--:|
			| A  | B  |
			| C  | D  |
			
			$[var]`;
		const rendered = Markdown.render(source).replace(/\s/g,' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(dedent`
			<h5 id="title">Title</h5>
			 <table><thead><tr><th align=left>H1</th>
			 <th align=center>H2</th>
			 </tr></thead><tbody><tr><td align=left>A</td>
			 <td align=center>B</td>
			 </tr><tr><td align=left>C</td>
			 <td align=center>D</td>
			 </tr></tbody></table>`.trimReturns());
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
