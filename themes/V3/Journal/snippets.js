/* eslint-disable max-lines */

const MagicGen           = require('./snippets/magic.gen.js');
const ClassTableGen      = require('./snippets/classtable.gen.js');
const MonsterBlockGen    = require('./snippets/monsterblock.gen.js');
const ClassFeatureGen    = require('./snippets/classfeature.gen.js');
const CoverPageGen       = require('./snippets/coverpage.gen.js');
const TableOfContentsGen = require('./snippets/tableOfContents.gen.js');
const WatercolorGen      = require('./snippets/watercolor.gen.js');
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
				gen  : '\n\\column\n'
			},
			{
				name : 'New Page',
				icon : 'fas fa-file-alt',
				gen  : '\n\\page\n'
			},
			{
				name : 'Vertical Spacing',
				icon : 'fas fa-arrows-alt-v',
				gen  : '\n::::\n'
			},
			{
				name : 'Horizontal Spacing',
				icon : 'fas fa-arrows-alt-h',
				gen  : ' {{width:100px}} '
			},
			{
				name : 'Wide Block',
				icon : 'fas fa-window-maximize',
				gen  : dedent`\n
					{{wide
					Everything in here will be extra wide. Tables, text, everything!
					Beware though, CSS columns can behave a bit weird sometimes. You may
					have to manually place column breaks with \`\column\` to make the
					surrounding text flow with this wide block the way you want.
					}}
					\n`
			},
			{
				name : 'QR Code',
				icon : 'fas fa-qrcode',
				gen  : (brew)=>{
					return `![]` +
							`(https://api.qrserver.com/v1/create-qr-code/?data=` +
							`https://homebrewery.naturalcrit.com${brew.shareId ? `/share/${brew.shareId}` : ''}` +
							`&amp;size=100x100) {width:100px;mix-blend-mode:multiply}`;
				}
			},
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
			},
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
			},
			{
				name : 'Add Comment',
				icon : 'fas fa-code',
				gen  : '/* This is a comment that will not be rendered into your brew. */'
			},
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
				name : 'Watercolor Splatter',
				icon : 'fas fa-fill-drip',
				gen  : WatercolorGen,
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
				name : 'Cover Page',
				icon : 'fas fa-file-word',
				gen  : CoverPageGen,
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
						{{column-count:2
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
			},
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
			}
		]
	},




	/**************** PAGE *************/

	{
		groupName : 'Print',
		icon      : 'fas fa-print',
		view      : 'style',
		snippets  : [
			{
				name : 'A4 Page Size',
				icon : 'far fa-file',
				gen  : dedent`/* A4 Page Size */
					.page{
						width  : 210mm;
						height : 296.8mm;
					}\n\n`
			},
			{
				name : 'Square Page Size',
				icon : 'far fa-file',
				gen  : dedent`/* Square Page Size */
					.page {
						width   : 125mm;
						height  : 125mm;
						padding : 12.5mm;
						columns : unset;
					}\n\n`
			},
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
	},

];
