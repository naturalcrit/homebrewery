var SpellGen = require('./spell.gen.js');
var ClassTableGen = require('./classtable.gen.js');
var MonsterBlockGen = require('./monsterblock.gen.js');
var ClassFeatureGen = require('./classfeature.gen.js');
var FullClassGen = require('./fullclass.gen.js');


/* Snippet Categories

	- editor
	- Tables
	- PHB
	- document
	- print

*/
















module.exports = [
	/*
	{
		tooltip : 'Full Class',
		icon : 'fa-user',
		snippet : FullClassGen,
	},
	*/
	{
		tooltip : 'Spell',
		icon : 'fa-magic',
		snippet : SpellGen,
	},
	{
		tooltip : 'Class Feature',
		icon : 'fa-trophy',
		snippet : ClassFeatureGen,
	},
	{
		tooltip : 'Note',
		icon : 'fa-sticky-note',
		snippet : function(){
			return [
				"> ##### Time to Drop Knowledge",
				"> Use notes to point out some interesting information. ",
				"> ",
				"> **Tables and lists** both work within a note."
			].join('\n');
		},
	},
	{
		tooltip : 'Table',
		icon : 'fa-th-list',
		snippet : function(){
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
	},
	{
		tooltip : 'Monster Stat Block',
		icon : 'fa-bug',
		snippet : MonsterBlockGen.half,
	},
	{
		tooltip : 'Wide Monster Stat Block',
		icon : 'fa-bullseye',
		snippet : MonsterBlockGen.full,
	},
	{
		tooltip : "Class Table",
		icon : 'fa-table',
		snippet : ClassTableGen.full,
	},
	{
		tooltip : "Half Class Table",
		icon : 'fa-list-alt',
		snippet : ClassTableGen.half,
	},
	{
		tooltip : "Column Break",
		icon : 'fa-columns',
		snippet : function(){
			return "```\n```\n\n";
		}
	},
	{
		tooltip : "New Page",
		icon : 'fa-file-text',
		snippet : function(){
			return "\\page\n\n";
		}
	},
	{
		tooltip : "Vertical Spacing",
		icon : 'fa-arrows-v',
		snippet : function(){
			return "<div style='margin-top:140px'></div>\n\n";
		}
	},
	{
		tooltip : "Insert Image",
		icon : 'fa-image',
		snippet : function(){
			return "<img src='https://i.imgur.com/RJ6S6eY.gif' style='position:absolute;bottom:-10px;right:-60px;' />";
		}
	},

	{
		tooltip : "Page number & Footnote",
		icon : 'fa-book',
		snippet : function(){
			return "<div class='pageNumber'>1</div>\n<div class='footnote'>PART 1 | FANCINESS</div>\n\n";
		}
	},

	{
		tooltip : "Ink Friendly",
		icon : 'fa-print',
		snippet : function(){
			return "<style>\n  .phb{ background : white;}\n  .phb img{ display : none;}\n  .phb hr+blockquote{background : white;}\n</style>\n\n";
		}
	},

	{
		tooltip : "A4 Page Size",
		icon : 'fa-file',
		snippet : function(){
			return '<style>\n.phb{\n    width : 210mm;\n    height : 297mm;\n}\n</style>';
		}
	}

]





module.exports = [
	{
		groupName : 'Editor',
		icon : 'fa-pencil',
		snippets : [
			{
				name : 'Spell',
				icon : 'fa-magic',
				snippet : SpellGen
			}
		]
	},
	{
		groupName : 'Tables',
		icon : 'fa-table',
		snippets : [
			{
				name : 'Spell',
				icon : 'fa-magic',
				snippet : SpellGen
			}
		]
	},
	{
		groupName : 'PHB',
		icon : 'fa-book',
		snippets : [
			{
				name : 'Spell',
				icon : 'fa-magic',
				snippet : SpellGen
			}
		]
	},

]


