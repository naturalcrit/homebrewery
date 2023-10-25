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

test('Check Index Anchors in custom renderer', function() {
	const source=`@hereweare@(there)Welcome traveler from an antique land. Please sit and tell us of what you have seen. The unheard of monsters, who slither and bite. @hereWeWere@(there)Tell us of the wondrous items and and artifacts you have found, their mysteries yet to be unlocked. Of the vexing vocations and surprising skills you have seen.@here We Shall be@(there)`;
	const rendered = Markdown.render(source);
	console.log(rendered);
	expect(rendered).toBe('<p><a href="#hereweare" parent="there" lookup="hereweare" />Welcome traveler from an antique land. Please sit and tell us of what you have seen. The unheard of monsters, who slither and bite. <a href="#herewewere" parent="there" lookup="hereWeWere" />Tell us of the wondrous items and and artifacts you have found, their mysteries yet to be unlocked. Of the vexing vocations and surprising skills you have seen.<a href="#hereweshallbe" parent="there" lookup="here We Shall be" /></p>\n');
});
