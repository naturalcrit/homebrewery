const Markdown = require('shared/naturalcrit/markdown.js');

// FIXME: tests below are disabled, becaues marked.js uses replaceAll function,
// which is only supported starting with node.js 15.0.0:
// https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V15.md#v8-86---35415
// Need to enable them back when we uplifit node.js requirements of the project

test.skip('Escapes <script> tag', function() {
	const source = '<script></script>';
	const rendered = Markdown.render(source);
	expect(rendered).toMatch('&lt;script&gt;&lt;/script&gt;');
});

test.skip('Processes the markdown within an HTML block if its just a class wrapper', function() {
	const source = '<div>*Bold text*</div>';
	const rendered = Markdown.render(source);
	expect(rendered).toBe('<div> <p><em>Bold text</em></p>\n </div>');
});
