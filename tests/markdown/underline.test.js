/* eslint-disable max-lines */

import Markdown from 'naturalcrit/markdown.js';

describe('Underline', ()=>{
	test('Naked Underline', function() {
		const source = '_Underlined!_\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p><u>Underlined!</u></p>`);
	});

	test('Italicized Underline', function() {
		const source = '_*Underlined and Italicized!*_\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p><u><em>Underlined and Italicized!</em></u></p>`);
	});

	test('Bold Underline', function() {
		const source = '_**Bold and Underlined!**_\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p><u><strong>Bold and Underlined!</strong></u></p>`);
	});

	test('Bold and Italicized Underline', function() {
		const source = '_***Bold, Italic, and Underlined? No Way!***_\n\n';
		const rendered = Markdown.render(source).trim();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p><u><em><strong>Bold, Italic, and Underlined? No Way!</strong></em></u></p>`);
	});

});

