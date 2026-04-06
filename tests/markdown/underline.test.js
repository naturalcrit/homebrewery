

import Markdown from '../../shared/markdown.js';

describe('Replacement Underline Interactions', ()=>{
	test('Underlined Text', function() {
		const source = 'The next word should be _underlined._\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>The next word should be <u>underlined.</u></p>`);
	});

	test('Previously Bolded Underscored Text', function() {
		const source = 'The next word should be __normal.__\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>The next word should be normal.</p>`);
	});

	test('Previously Bolded and Emphasized Underscored Text', function() {
		const source = 'The next word should be ___normal.___\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>The next word should be normal.</p>`);
	});
});

