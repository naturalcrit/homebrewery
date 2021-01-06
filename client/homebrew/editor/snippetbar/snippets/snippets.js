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
		icon      : 'fas fa-pencil-alt',
		snippets  : [
			{
				name : 'Column Break',
				icon : 'fas fa-columns',
				gen  : '\n\\column\n'
			},
			{
				name : 'New Page',
				icon : 'fas fa-file-alt',
				gen  : '\n\\page\n'
			},
			{
				name : 'Vertical Spacing',
				icon : 'fas fa-times-circle',
				gen  : ''
			},
			{
				name : 'Wide Block',
				icon : 'fas fa-times-circle',
				gen  : ''
			},
			{
				name : 'Image',
				icon : 'fas fa-times-circle',
				gen  : ''
			},
			{
				name : 'Background Image',
				icon : 'fas fa-times-circle',
				gen  : ''
			},
			{
				name : 'Page Number',
				icon : 'fas fa-bookmark',
				gen  : '{{pageNumber\n1\n}}\n{{footnote\nPART 1 | FANCINESS\n}}\n\n'
			},
			{
				name : 'Auto-incrementing Page Number',
				icon : 'fas fa-sort-numeric-down',
				gen  : '{{\npageNumber,auto\n}}\n\n'
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
		]
	},


	/************************* PHB ********************/

	{
		groupName : 'PHB',
		icon      : 'fas fa-book',
		snippets  : [
			{
				name : 'Spell',
				icon : 'fas fa-magic',
				gen  : MagicGen.spell,
			},
			{
				name : 'Spell List',
				icon : 'fas fa-scroll',
				gen  : MagicGen.spellList,
			},
			{
				name : 'Class Feature',
				icon : 'fas fa-mask',
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
				icon : 'fas fa-comment-alt',
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
				icon : 'fas fa-spider',
				gen  : MonsterBlockGen.half,
			},
			{
				name : 'Wide Monster Stat Block',
				icon : 'fas fa-dragon',
				gen  : MonsterBlockGen.full,
			},
			{
				name : 'Cover Page',
				icon : 'fas fa-file-word',
				gen  : CoverPageGen,
			},
		]
	},



	/*********************  TABLES *********************/

	{
		groupName : 'Tables',
		icon      : 'fas fa-table',
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
		icon      : 'fas fa-print',
		snippets  : [
			{
				name : 'A4 PageSize',
				icon : 'far fa-file',
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
				icon : 'fas fa-tint',
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
