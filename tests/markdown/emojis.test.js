import Markdown from 'markdown.js';
const dedent = require('dedent-tabs').default;

// Marked.js adds line returns after closing tags on some default tokens.
// This removes those line returns for comparison sake.
String.prototype.trimReturns = function(){
	return this.replace(/\r?\n|\r/g, '');
};

const emoji = 'df_d12_2';

describe(`When emojis/icons are active`, ()=>{
	it('when a word is between two colons (:word:), and a matching emoji exists, it is rendered as an emoji', function() {
		const source = `:${emoji}:`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p><i class="df d12-2"></i></p>`);
	});

	it('when a word is between two colons (:word:), and no matching emoji exists, it is not parsed', function() {
		const source = `:invalid:`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p>:invalid:</p>`);
	});

	it('two valid emojis with no whitespace are prioritized over definition lists', function() {
		const source = `:${emoji}::${emoji}:`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p><i class="df d12-2"></i><i class="df d12-2"></i></p>`);
	});

	it('definition lists that are not also part of an emoji can coexist with normal emojis', function() {
		const source = `definition :: term ${emoji}::${emoji}:`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<dl><dt>definition</dt><dd>term df_d12_2:<i class="df d12-2"></i></dd></dl>`);
	});

	it('A valid emoji is compatible with curly injectors', function() {
		const source = `:${emoji}:{color:blue,myClass}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<p><i class="df d12-2 myClass" style="color:blue;"></i></p>`);
	});

	it('Emojis are not parsed inside of curly span CSS blocks', function() {
		const source = `{{color:${emoji} text}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<span class="inline-block" style="color:df_d12_2;">text</span>`);
	});

	it('Emojis are not parsed inside of curly div CSS blocks', function() {
		const source = dedent`{{color:${emoji}
													text
													}}`;
		const rendered = Markdown.render(source).trimReturns();
		expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`<div class="block" style="color:df_d12_2;"><p>text</p></div>`);
	});

	// another test of the editor to confirm an autocomplete menu opens
});