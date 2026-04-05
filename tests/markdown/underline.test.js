

import Markdown from '../../shared/markdown.js';

describe('Replacement Underline Interactions', ()=>{
	test('Underlined Text', function() {
		const source = 'The next word should be _underlined._\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>The next word should be <u>underlined.</u></p>`);
	});

	test('Previously Bolded Underscored Text', function() {
		const source = 'The next word should be __bold.__\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>The next word should be <strong>bold.</strong></p>`);
	});

	test('Previously Bolded and Emphasized Underscored Text', function() {
		const source = 'The next words should be ___bold and italic.___\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>The next words should be <em><strong>bold and italic.</strong></em></p>`);
	});
});

