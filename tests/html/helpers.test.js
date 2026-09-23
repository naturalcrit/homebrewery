import {
	fetchThemeBundle,
	brewSnippetsToJSON,
	debugTextMismatch,
	yamlSnippetsToText,
} from '../../shared/helpers.js';

import dedent from 'dedent';

// Marked.js adds line returns after closing tags on some default tokens.
// This removes those line returns for comparison sake.
String.prototype.trimReturns = function(){
	return this.replace(/\r?\n|\r/g, '');
};

const emoji = 'df_d12_2';

const brewSnippetsThemeTest =  [
	{
		name     : 'Test Theme',
		snippets : dedent `
			\snippet First Theme Snippet
			I am the first theme snippet!

			\snippet Second Theme Snippet
			I am the second theme Snippet!`,
	}
];

const brewSnippetsBrewTest = dedent`
	\snippet First Brew Snippet
	I am the first brew snippet!

	\snippet Second Brew Snippet
	I am the second brew Snippet!`;

describe(`brewSnippetsToJSON`, ()=>{
	it('converts raw brew snippets without theme snippets to JSON', function() {
		const testMenuObject = {
			groupName : 'Brew Snippets',
			icon      : 'fas fa-th-list',
			view      : 'text',
			snippets  : [{
				name        : 'Test Snippets JSON without theme snippets',
				subsnippets : [
					{
						gen  : 'I am the first brew snippet!\n',
						name : 'First Brew Snippet'
					}, {
						gen : 'I am the second brew Snippet!',
						name: 'Second Brew Snippet'
					}
				]}]
		};
		const rendered = brewSnippetsToJSON(`Test Snippets JSON without theme snippets`, brewSnippetsBrewTest, null, true);
		expect(rendered).toStrictEqual(testMenuObject);
	});

		it('converts raw brew snippets with theme snippets to JSON', function() {
		const testMenuObject = {
			groupName : 'Brew Snippets',
			icon	    : 'fas fa-th-list',
			view      : 'text',
			snippets  : [{
				gen         : '',
  			icon        : '',
				name        : 'Test Theme',
				subsnippets : [
  				{
						gen  : 'I am the first theme snippet!\n',
						icon : '',
						name : 'First Theme Snippet',
 					},
 					{
						gen  : 'I am the second theme Snippet!',
						icon : '',
						name : 'Second Theme Snippet',
 					},
  			]},
				{
					name        : 'Test Snippets JSON with theme snippets',
					subsnippets : [
						{
							gen  : 'I am the first brew snippet!\n',
							name : 'First Brew Snippet'
						},
						{
							gen : 'I am the second brew Snippet!',
							name: 'Second Brew Snippet'
						}
					]
				}]};
		const rendered = brewSnippetsToJSON(`Test Snippets JSON with theme snippets`, brewSnippetsBrewTest, brewSnippetsThemeTest, true);
		expect(rendered).toStrictEqual(testMenuObject);
	});
});

describe(`YAMLSnippetsToText`, ()=>{
	it('converts brew snippet YAML to a string ', function() {
		const brewSnippetsYAML = [{
			subsnippets : [
				{
					gen  : 'I am the first brew snippet!\n',
					name : 'First Brew Snippet'
				}, {
					gen : 'I am the second brew Snippet!',
					name: 'Second Brew Snippet'
				}
			]
		}];
		const rendered = yamlSnippetsToText(brewSnippetsYAML);
		expect(rendered).toBe(`${brewSnippetsBrewTest}\n`);
	});
});