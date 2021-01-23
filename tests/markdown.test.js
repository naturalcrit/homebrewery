const Markdown = require('shared/naturalcrit/markdown.js');

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
