/* eslint-disable max-lines */

const MagicGen = require('./magic.gen.js');
const ClassTableGen = require('./classtable.gen.js');
const MonsterBlockGen = require('./monsterblock.gen.js');
const ClassFeatureGen = require('./classfeature.gen.js');
const CoverPageGen = require('./coverpage.gen.js');
const TableOfContentsGen = require('./tableOfContents.gen.js');
const dedent = require('dedent-tabs').default;


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
				icon : 'fas fa-tree',
				gen  : `<img src='http://i.imgur.com/hMna6G0.png' ` +
							`style='position:absolute; top:50px; right:30px; width:280px'/>`
			},
			{
				name : 'QR Code',
				icon : 'fas fa-qrcode',
				gen  : (brew)=>{
					return `<img ` +
							`src='https://api.qrserver.com/v1/create-qr-code/?data=` +
							`https://homebrewery.naturalcrit.com/share/${brew.shareId}` +
							`&amp;size=100x100' ` +
							`style='width:100px;mix-blend-mode:multiply'/>`;
				}

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
			{
				name : 'Remove Drop Cap',
				icon : 'fas fa-remove-format',
				gen  : '<style>\n' +
						'  .phb3 h1+p:first-letter {\n' +
						'    all: unset;\n' +
						'  }\n' +
						'</style>'
			},
			{
				name : 'Tweak Drop Cap',
				icon : 'fas fa-sliders-h',
				gen  : '<style>\n' +
						'  /* Drop Cap settings */\n' +
						'  .phb3 h1 + p::first-letter {\n' +
						'    float: left;\n' +
						'    font-family: SolberaImitationRemake;\n' +
						'    font-size: 3.5cm;\n' +
						'    color: #222;\n' +
						'    line-height: .8em;\n' +
						'  }\n' +
						'</style>'
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
				name : 'Monster Stat Block (unframed)',
				icon : 'fas fa-paw',
				gen  : MonsterBlockGen.monster('monster', 2),
			},
			{
				name : 'Monster Stat Block',
				icon : 'fas fa-spider',
				gen  : MonsterBlockGen.monster('monster,frame', 2),
			},
			{
				name : 'Wide Monster Stat Block',
				icon : 'fas fa-dragon',
				gen  : MonsterBlockGen.monster('monster,frame,wide', 4),
			},
			{
				name : 'Cover Page',
				icon : 'fas fa-file-word',
				gen  : CoverPageGen,
			},
			{
				name : 'Magic Item',
				icon : 'fas fa-hat-wizard',
				gen  : MagicGen.item,
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
					return dedent`
						##### Character Advancement
						| Experience Points | Level | Proficiency Bonus |
						|:------------------|:-----:|:-----------------:|
						| 0                 | 1     | +2                |
						| 300               | 2     | +2                |
						| 900               | 3     | +2                |
						| 2,700             | 4     | +2                |
						| 6,500             | 5     | +3                |
						| 14,000            | 6     | +3                |
						\n`;
				}
			},
			{
				name : 'Wide Table',
				icon : 'fas fa-list',
				gen  : function(){
					return dedent`
						{{wide
						##### Weapons
						| Name                    | Cost  | Damage          | Weight  | Properties |
						|:------------------------|:-----:|:----------------|--------:|:-----------|
						| *Simple Melee Weapons*  |       |                 |         |            |
						| &emsp; Club             | 1 sp  | 1d4 bludgeoning | 2 lb.   | Light      |
						| &emsp; Dagger           | 2 gp  | 1d4 piercing    | 1 lb.   | Finesse    |
						| &emsp; Spear            | 1 gp  | 1d6 piercing    | 3 lb.   | Thrown     |
						| *Simple Ranged Weapons* |       |                 |         |            |
						| &emsp; Dart             | 5 cp  | 1d4 piercig     | 1/4 lb. | Finesse    |
						| &emsp; Shortbow         | 25 gp | 1d6 piercing    | 2 lb.   | Ammunition |
						| &emsp; Sling            | 1 sp  | 1d4 bludgeoning | &mdash; | Ammunition |
						}}
						\n`;
				}
			},
			{
				name : 'Split Table',
				icon : 'fas fa-th-large',
				gen  : function(){
					return dedent`
						##### Typical Difficulty Classes
						{{column-count="2"
						| Task Difficulty | DC |
						|:----------------|:--:|
						| Very easy       | 5  |
						| Easy            | 10 |
						| Medium          | 15 |

						| Task Difficulty   | DC |
						|:------------------|:--:|
						| Hard              | 20 |
						| Very hard         | 25 |
						| Nearly impossible | 30 |
						}}
						\n`;
				}
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
