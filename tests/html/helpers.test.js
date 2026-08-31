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
		snippets : dedent `\snippet First Theme Snippet
I am the first theme snippet!

\snippet Second Theme Snippet
I am the second theme Snippet!

`,
	}
];

const brewSnippetsBrewTest = dedent`
\snippet First Brew Snippet
I am the first brew snippet!

\snippet Second Brew Snippet
I am the second brew Snippet!

`;

describe(`Helper function tests`, ()=>{
	it('brewSnippetsToJSON without theme snippets', function() {
		const testMenuObject = {
			groupName : 'Brew Snippets',
			icon	     : 'fas fa-th-list',
			snippets  : [
				{
					name        : 'Test Snippets JSON without theme snippets',
					subsnippets : [
						{
							gen  : 'I am the first brew snippet!\n',
							name : 'First Brew Snippet'
						}, {
							gen : 'I am the second brew Snippet!',
							name: 'Second Brew Snippet'
						}
					]
				}
			],
			view : 'text'
		};
		const rendered = brewSnippetsToJSON(`Test Snippets JSON without theme snippets`, brewSnippetsBrewTest, null, true);
		expect(rendered, `Input:\n${brewSnippetsBrewTest}\n${brewSnippetsThemeTest}`, { showPrefix: false }).toStrictEqual(testMenuObject);
	});

		it('brewSnippetsToJSON with theme snippets', function() {
		const testMenuObject = {
			groupName : 'Brew Snippets',
			icon	     : 'fas fa-th-list',
			snippets  : [
				{
           			gen         : '',
           			icon        : '',
					name        : 'Test Theme',
           			subsnippets :  [
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
           			],
          		},
				{
					name        : 'Test Snippets JSON without theme snippets',
					subsnippets : [
						{
							gen  : 'I am the first brew snippet!\n',
							name : 'First Brew Snippet'
						}, {
							gen : 'I am the second brew Snippet!',
							name: 'Second Brew Snippet'
						}
					]
				}
			],
			view : 'text'
		};
		const rendered = brewSnippetsToJSON(`Test Snippets JSON without theme snippets`, brewSnippetsBrewTest, brewSnippetsThemeTest, true);
		expect(rendered, `Input:\n${brewSnippetsBrewTest}\n${brewSnippetsThemeTest}`, { showPrefix: false }).toStrictEqual(testMenuObject);
	});

	it('Yaml SnippetstoText ', function() {
		const brewSnippetsBrewTestAsYAML = [
			{
				subsnippets : [
					{
						gen  : 'I am the first brew snippet!\n',
						name : 'First Brew Snippet'
					}, {
						gen : 'I am the second brew Snippet!',
						name: 'Second Brew Snippet'
					}
				]
			}
		];
		const rendered = yamlSnippetsToText(brewSnippetsBrewTestAsYAML);
		expect(rendered, `Input:\n${brewSnippetsBrewTestAsYAML}\n`, { showPrefix: false }).toBe(`${brewSnippetsBrewTest}\n`);
	});

});