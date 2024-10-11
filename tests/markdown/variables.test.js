/* eslint-disable max-lines */

import { default as dedentTabs } from 'dedent-tabs';
const dedent = dedentTabs.default;

import { default as Markdown } from 'naturalcrit/markdown.js';


// Marked.js adds line returns after closing tags on some default tokens.
// This removes those line returns for comparison sake.
String.prototype.trimReturns = function(){
	return this.replace(/\r?\n|\r/g, '').trim();
};

renderAllPages = function(pages){
	const outputs = [];
	pages.forEach((page, index)=>{
		const output = Markdown.render(page, index);
		outputs.push(output);
	});

	return outputs;
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
		const rendered = Markdown.render(source).replace(/\s/g, ' ').trimReturns();
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
		const rendered = Markdown.render(source).replace(/\s/g, ' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>string</p>');
	});

	it('Hoists last instance of variable', function() {
		const source = dedent`
			$[var]

			[var]: string

			[var]: new string`;
		const rendered = Markdown.render(source).replace(/\s/g, ' ').trimReturns();
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
		const rendered = Markdown.render(source).replace(/\s/g, ' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>Welcome, Mr. Bob Jacobson!</p>');
	});

	it('Handles variable reassignment', function() {
		const source = dedent`
			[var]: one

			$[var]

			[var]: two

			$[var]
			`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>one</p><p>two</p>'.trimReturns());
	});

	it('Handles variable reassignment with hoisting', function() {
		const source = dedent`
			$[var]
		
			[var]: one

			$[var]

			[var]: two

			$[var]
			`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>two</p><p>one</p><p>two</p>'.trimReturns());
	});

	it('Ignores undefined variables that can\'t be hoisted', function() {
		const source = dedent`
			$[var](My name is $[first] $[last])

			$[last]: Jones
			`;
		const rendered = Markdown.render(source).replace(/\s/g, ' ').trimReturns();
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
		const rendered = Markdown.render(source).replace(/\s/g, ' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>My name is Bob Jones</p>');
	});

	it('Hoists last instance of variable', function() {
		const source = dedent`
			$[var](My name is $[name] Jones)

			$[name](Bob)

			[name]: Bill`;
		const rendered = Markdown.render(source).replace(/\s/g, ' ').trimReturns();
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
		const rendered = Markdown.render(source).replace(/\s/g, ' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>0</p>');
	});

	it('Handles floor function', function() {
		const source = dedent`
			$[floor(0.6)]`;
		const rendered = Markdown.render(source).replace(/\s/g, ' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>0</p>');
	});

	it('Handles ceil function', function() {
		const source = dedent`
			$[ceil(0.2)]`;
		const rendered = Markdown.render(source).replace(/\s/g, ' ').trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe('<p>1</p>');
	});

	it('Handles nested functions', function() {
		const source = dedent`
			$[ceil(floor(round(0.6)))]`;
		const rendered = Markdown.render(source).replace(/\s/g, ' ').trimReturns();
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
			<p><img src="url" alt="alt text" style="--HB_src:url(url);"></p>`.trimReturns());
	});

	it('Renders normal images with a title', function() {
		const source = 'An image ![alt text](url "and title")!';
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(dedent`
			<p>An image <img src="url" alt="alt text" style="--HB_src:url(url);" title="and title">!</p>`.trimReturns());
	});

	it('Applies curly injectors to images', function() {
		const source = `![alt text](url){width:100px}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(dedent`
			<p><img style="--HB_src:url(url); width:100px;" src="url" alt="alt text"></p>`.trimReturns());
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

describe('Cross-page variables', ()=>{
	it('Handles variable assignment and recall across pages', function() {
		const source0 = `[var]: string`;
		const source1 = `$[var]`;
		const rendered = renderAllPages([source0, source1]).join('\n\\page\n').trimReturns();
		expect(rendered, `Input:\n${[source0, source1].join('\n\\page\n')}`, { showPrefix: false }).toBe('\\page<p>string</p>');
	});

	it('Handles hoisting across pages', function() {
		const source0 = `$[var]`;
		const source1 = `[var]: string`;
		renderAllPages([source0, source1]).join('\n\\page\n').trimReturns();	//Requires one full render of document before hoisting is picked up
		const rendered = renderAllPages([source0, source1]).join('\n\\page\n').trimReturns();
		expect(rendered, `Input:\n${[source0, source1].join('\n\\page\n')}`, { showPrefix: false }).toBe('<p>string</p>\\page');
	});

	it('Handles reassignment and hoisting across pages', function() {
		const source0 = `$[var]\n\n[var]: one\n\n$[var]`;
		const source1 = `[var]: two\n\n$[var]`;
		renderAllPages([source0, source1]).join('\n\\page\n').trimReturns();	//Requires one full render of document before hoisting is picked up
		const rendered = renderAllPages([source0, source1]).join('\n\\page\n').trimReturns();
		expect(rendered, `Input:\n${[source0, source1].join('\n\\page\n')}`, { showPrefix: false }).toBe('<p>two</p><p>one</p>\\page<p>two</p>');
	});
});

describe('Math function parameter handling', ()=>{
	it('allows variables in single-parameter functions', function() {
		const source = '[var]:4.1\n\n$[floor(var)]';
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>4</p>`);
	});
	it('allows one variable and a number in two-parameter functions', function() {
		const source = '[var]:4\n\n$[min(1,var)]';
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>1</p>`);
	});
	it('allows two variables in two-parameter functions', function() {
		const source = '[var1]:4\n\n[var2]:8\n\n$[min(var1,var2)]';
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>4</p>`);
	});
});

describe('Variable names that are subsets of other names', ()=>{
	it('do not conflict with function names', function() {
		const source = `[a]: -1\n\n$[abs(a)]`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered).toBe('<p>1</p>');
	});

	it('do not conflict with other variable names', function() {
		const source = `[ab]: 2\n\n[aba]: 8\n\n[ba]: 4\n\n$[ab + aba + ba]`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered).toBe('<p>14</p>');
	});
});