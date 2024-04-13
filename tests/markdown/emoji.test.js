/* eslint-disable max-lines */

const Markdown = require('naturalcrit/markdown.js');

const emoji = 'df-d12-2';

describe(`When emojis/icons are active`, ()=>{
	it('when a word is between two colons (:word:), and a matching emoji exists, it is rendered as an emoji', function() {
		const source = `:${emoji}:`;
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p><i class="df d12-2"></i></p>\n`);
	});

	it('two emojis with no whitespace renders a definition list instead', function() {
		const source = `:${emoji}::${emoji}:`;
		const rendered = Markdown.render(source);
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<dl><dt>:df-d12-2</dt><dd>df-d12-2:</dd>\n</dl>`);
	});

	// another test of the editor to confirm an autocomplete menu opens
});