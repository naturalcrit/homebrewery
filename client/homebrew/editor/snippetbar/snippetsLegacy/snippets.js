/* eslint-disable max-lines */

const MagicGen = require('./magic.gen.js');
const ClassTableGen = require('./classtable.gen.js');
const MonsterBlockGen = require('./monsterblock.gen.js');
const ClassFeatureGen = require('./classfeature.gen.js');
const CoverPageGen = require('./coverpage.gen.js');
const TableOfContentsGen = require('./tableOfContents.gen.js');


module.exports = [

	{
		groupName : 'Editor',
		icon      : 'fa-pencil',
		snippets  : [
			{
				name : 'Column Break',
				icon : 'fa-columns',
				gen  : '```\n```\n\n'
			},
			{
				name : 'New Page',
				icon : 'fa-file-text',
				gen  : '\\page\n\n'
			},
			{
				name : 'Vertical Spacing',
				icon : 'fa-arrows-v',
				gen  : '<div style=\'margin-top:140px\'></div>\n\n'
			},
			{
				name : 'Wide Block',
				icon : 'fa-arrows-h',
				gen  : '<div class=\'wide\'>\nEverything in here will be extra wide. Tables, text, everything! Beware though, CSS columns can behave a bit weird sometimes.\n</div>\n'
			},
			{
				name : 'Image',
				icon : 'fa-image',
				gen  : [
					'<img ',
					'  src=\'https://s-media-cache-ak0.pinimg.com/736x/4a/81/79/4a8179462cfdf39054a418efd4cb743e.jpg\' ',
					'  style=\'width:325px\' />',
					'Credit: Kyounghwan Kim'
				].join('\n')
			},
			{
				name : 'Background Image',
				icon : 'fa-tree',
				gen  : [
					'<img ',
					'  src=\'http://i.imgur.com/hMna6G0.png\' ',
					'  style=\'position:absolute; top:50px; right:30px; width:280px\' />'
				].join('\n')
			},

			{
				name : 'Page Number',
				icon : 'fa-bookmark',
				gen  : '<div class=\'pageNumber\'>1</div>\n<div class=\'footnote\'>PART 1 | FANCINESS</div>\n\n'
			},

			{
				name : 'Auto-incrementing Page Number',
				icon : 'fa-sort-numeric-asc',
				gen  : '<div class=\'pageNumber auto\'></div>\n'
			},

			{
				name : 'Link to page',
				icon : 'fa-link',
				gen  : '[Click here](#p3) to go to page 3\n'
			},

			{
				name : 'Table of Contents',
				icon : 'fa-book',
				gen  : TableOfContentsGen
			},


		]
	},


	/************************* PHB ********************/

	{
		groupName : 'PHB',
		icon      : 'fa-book',
		snippets  : [
			{
				name : 'Spell',
				icon : 'fa-magic',
				gen  : MagicGen.spell,
			},
			{
				name : 'Spell List',
				icon : 'fa-list',
				gen  : MagicGen.spellList,
			},
			{
				name : 'Class Feature',
				icon : 'fa-trophy',
				gen  : ClassFeatureGen,
			},
			{
				name : 'Note',
				icon : 'fa-sticky-note',
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
				icon : 'fa-sticky-note-o',
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
				icon : 'fa-bug',
				gen  : MonsterBlockGen.half,
			},
			{
				name : 'Wide Monster Stat Block',
				icon : 'fa-paw',
				gen  : MonsterBlockGen.full,
			},
			{
				name : 'Cover Page',
				icon : 'fa-file-word-o',
				gen  : CoverPageGen,
			},
		]
	},



	/*********************  TABLES *********************/

	{
		groupName : 'Tables',
		icon      : 'fa-table',
		snippets  : [
			{
				name : 'Class Table',
				icon : 'fa-table',
				gen  : ClassTableGen.full,
			},
			{
				name : 'Half Class Table',
				icon : 'fa-list-alt',
				gen  : ClassTableGen.half,
			},
			{
				name : 'Table',
				icon : 'fa-th-list',
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
				icon : 'fa-list',
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
				icon : 'fa-th-large',
				gen  : function(){
					return [
						'<div style=\'column-count:2\'>',
						'| d10 | Damage Type |',
						'|:---:|:------------|',
						'|  1  | Acid        |',
						'|  2  | Cold        |',
						'|  3  | Fire        |',
						'|  4  | Force       |',
						'|  5  | Lightning   |',
						'',
						'```',
						'```',
						'',
						'| d10 | Damage Type |',
						'|:---:|:------------|',
						'|  6  | Necrotic    |',
						'|  7  | Poison      |',
						'|  8  | Psychic     |',
						'|  9  | Radiant     |',
						'|  10 | Thunder     |',
						'</div>\n\n',
					].join('\n');
				},
			}
		]
	},




	/**************** PRINT *************/

	{
		groupName : 'Print',
		icon      : 'fa-print',
		snippets  : [
			{
				name : 'A4 PageSize',
				icon : 'fa-file-o',
				gen  : ['<style>',
					'  .phb{',
					'    width : 210mm;',
					'    height : 296.8mm;',
					'  }',
					'</style>'
				].join('\n')
			},
			{
				name : 'Ink Friendly',
				icon : 'fa-tint',
				gen  : ['<style>',
					'  .phb{ background : white;}',
					'  .phb img{ display : none;}',
					'  .phb hr+blockquote{background : white;}',
					'</style>',
					''
				].join('\n')
			},
		]
	},

];
