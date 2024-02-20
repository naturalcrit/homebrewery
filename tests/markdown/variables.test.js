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
		const rendered = Markdown.render(source).trimReturns();
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

	it('Hoists undefined variables', function() {
		const source = dedent`
			$[var]

			[var]: string`;
		const rendered = Markdown.render(source).replace(/\s/g,' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>string</p>');
	});

	it('Hoists last instance of variable', function() {
		const source = dedent`
			$[var]

			[var]: string

			[var]: new string`;
		const rendered = Markdown.render(source).replace(/\s/g,' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>new string</p>');
	});

	it('Handles complex hoisting', function() {
		const source = dedent`
			$[titleAndName]: $[title] $[fullName]

			$[title]: Mr.

			$[fullName]: $[firstName] $[lastName]

			[firstName]: Bob

			Welcome, $[titleAndName]!

			[lastName]: Jacob

			[lastName]: $[lastName]son
			`;
		const rendered = Markdown.render(source).replace(/\s/g,' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>Welcome, Mr. Bob Jacobson!</p>');
	});

	it("Ignores undefined variables that can't be hoisted", function() {
		const source = dedent`
			$[var](My name is $[first] $[last])

			$[last]: Jones
			`;
		const rendered = Markdown.render(source).replace(/\s/g,' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>My name is $[first] Jones</p>`.trimReturns());
	});
});

describe('Inline-level variables', ()=>{
	it('Handles variable assignment and recall with simple text', function() {
		const source = dedent`
			$[var](string)

			$[var]
		`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>string</p><p>string</p>');
	});

	it('Hoists undefined variables when possible', function() {
		const source = dedent`
			$[var](My name is $[name] Jones)

			[name]: Bob`;
		const rendered = Markdown.render(source).replace(/\s/g,' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>My name is Bob Jones</p>');
	});

	it('Hoists last instance of variable', function() {
		const source = dedent`
			$[var](My name is $[name] Jones)

			$[name](Bob)

			[name]: Bill`;
		const rendered = Markdown.render(source).replace(/\s/g,' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>My name is Bill Jones</p> <p>Bob</p>`.trimReturns());
	});

	it('Only captures nested parens if balanced', function() {
		const source = dedent`
			$[var1](A variable (with nested parens) inside)

			$[var1]

			$[var2](A variable ) with unbalanced parens)

			$[var2]`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(dedent`
		<p>A variable (with nested parens) inside</p>
		<p>A variable (with nested parens) inside</p>
		<p>A variable with unbalanced parens)</p>
		<p>A variable</p>
		`.trimReturns());
	});
});

describe('Math', ()=>{
	it('Handles simple math using numbers only', function() {
		const source = dedent`
			$[1 + 3 * 5 - (1 / 4)]
		`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>15.75</p>');
	});

	it('Handles round function', function() {
		const source = dedent`
			$[round(1/4)]`;
		const rendered = Markdown.render(source).replace(/\s/g,' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>0</p>');
	});

	it('Handles floor function', function() {
		const source = dedent`
			$[floor(0.6)]`;
		const rendered = Markdown.render(source).replace(/\s/g,' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>0</p>');
	});

	it('Handles ceil function', function() {
		const source = dedent`
			$[ceil(0.2)]`;
		const rendered = Markdown.render(source).replace(/\s/g,' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>1</p>');
	});

	it('Handles nested functions', function() {
		const source = dedent`
			$[ceil(floor(round(0.6)))]`;
		const rendered = Markdown.render(source).replace(/\s/g,' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>1</p>');
	});

	it('Handles simple math with variables', function() {
		const source = dedent`
			$[num1]: 5

			$[num2]: 4

			Answer is $[answer]($[1 + 3 * num1 - (1 / num2)]).
		`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>Answer is 15.75.</p>');
	});

	it('Handles variable incrementing', function() {
		const source = dedent`
			$[num1]: 5

			Increment num1 to get $[num1]($[num1 + 1]) and again to $[num1]($[num1 + 1]).
		`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>Increment num1 to get 6 and again to 7.</p>');
	});
});

describe('Code blocks', ()=>{
	it('Ignores all variables in fenced code blocks', function() {
		const source = dedent`
		  \`\`\`
			[var]: string

			$[var]

			$[var](new string)
			\`\`\`
		`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(dedent`
		 <pre><code>
		 [var]: string
		 
		 $[var]
		 
		 $[var](new string)
		 </code></pre>`.trimReturns());
	});

	it('Ignores all variables in indented code blocks', function() {
		const source = dedent`
			test

			    [var]: string

			    $[var]

			    $[var](new string)
		`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(dedent`
		 <p>test</p>

		 <pre><code>
		 [var]: string
		 
		 $[var]
		 
		 $[var](new string)
		 </code></pre>`.trimReturns());
	});

	it('Ignores all variables in inline code blocks', function() {
		const source = '[var](Hello) `[link](url)`. This `[var] does not work`';
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(dedent`
			<p><a href="Hello">var</a> <code>[link](url)</code>. This <code>[var] does not work</code></p>`.trimReturns());
	});
});

describe('Normal Links and Images', ()=>{
	it('Renders normal images', function() {
		const source = `![alt text](url)`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(dedent`
			<p><img src="url" alt="alt text"></p>`.trimReturns());
	});

	it('Renders normal images with a title', function() {
		const source = 'An image ![alt text](url "and title")!';
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(dedent`
			<p>An image <img src="url" alt="alt text" title="and title">!</p>`.trimReturns());
	});

	it('Applies curly injectors to images', function() {
		const source = `![alt text](url){width:100px}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(dedent`
			<p><img class="" style="width:100px;" src="url" alt="alt text"></p>`.trimReturns());
	});

	it('Renders normal links', function() {
		const source = 'A Link to my [website](url)!';
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(dedent`
		<p>A Link to my <a href="url">website</a>!</p>`.trimReturns());
	});

	it('Renders normal links with a title', function() {
		const source = 'A Link to my [website](url "and title")!';
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(dedent`
		<p>A Link to my <a href="url" title="and title">website</a>!</p>`.trimReturns());
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
