/* eslint-disable max-lines */

const MagicGen           = require('./snippets/magic.gen.js');
const ClassTableGen      = require('./snippets/classtable.gen.js');
const MonsterBlockGen    = require('./snippets/monsterblock.gen.js');
const ClassFeatureGen    = require('./snippets/classfeature.gen.js');
const CoverPageGen       = require('./snippets/coverpage.gen.js');
const TableOfContentsGen = require('./snippets/tableOfContents.gen.js');
const dedent             = require('dedent-tabs').default;

module.exports = [

	{
		groupName : 'Text Editor',
		icon      : 'fas fa-pencil-alt',
		view      : 'text',
		snippets  : [
			{
				name : 'Column Break',
				icon : 'fas fa-columns',
				gen  : '```\n```\n\n'
			},
			{
				name : 'New Page',
				icon : 'fas fa-file-alt',
				gen  : '\\page\n\n'
			},
			{
				name : 'Vertical Spacing',
				icon : 'fas fa-arrows-alt-v',
				gen  : '<div style=\'margin-top:140px\'></div>\n\n'
			},
			{
				name : 'Wide Block',
				icon : 'fas fa-arrows-alt-h',
				gen  : '<div class=\'wide\'>\nEverything in here will be extra wide. Tables, text, everything! Beware though, CSS columns can behave a bit weird sometimes.\n</div>\n'
			},
			{
				name : 'Image',
				icon : 'fas fa-image',
				gen  : [
					'<img ',
					'  src=\'https://s-media-cache-ak0.pinimg.com/736x/4a/81/79/4a8179462cfdf39054a418efd4cb743e.jpg\' ',
					'  style=\'width:325px\' />',
					'Credit: Kyounghwan Kim'
				].join('\n')
			},
			{
				name : 'Background Image',
				icon : 'fas fa-tree',
				gen  : [
					'<img ',
					'  src=\'http://i.imgur.com/hMna6G0.png\' ',
					'  style=\'position:absolute; top:50px; right:30px; width:280px\' />'
				].join('\n')
			},

			{
				name : 'Page Number',
				icon : 'fas fa-bookmark',
				gen  : '<div class=\'pageNumber\'>1</div>\n<div class=\'footnote\'>PART 1 | FANCINESS</div>\n\n'
			},

			{
				name : 'Auto-incrementing Page Number',
				icon : 'fas fa-sort-numeric-down',
				gen  : '<div class=\'pageNumber auto\'></div>\n'
			},

			{
				name : 'Link to page',
				icon : 'fas fa-link',
				gen  : '[Click here](#p3) to go to page 3\n'
			},

			{
				name : 'Table of Contents',
				icon : 'fas fa-book',
				gen  : TableOfContentsGen
			},
			{
				name : 'Add Comment',
				icon : 'fas fa-code',
				gen  : '<!-- This is a comment that will not be rendered into your brew. Hotkey (Ctrl/Cmd + /). -->'
			}
		]
	},


	{
		groupName : 'Style Editor',
		icon      : 'fas fa-pencil-alt',
		view      : 'style',
		snippets  : [
			{
				name : 'Remove Drop Cap',
				icon : 'fas fa-remove-format',
				gen  : dedent`/* Removes Drop Caps */
						.phb h1+p:first-letter {
							all: unset;
						}\n\n`
			},
			{
				name : 'Tweak Drop Cap',
				icon : 'fas fa-sliders-h',
				gen  : dedent`/* Drop Cap Settings */
						.phb h1 + p::first-letter {
							float: left;
							font-family: Solberry;
							font-size: 10em;
							color: #222;
							line-height: .8em;
						}\n\n`
			},
			{
				name : 'Add Comment',
				icon : 'fas fa-code',
				gen  : '/* This is a comment that will not be rendered into your brew. */'
			}
		]
	},


	/************************* PHB ********************/

	{
		groupName : 'PHB',
		icon      : 'fas fa-book',
		view      : 'text',
		snippets  : [
			{
				name : 'Spell',
				icon : 'fas fa-magic',
				gen  : MagicGen.spell,
			},
			{
				name : 'Spell List',
				icon : 'fas fa-list',
				gen  : MagicGen.spellList,
			},
			{
				name : 'Class Feature',
				icon : 'fas fa-trophy',
				gen  : ClassFeatureGen,
			},
			{
				name : 'Note',
				icon : 'fas fa-sticky-note',
				gen  : function(){
					return [
						'> ##### Time to Drop Knowledge',
						'> Use notes to point out some interesting information. ',
						'> ',
						'> **Tables and lists** both work within a note.'
					].join('\n');
				},
			},
			{
				name : 'Descriptive Text Box',
				icon : 'far fa-sticky-note',
				gen  : function(){
					return [
						'<div class=\'descriptive\'>',
						'##### Time to Drop Knowledge',
						'Use notes to point out some interesting information. ',
						'',
						'**Tables and lists** both work within a note.',
						'</div>'
					].join('\n');
				},
			},
			{
				name : 'Monster Stat Block',
				icon : 'fas fa-bug',
				gen  : MonsterBlockGen.half,
			},
			{
				name : 'Wide Monster Stat Block',
				icon : 'fas fa-paw',
				gen  : MonsterBlockGen.full,
			},
			{
				name : 'Cover Page',
				icon : 'far fa-file-word',
				gen  : CoverPageGen,
			},
			{
				name : 'Artist Credit',
				icon : 'fas fa-signature',
				gen  : '<div class=\'artist\' style=\'top:90px;right:30px;\'>\n' +
						'##### Starry Night\n' +
						'[Van Gogh](https://www.vangoghmuseum.nl/en)\n' +
						'</div>\n'
			},
		]
	},



	/*********************  TABLES *********************/

	{
		groupName : 'Tables',
		icon      : 'fas fa-table',
		view      : 'text',
		snippets  : [
			{
				name : 'Class Table',
				icon : 'fas fa-table',
				gen  : ClassTableGen.full,
			},
			{
				name : 'Half Class Table',
				icon : 'fas fa-list-alt',
				gen  : ClassTableGen.half,
			},
			{
				name : 'Table',
				icon : 'fas fa-th-list',
				gen  : function(){
					return [
						'##### Cookie Tastiness',
						'| Tastiness | Cookie Type |',
						'|:----:|:-------------|',
						'| -5  | Raisin |',
						'| 8th  | Chocolate Chip |',
						'| 11th | 2 or lower |',
						'| 14th | 3 or lower |',
						'| 17th | 4 or lower |\n\n',
					].join('\n');
				},
			},
			{
				name : 'Wide Table',
				icon : 'fas fa-list',
				gen  : function(){
					return [
						'<div class=\'wide\'>',
						'##### Cookie Tastiness',
						'| Tastiness | Cookie Type |',
						'|:----:|:-------------|',
						'| -5  | Raisin |',
						'| 8th  | Chocolate Chip |',
						'| 11th | 2 or lower |',
						'| 14th | 3 or lower |',
						'| 17th | 4 or lower |',
						'</div>\n\n'
					].join('\n');
				},
			},
			{
				name : 'Split Table',
				icon : 'fas fa-th-large',
				gen  : dedent`\n
					<div style='column-count:2'>
					| d10 | Damage Type |
					|:---:|:------------|
					|  1  | Acid        |
					|  2  | Cold        |
					|  3  | Fire        |
					|  4  | Force       |
					|  5  | Lightning   |

					| d10 | Damage Type |
					|:---:|:------------|
					|  6  | Necrotic    |
					|  7  | Poison      |
					|  8  | Psychic     |
					|  9  | Radiant     |
					|  10 | Thunder     |
					</div>
					\n`
			}
		]
	},




	/**************** PRINT *************/

	{
		groupName : 'Print',
		icon      : 'fas fa-print',
		view      : 'style',
		snippets  : [
			{
				name : 'A4 Page Size',
				icon : 'far fa-file',
				gen  : ['/* A4 Page Size */',
					'.phb {',
					'	width  : 210mm;',
					'	height : 296.8mm;',
					'}'
				].join('\n')
			},
			{
				name : 'Square Page Size',
				icon : 'far fa-file',
				gen  : ['/* Square Page Size */',
					'.phb {',
					'	width   : 125mm;',
					'	height  : 125mm;',
					'	padding : 12.5mm;',
					'	columns : unset;',
					'}',
					''
				].join('\n')
			},
			{
				name : 'Ink Friendly',
				icon : 'fas fa-tint',
				gen  : dedent`
					/* Ink Friendly */
					.phb, .phb blockquote, .phb hr+blockquote {
						background : white;
						box-shadow : 0px 0px 3px;
					}

					.phb img {
						visibility : hidden;
					}`
			},
		]
	},

];
