/* eslint-disable max-lines */

const MagicGen           = require('./snippets/magic.gen.js');
const ClassTableGen      = require('./snippets/classtable.gen.js');
const MonsterBlockGen    = require('./snippets/monsterblock.gen.js');
const scriptGen			 = require('./snippets/script.gen.js');
const ClassFeatureGen    = require('./snippets/classfeature.gen.js');
const CoverPageGen       = require('./snippets/coverpage.gen.js');
const InsideCoverPageGen = require('./snippets/insidecoverpage.gen.js')
const TableOfContentsGen = require('./snippets/tableOfContents.gen.js');
const dedent             = require('dedent-tabs').default;



module.exports = [

	{
		groupName : 'Text Editor',
		icon      : 'fas fa-pencil-alt',
		view      : 'text',
		snippets  : [
			{
				name : 'Page Number',
				icon : 'fas fa-bookmark',
				gen  : '{{pageNumber 1}}\n{{footnote PART 1 | SECTION NAME}}\n\n'
			},
			{
				name : 'Auto-incrementing Page Number',
				icon : 'fas fa-sort-numeric-down',
				gen  : '{{pageNumber,auto}}\n{{footnote PART 1 | SECTION NAME}}\n\n'
			},
			{
				name : 'Table of Contents',
				icon : 'fas fa-book',
				gen  : TableOfContentsGen
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
						.page h1+p:first-letter {
							all: unset;
						}\n\n
						/* Removes Small-Caps in first line */
						.page h1+p:first-line {
							all: unset;
						}`
			},
			{
				name : 'Tweak Drop Cap',
				icon : 'fas fa-sliders-h',
				gen  : dedent`/* Drop Cap settings */
						.page h1 + p::first-letter {
							font-family: SolberaImitationRemake;
							font-size: 3.5cm;
							background-image: linear-gradient(-45deg, #322814, #998250, #322814);
							line-height: 1em;
						}\n\n`
			}
		]
	},

	/*********************** IMAGES *******************/
	{
		groupName : 'Images',
		icon      : 'fas fa-images',
		view      : 'text',
		snippets  : [
			{
				name : 'Image',
				icon : 'fas fa-image',
				gen  : dedent`
					![cat warrior](https://s-media-cache-ak0.pinimg.com/736x/4a/81/79/4a8179462cfdf39054a418efd4cb743e.jpg) {width:325px,mix-blend-mode:multiply}

					{{artist,position:relative,top:-230px,left:10px,margin-bottom:-30px
					##### Cat Warrior
					[Kyoung Hwan Kim](https://www.artstation.com/tahra)
					}}`
			},
			{
				name : 'Background Image',
				icon : 'fas fa-tree',
				gen  : dedent`
					![homebrew mug](http://i.imgur.com/hMna6G0.png) {position:absolute,top:50px,right:30px,width:280px}

					{{artist,top:80px,right:30px
					##### Homebrew Mug
					[naturalcrit](https://homebrew.naturalcrit.com)
					}}`
			},
			{
				name : 'Watermark',
				icon : 'fas fa-id-card',
				gen  : dedent`
				{{watermark Homebrewery}}\n`
			},
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
					return dedent`
						{{note
						##### Time to Drop Knowledge
						Use notes to point out some interesting information.

						**Tables and lists** both work within a note.
						}}
						\n`;
				},
			},
			{
				name : 'Descriptive Text Box',
				icon : 'fas fa-comment-alt',
				gen  : function(){
					return dedent`
						{{descriptive
						##### Time to Drop Knowledge
						Use descriptive boxes to highlight text that should be read aloud.

						**Tables and lists** both work within a descriptive box.
						}}
						\n`;
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
				name         : 'Cover Page',
				icon         : 'fac book-front-cover',
				gen          : CoverPageGen,
				experimental : true
			},
			{
				name         : 'Inside Cover Page',
				icon         : 'fac book-front-cover',
				gen          : InsideCoverPageGen,
				experimental : true
			},
			{
				name : 'Magic Item',
				icon : 'fas fa-hat-wizard',
				gen  : MagicGen.item,
			},
			{
				name : 'Artist Credit',
				icon : 'fas fa-signature',
				gen  : function(){
					return dedent`
						{{artist,top:90px,right:30px
						##### Starry Night
						[Van Gogh](https://www.vangoghmuseum.nl/en)
						}}
						\n`;
				},
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
				gen  : ClassTableGen.full('classTable,frame,decoration,wide'),
			},
			{
				name : 'Class Table (unframed)',
				icon : 'fas fa-border-none',
				gen  : ClassTableGen.full('classTable,wide'),
			},
			{
				name : '1/2 Class Table',
				icon : 'fas fa-list-alt',
				gen  : ClassTableGen.half('classTable,decoration,frame'),
			},
			{
				name : '1/2 Class Table (unframed)',
				icon : 'fas fa-border-none',
				gen  : ClassTableGen.half('classTable'),
			},
			{
				name : '1/3 Class Table',
				icon : 'fas fa-border-all',
				gen  : ClassTableGen.third('classTable,frame'),
			},
			{
				name : '1/3 Class Table (unframed)',
				icon : 'fas fa-border-none',
				gen  : ClassTableGen.third('classTable'),
			},
			{
				name         : 'Rune Table',
				icon         : 'fas fa-language',
				gen          : scriptGen.dwarvish,
				experimental : true,
				subsnippets  : [
					{
						name : 'Dwarvish',
						icon : 'fac davek',
						gen  : scriptGen.dwarvish,
					},
					{
						name : 'Elvish',
						icon : 'fac rellanic',
						gen  : scriptGen.elvish,
					},
					{
						name : 'Draconic',
						icon : 'fac iokharic',
						gen  : scriptGen.draconic,
					},
				]
			},
		]
	},




	/**************** PAGE *************/

	{
		groupName : 'Print',
		icon      : 'fas fa-print',
		view      : 'style',
		snippets  : [
			{
				name : 'Ink Friendly',
				icon : 'fas fa-tint',
				gen  : dedent`
					/* Ink Friendly */
					*:is(.page,.monster,.note,.descriptive) {
						background : white !important;
						filter : drop-shadow(0px 0px 3px #888) !important;
					}

					.page img {
						visibility : hidden;
					}\n\n`
			},
		]
	}
];
