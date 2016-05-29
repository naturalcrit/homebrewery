var MagicGen = require('./magic.gen.js');
var ClassTableGen = require('./classtable.gen.js');
var MonsterBlockGen = require('./monsterblock.gen.js');
var ClassFeatureGen = require('./classfeature.gen.js');
var FullClassGen = require('./fullclass.gen.js');


module.exports = [

	{
		groupName : 'Editor',
		icon : 'fa-pencil',
		snippets : [
			{
				name : "Column Break",
				icon : 'fa-columns',
				gen : "```\n```\n\n"
			},
			{
				name : "New Page",
				icon : 'fa-file-text',
				gen : "\\page\n\n"
			},
			{
				name : "Vertical Spacing",
				icon : 'fa-arrows-v',
				gen : "<div style='margin-top:140px'></div>\n\n"
			},
			{
				name : "Image",
				icon : 'fa-image',
				gen : [
					"<img ",
					"  src='https://s-media-cache-ak0.pinimg.com/736x/4a/81/79/4a8179462cfdf39054a418efd4cb743e.jpg' ",
					"  style='width:325px' />",
					"Credit: Kyounghwan Kim"
				].join('\n')
			},
			{
				name : "Background Image",
				icon : 'fa-tree',
				gen : [
					"<img ",
					"  src='http://i.imgur.com/hMna6G0.png' ",
					"  style='position:absolute; top:50px; right:30px; width:280px' />"
				].join('\n')
			},

			{
				name : "Page Number",
				icon : 'fa-bookmark',
				gen : "<div class='pageNumber'>1</div>\n<div class='footnote'>PART 1 | FANCINESS</div>\n\n"
			},


		]
	},


	/************************* PHB ********************/

	{
		groupName : 'PHB',
		icon : 'fa-book',
		snippets : [
			{
				name : 'Spell',
				icon : 'fa-magic',
				gen : MagicGen.spell,
			},
			{
				name : 'Spell List',
				icon : 'fa-list',
				gen : MagicGen.spellList,
			},
			{
				name : 'Class Feature',
				icon : 'fa-trophy',
				gen : ClassFeatureGen,
			},
			{
				name : 'Note',
				icon : 'fa-sticky-note',
				gen : function(){
					return [
						"> ##### Time to Drop Knowledge",
						"> Use notes to point out some interesting information. ",
						"> ",
						"> **Tables and lists** both work within a note."
					].join('\n');
				},
			},
			{
				name : 'Monster Stat Block',
				icon : 'fa-bug',
				gen : MonsterBlockGen.half,
			},
			{
				name : 'Wide Monster Stat Block',
				icon : 'fa-paw',
				gen : MonsterBlockGen.full,
			}
		]
	},



	/*********************  TABLES *********************/

	{
		groupName : 'Tables',
		icon : 'fa-table',
		snippets : [
			{
				name : "Class Table",
				icon : 'fa-table',
				gen : ClassTableGen.full,
			},
			{
				name : "Half Class Table",
				icon : 'fa-list-alt',
				gen : ClassTableGen.half,
			},
			{
				name : 'Table',
				icon : 'fa-th-list',
				gen : function(){
					return [
						"##### Cookie Tastiness",
						"| Tastiness | Cookie Type |",
						"|:----:|:-------------|",
						"| -5  | Raisin |",
						"| 8th  | Chocolate Chip |",
						"| 11th | 2 or lower |",
						"| 14th | 3 or lower |",
						"| 17th | 4 or lower |\n\n",
					].join('\n');
				},
			}
		]
	},




	/**************** PRINT *************/

	{
		groupName : 'Print',
		icon : 'fa-print',
		snippets : [
			{
				name : "A4 PageSize",
				icon : 'fa-file-o',
				gen : ['<style>',
					'  .phb{',
					'    width : 210mm;',
					'    height : 296.8mm;',
					'  }',
					'</style>'
				].join('\n')
			},
			{
				name : "Ink Friendly",
				icon : 'fa-tint',
				gen : ['<style>',
					'  .phb{ background : white;}',
					'  .phb img{ display : none;}',
					'  .phb hr+blockquote{background : white;}',
					'</style>',
					''
				].join('\n')
			},
		]
	},

]
