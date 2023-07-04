/* eslint-disable max-lines */

const MagicGen           = require('./snippets/magic.gen.js');
const ClassTableGen      = require('./snippets/classtable.gen.js');
const MonsterBlockGen    = require('./snippets/monsterblock.gen.js');
const scriptGen          = require('./snippets/script.gen.js');
const ClassFeatureGen    = require('./snippets/classfeature.gen.js');
const CoverPageGen       = require('./snippets/coverpage.gen.js');
const TableOfContentsGen = require('./snippets/tableOfContents.gen.js');
const indexGen           = require('./snippets/index.gen.js');
const dedent             = require('dedent-tabs').default;



module.exports = [

	{
		groupName : 'Text Editor',
		icon      : 'fas fa-pencil-alt',
		view      : 'text',
		snippets  : [
			{
				name : 'Seitennummer',
				icon : 'fas fa-bookmark',
				gen  : '{{pageNumber 1}}\n{{footnote PART 1 | SECTION NAME}}\n\n'
			},
			{
				name : 'Selbstzählende Seitennummer',
				icon : 'fas fa-sort-numeric-down',
				gen  : '{{pageNumber,auto}}\n{{footnote PART 1 | SECTION NAME}}\n\n'
			},
			{
				name : 'Inhaltsverzeichnis',
				icon : 'fas fa-book',
				gen  : TableOfContentsGen
			},
			{
				name         : 'Index',
				icon         : 'fas fa-bars',
				gen          : indexGen,
				experimental : true
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
		groupName : 'Grafiken',
		icon      : 'fas fa-images',
		view      : 'text',
		snippets  : [
			{
				name : 'Bild',
				icon : 'fas fa-image',
				gen  : dedent`
					![cat warrior](https://s-media-cache-ak0.pinimg.com/736x/4a/81/79/4a8179462cfdf39054a418efd4cb743e.jpg) {width:325px,mix-blend-mode:multiply}

					{{artist,position:relative,top:-230px,left:10px,margin-bottom:-30px
					##### Cat Warrior
					[Kyoung Hwan Kim](https://www.artstation.com/tahra)
					}}`
			},
			{
				name : 'Hintergrundbild',
				icon : 'fas fa-tree',
				gen  : dedent`
					![homebrew mug](http://i.imgur.com/hMna6G0.png) {position:absolute,top:50px,right:30px,width:280px}

					{{artist,top:80px,right:30px
					##### Homebrew Mug
					[naturalcrit](https://homebrew.naturalcrit.com)
					}}`
			},
			{
				name : 'Wasserzeichen',
				icon : 'fas fa-id-card',
				gen  : dedent`
				{{watermark Homebrewery}}\n`
			},
		]
	},


	/************************* PHB ********************/

	{
		groupName : 'Ilaris',
		icon      : 'fas fa-book',
		view      : 'text',
		snippets  : [
			{
				name : 'Zauber',
				icon : 'fas fa-magic',
				gen  : MagicGen.spell,
			},
			{
				name : 'Zauberliste',
				icon : 'fas fa-scroll',
				gen  : MagicGen.spellList,
			},
			{
				name : 'Klassenfähgikeit',
				icon : 'fas fa-mask',
				gen  : ClassFeatureGen,
			},
			{
				name : 'Notiz',
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
				name : 'Textbox',
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
				name : 'Kreatur (randlos)',
				icon : 'fas fa-paw',
				gen  : MonsterBlockGen.monster('monster', 2),
			},
			{
				name : 'Kreatur',
				icon : 'fas fa-spider',
				gen  : MonsterBlockGen.monster('monster,frame', 2),
			},
			{
				name : 'Kreatur (breit)',
				icon : 'fas fa-dragon',
				gen  : MonsterBlockGen.monster('monster,frame,wide', 4),
			},
			{
				name         : 'Deckblatt - Vollbild',
				icon         : 'fac book-front-cover',
				gen          : CoverPageGen.front,
				experimental : true
			},
			{
				name         : 'Deckblatt - Teilbild',
				icon         : 'fac book-inside-cover',
				gen          : CoverPageGen.inside,
				experimental : true
			},
			// {
			// 	name         : 'Part Cover Page',
			// 	icon         : 'fac book-part-cover',
			// 	gen          : CoverPageGen.part,
			// 	experimental : true
			// },
			{
				name      		 : 'Rückseite',
				icon      		 : 'fac book-back-cover',
				gen       		 : CoverPageGen.back,
				experimental : true
			},
			{
				name: 'Einzelkarte',
				icon: 'far fa-square',
				gen : function(){
					return dedent`
						\page
						{{einzelkarte}}
						{{karte
						#### Kartentitel
						##### Untertitel
						Kartentext oder Inhalte
						###### Fußzeile
						}}
						\n`;
				},
			},
			{
				name      		 : 'Karten (3x3)',
				icon      		 : 'fas fa-th',
				gen       		 : CoverPageGen.cards3x3,
				experimental : false
			},
			{
				name : 'Artefakt',
				icon : 'fas fa-hat-wizard',
				gen  : MagicGen.item,
			},
			{
				name : 'Künstler Credit',
				icon : 'fas fa-signature',
				gen  : function(){
					return dedent`
						{{artist,top:90px,right:30px
						##### Starry Night
						[Van Gogh](https://www.vangoghmuseum.nl/en)
						}}
						\n`;
				},
			}
		]
	},



	/*********************  TABLES *********************/

	{
		groupName : 'Tabellen',
		icon      : 'fas fa-table',
		view      : 'text',
		snippets  : [
			{
				name : 'Klassentabelle',
				icon : 'fas fa-table',
				gen  : ClassTableGen.full('classTable,frame,decoration,wide'),
			},
			{
				name : 'Klassentabelle (randlos)',
				icon : 'fas fa-border-none',
				gen  : ClassTableGen.full('classTable,wide'),
			},
			{
				name : '1/2 Klassentabelle',
				icon : 'fas fa-list-alt',
				gen  : ClassTableGen.half('classTable,decoration,frame'),
			},
			{
				name : '1/2 Klassentabelle (randlos)',
				icon : 'fas fa-border-none',
				gen  : ClassTableGen.half('classTable'),
			},
			{
				name : '1/3 Klassentabelle',
				icon : 'fas fa-border-all',
				gen  : ClassTableGen.third('classTable,frame'),
			},
			{
				name : '1/3 Klassentabelle (randlos)',
				icon : 'fas fa-border-none',
				gen  : ClassTableGen.third('classTable'),
			},
			{
				name         : 'Runen',
				icon         : 'fas fa-language',
				gen          : scriptGen.dwarvish,
				experimental : true,
				subsnippets  : [
					{
						name : 'Zwergisch',
						icon : 'fac davek',
						gen  : scriptGen.dwarvish,
					},
					{
						name : 'Elfisch',
						icon : 'fac rellanic',
						gen  : scriptGen.elvish,
					},
					{
						name : 'Drachisch',
						icon : 'fac iokharic',
						gen  : scriptGen.draconic,
					},
				]
			},
		]
	},




	/**************** PAGE *************/

	{
		groupName : 'Druck',
		icon      : 'fas fa-print',
		view      : 'style',
		snippets  : [
			{
				name : 'Toner-schonend',
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
