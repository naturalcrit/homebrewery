/* eslint-disable max-lines */

const Markdown = require('naturalcrit/markdown.js');

test('Processes the markdown within an HTML block if its just a class wrapper', function() {
	const source = '<div>*Bold text*</div>';
	const rendered = Markdown.render(source);
	expect(rendered).toBe('<div> <p><em>Bold text</em></p>\n </div>');
});

test('Check markdown is using the custom renderer; specifically that it adds target=_self attribute to internal links in HTML blocks', function() {
	const source = '<div>[Has _self Attribute?](#p1)</div>';
	const rendered = Markdown.render(source);
	expect(rendered).toBe('<div> <p><a href="#p1" target="_self">Has _self Attribute?</a></p>\n </div>');
});

test('Check Sing Index Anchor. No Index, A Topic, No Subtopic', function() {
	const source=`#there\n`;
	const rendered = Markdown.render(source);
	expect(rendered).toBe('<a id="p1_there" data-topic="there" data-index="Index:"></a>');
});

test('Check Sing Index Anchor. No Index, A Topic, A Subtopic', function() {
	const source=`#there/hereweare\n\n`;
	const rendered = Markdown.render(source);
	expect(rendered).toBe('<a id="p1_hereweare" data-topic="there" data-subtopic="hereweare" data-index="Index:"></a>');
});

test('Check Sing Index Anchor. An Index, A Topic, No Subtopic', function() {
	const source=`#My Index:there\n\n`;
	const rendered = Markdown.render(source);
	expect(rendered).toBe('<a id="p1_there" data-topic="there" data-index="My Index"></a>');
});

test('Check Sing Index Anchor. An Index, A Topic, A Subtopic', function() {
	const source=`#My Index:there/hereweare\n\n`;
	const rendered = Markdown.render(source);
	expect(rendered).toBe('<a id="p1_hereweare" data-topic="there" data-subtopic="hereweare" data-index="My Index"></a>');
});

test('Check Sing Index Anchor. An Index, A Topic, A Subtopic - Crossreferenced with No Index, A Topic, No Subtopic', function() {
	const source=`#My Index:there/hereweare|Crossreference\n\n`;
	const rendered = Markdown.render(source);
	expect(rendered).toBe('');
});

test('Check Sing Index Anchor. An Index, A Topic, A Subtopic - Crossreferenced with No Index, A Topic, A Subtopic', function() {
	const source=`#My Index:there/hereweare|Crossreference/CrossSub\n\n`;
	const rendered = Markdown.render(source);
	expect(rendered).toBe('');
});

test('Check Sing Index Anchor. An Index, A Topic, A Subtopic - Crossreferenced with An Index, A Topic, No Subtopic', function() {
	const source=`#My Index:there/hereweare|Cross Index:Crossreference\n\n`;
	const rendered = Markdown.render(source);
	expect(rendered).toBe('');
});

test('Check Sing Index Anchor. An Index, A Topic, A Subtopic - Crossreferenced with An Index, A Topic, A Subtopic', function() {
	const source=`#My Index:there/hereweare|Cross Index:Crossreference/CrossSub\n\n`;
	const rendered = Markdown.render(source);
	expect(rendered).toBe('');
});


