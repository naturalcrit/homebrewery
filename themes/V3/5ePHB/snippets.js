/* eslint-disable max-lines */

const MagicGen           = require('./snippets/magic.gen.js');
const ClassTableGen      = require('./snippets/classtable.gen.js');
const MonsterBlockGen    = require('./snippets/monsterblock.gen.js');
const scriptGen          = require('./snippets/script.gen.js');
const ClassFeatureGen    = require('./snippets/classfeature.gen.js');
const CoverPageGen       = require('./snippets/coverpage.gen.js');
const TableOfContentsGen = require('./snippets/tableOfContents.gen.js');
const indexGen           = require('./snippets/index.gen.js');
const QuoteGen 			 = require('./snippets/quote.gen.js');
const dedent             = require('dedent-tabs').default;



module.exports = [

	{
		groupName : 'Text Editor',
		icon      : 'fas fa-pencil-alt',
		view      : 'text',
		snippets  : [
			{
				name         : 'Table of Contents',
				icon         : 'fas fa-book',
				gen          : TableOfContentsGen,
				experimental : true,
				subsnippets  : [
					{
						name         : 'Generate Table of Contents',
						icon         : 'fas fa-book',
						gen          : TableOfContentsGen,
						experimental : true
					},
					{
						name : 'Table of Contents Individual Inclusion',
						icon : 'fas fa-book',
						gen  : dedent `\n{{tocInclude# CHANGE # to your header level
							}}\n`,
						subsnippets : [
							{
								name : 'Individual Inclusion H1',
								icon : 'fas fa-book',
								gen  : dedent `\n{{tocIncludeH1 \n
									}}\n`,
							},
							{
								name : 'Individual Inclusion H2',
								icon : 'fas fa-book',
								gen  : dedent `\n{{tocIncludeH2 \n
									}}\n`,
							},
							{
								name : 'Individual Inclusion H3',
								icon : 'fas fa-book',
								gen  : dedent `\n{{tocIncludeH3 \n
									}}\n`,
							},
							{
								name : 'Individual Inclusion H4',
								icon : 'fas fa-book',
								gen  : dedent `\n{{tocIncludeH4 \n
									}}\n`,
							},
							{
								name : 'Individual Inclusion H5',
								icon : 'fas fa-book',
								gen  : dedent `\n{{tocIncludeH5 \n
									}}\n`,
							},
							{
								name : 'Individual Inclusion H6',
								icon : 'fas fa-book',
								gen  : dedent `\n{{tocIncludeH6 \n
									}}\n`,
							}
						]
					},
					{
						name : 'Table of Contents Range Inclusion',
						icon : 'fas fa-book',
						gen  : dedent `\n{{tocDepthH3
							}}\n`,
						subsnippets : [
							{
								name : 'Include in ToC up to H3',
								icon : 'fas fa-dice-three',
								gen  : dedent `\n{{tocDepthH3
									}}\n`,

							},
							{
								name : 'Include in ToC up to H4',
								icon : 'fas fa-dice-four',
								gen  : dedent `\n{{tocDepthH4
									}}\n`,
							},
							{
								name : 'Include in ToC up to H5',
								icon : 'fas fa-dice-five',
								gen  : dedent `\n{{tocDepthH5
									}}\n`,
							},
							{
								name : 'Include in ToC up to H6',
								icon : 'fas fa-dice-six',
								gen  : dedent `\n{{tocDepthH6
									}}\n`,
							},
						]
					},
					{
						name : 'Table of Contents Individual Exclusion',
						icon : 'fas fa-book',
						gen  : dedent `\n{{tocExcludeH1 \n
							}}\n`,
						subsnippets : [
							{
								name : 'Individual Exclusion H1',
								icon : 'fas fa-book',
								gen  : dedent `\n{{tocExcludeH1 \n
									}}\n`,
							},
							{
								name : 'Individual Exclusion H2',
								icon : 'fas fa-book',
								gen  : dedent `\n{{tocExcludeH2 \n
									}}\n`,
							},
							{
								name : 'Individual Exclusion H3',
								icon : 'fas fa-book',
								gen  : dedent `\n{{tocExcludeH3 \n
									}}\n`,
							},
							{
								name : 'Individual Exclusion H4',
								icon : 'fas fa-book',
								gen  : dedent `\n{{tocExcludeH4 \n
									}}\n`,
							},
							{
								name : 'Individual Exclusion H5',
								icon : 'fas fa-book',
								gen  : dedent `\n{{tocExcludeH5 \n
									}}\n`,
							},
							{
								name : 'Individual Exclusion H6',
								icon : 'fas fa-book',
								gen  : dedent `\n{{tocExcludeH6 \n
									}}\n`,
							},
						]
					},

				]
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
			},
			{
				name        : 'Table of Contents Toggles',
				icon        : 'fas fa-book',
				subsnippets : [
					{
						name : 'Enable H1-H4 all pages',
						icon : 'fas fa-dice-four',
						gen  : `.page {\n\th4 {--TOC: include; }\n}\n\n`,
					},
					{
						name : 'Enable H1-H5 all pages',
						icon : 'fas fa-dice-five',
						gen  : `.page {\n\th4, h5 {--TOC: include; }\n}\n\n`,
					},
					{
						name : 'Enable H1-H6 all pages',
						icon : 'fas fa-dice-six',
						gen  : `.page {\n\th4, h5, h6 {--TOC: include; }\n}\n\n`,
					},
				]
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
				name : 'Quote',
				icon : 'fas fa-quote-right',
				gen  : QuoteGen,
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
				name         : 'Front Cover Page',
				icon         : 'fac book-front-cover',
				gen          : CoverPageGen.front,
				experimental : true
			},
			{
				name         : 'Inside Cover Page',
				icon         : 'fac book-inside-cover',
				gen          : CoverPageGen.inside,
				experimental : true
			},
			{
				name         : 'Part Cover Page',
				icon         : 'fac book-part-cover',
				gen          : CoverPageGen.part,
				experimental : true
			},
			{
				name      		 : 'Back Cover Page',
				icon      		 : 'fac book-back-cover',
				gen       		 : CoverPageGen.back,
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
			}
		]
	},



	/*********************  TABLES *********************/

	{
		groupName : 'Tables',
		icon      : 'fas fa-table',
		view      : 'text',
		snippets  : [
			{
				name        : 'Class Tables',
				icon        : 'fas fa-table',
				gen         : ClassTableGen.full('classTable,frame,decoration,wide'),
				subsnippets : [
					{
						name : 'Martial Class Table',
						icon : 'fas fa-table',
						gen  : ClassTableGen.non('classTable,frame,decoration'),
					},
					{
						name : 'Martial Class Table (unframed)',
						icon : 'fas fa-border-none',
						gen  : ClassTableGen.non('classTable'),
					},
					{
						name : 'Full Caster Class Table',
						icon : 'fas fa-table',
						gen  : ClassTableGen.full('classTable,frame,decoration,wide'),
					},
					{
						name : 'Full Caster Class Table (unframed)',
						icon : 'fas fa-border-none',
						gen  : ClassTableGen.full('classTable,wide'),
					},
					{
						name : 'Half Caster Class Table',
						icon : 'fas fa-list-alt',
						gen  : ClassTableGen.half('classTable,frame,decoration,wide'),
					},
					{
						name : 'Half Caster Class Table (unframed)',
						icon : 'fas fa-border-none',
						gen  : ClassTableGen.half('classTable,wide'),
					},
					{
						name : 'Third Caster Spell Table',
						icon : 'fas fa-border-all',
						gen  : ClassTableGen.third('classTable,frame,decoration'),
					},
					{
						name : 'Third Caster Spell Table (unframed)',
						icon : 'fas fa-border-none',
						gen  : ClassTableGen.third('classTable'),
					}
				]
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
						box-shadow : 1px 4px 14px #888 !important;
					}

					.page img {
						visibility : hidden;
					}\n\n`
			},
		]
	}
];
