/* eslint-disable max-lines */

const Markdown = require('naturalcrit/markdown.js');

test('Escapes <script> tag', function() {
	const source = '<script></script>';
	const rendered = Markdown.render(source);
	expect(rendered).toMatch('&lt;script&gt;&lt;/script&gt;');
});

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
