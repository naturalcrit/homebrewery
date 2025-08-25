/* eslint-disable max-lines */

const WatercolorGen = require('./snippets/watercolor.gen.js');
const ImageMaskGen  = require('./snippets/imageMask.gen.js');
const FooterGen     = require('./snippets/footer.gen.js');
const dedent        = require('dedent-tabs').default;
const TableOfContentsGen = require('./snippets/tableOfContents.gen.js');
const indexGen           = require('./snippets/index.gen.js');

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
				name        : 'Page Numbering',
				icon        : 'fas fa-bookmark',
				subsnippets : [
					{
						name : 'Page Number',
						icon : 'fas fa-bookmark',
						gen  : '{{pageNumber 1}}\n'
					},
					{
						name : 'Auto-incrementing Page Number',
						icon : 'fas fa-sort-numeric-down',
						gen  : '{{pageNumber,auto}}\n'
					},
					{
						name : 'Variable Auto Page Number',
						icon : 'fas fa-sort-numeric-down',
						gen  : '{{pageNumber $[HB_pageNumber]}}\n'
					},
					{
						name : 'Skip Page Number Increment this Page',
						icon : 'fas fa-xmark',
						gen  : '{{skipCounting}}\n'
					},
					{
						name : 'Restart Numbering',
						icon : 'fas fa-arrow-rotate-left',
						gen  : '{{resetCounting}}\n'
					},
				]
			},
			{
				name        : 'Footer',
				icon        : 'fas fa-shoe-prints',
				gen         : FooterGen.createFooterFunc(),
				subsnippets : [
					{
						name : 'Footer from H1',
						icon : 'fas fa-dice-one',
						gen  : FooterGen.createFooterFunc(1)
					},
					{
						name : 'Footer from H2',
						icon : 'fas fa-dice-two',
						gen  : FooterGen.createFooterFunc(2)
					},
					{
						name : 'Footer from H3',
						icon : 'fas fa-dice-three',
						gen  : FooterGen.createFooterFunc(3)
					},
					{
						name : 'Footer from H4',
						icon : 'fas fa-dice-four',
						gen  : FooterGen.createFooterFunc(4)
					},
					{
						name : 'Footer from H5',
						icon : 'fas fa-dice-five',
						gen  : FooterGen.createFooterFunc(5)
					},
					{
						name : 'Footer from H6',
						icon : 'fas fa-dice-six',
						gen  : FooterGen.createFooterFunc(6)
					}
				]
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
				name : 'Link to page',
				icon : 'fas fa-link',
				gen  : '[Click here](#p3) to go to page 3\n'
			},
			{
				name : 'Add Comment',
				icon : 'fas fa-code',
				gen  : '<!-- This is a comment that will not be rendered into your brew. Hotkey (Ctrl/Cmd + /). -->'
			},
			{
				name : 'Homebrewery Credit',
				icon : 'fas fa-dice-d20',
				gen  : function(){
					return dedent`
						{{homebreweryCredits
						Made With
						
						{{homebreweryIcon}}
						
						The Homebrewery  
						[Homebrewery.Naturalcrit.com](https://homebrewery.naturalcrit.com)
						}}\n\n`;
				},
			},
			{
				name         : 'Table of Contents',
				icon         : 'fas fa-book',
				gen          : TableOfContentsGen,
				experimental : true,
				subsnippets  : [
					{
						name         : 'Table of Contents',
						icon         : 'fas fa-book',
						gen          : TableOfContentsGen,
						experimental : true
					},
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
					}
				]
			},
			{
				name         : 'Index',
				icon         : 'fas fa-bars',
				gen          : indexGen,
				experimental : true
			},

		]
	},
	{
		groupName : 'Style Editor',
		icon      : 'fas fa-pencil-alt',
		view      : 'style',
		snippets  : [
			{
				name : 'Add Comment',
				icon : 'fas fa-code',
				gen  : '/* This is a comment that will not be rendered into your brew. */'
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
					![cat warrior](https://s-media-cache-ak0.pinimg.com/736x/4a/81/79/4a8179462cfdf39054a418efd4cb743e.jpg) {width:325px,mix-blend-mode:multiply}`
			},
			{
				name : 'Image Wrap Left',
				icon : 'fac image-wrap-left',
				gen  : dedent`
					![homebrewery_mug](http://i.imgur.com/hMna6G0.png) {width:280px,margin-right:-3cm,wrapLeft}`
			},
			{
				name : 'Image Wrap Right',
				icon : 'fac image-wrap-right',
				gen  : dedent`
					![homebrewery_mug](http://i.imgur.com/hMna6G0.png) {width:280px,margin-left:-3cm,wrapRight}`
			},
			{
				name : 'Background Image',
				icon : 'fas fa-tree',
				gen  : dedent`
					![homebrew mug](http://i.imgur.com/hMna6G0.png) {position:absolute,top:50px,right:30px,width:280px}`
			},
			{
				name : 'Watercolor Splatter',
				icon : 'fas fa-fill-drip',
				gen  : WatercolorGen,
			},
			{
				name         : 'Watercolor Center',
				icon         : 'fac mask-center',
				gen          : ImageMaskGen.center,
				experimental : true,
			},
			{
				name         : 'Watercolor Edge',
				icon         : 'fac mask-edge',
				gen          : ImageMaskGen.edge('bottom'),
				experimental : true,
				subsnippets  : [
					{
						name : 'Top',
						icon : 'fac position-top',
						gen  : ImageMaskGen.edge('top'),
					},
					{
						name : 'Right',
						icon : 'fac position-right',
						gen  : ImageMaskGen.edge('right'),
					},
					{
						name : 'Bottom',
						icon : 'fac position-bottom',
						gen  : ImageMaskGen.edge('bottom'),
					},
					{
						name : 'Left',
						icon : 'fac position-left',
						gen  : ImageMaskGen.edge('left'),
					},
				]
			},
			{
				name         : 'Watercolor Corner',
				icon         : 'fac mask-corner',
				gen          : ImageMaskGen.corner,
				experimental : true,
				subsnippets  : [
					{
						name : 'Top-Left',
						icon : 'fac position-top-left',
						gen  : ImageMaskGen.corner('top', 'left'),
					},
					{
						name : 'Top-Right',
						icon : 'fac position-top-right',
						gen  : ImageMaskGen.corner('top', 'right'),
					},
					{
						name : 'Bottom-Left',
						icon : 'fac position-bottom-left',
						gen  : ImageMaskGen.corner('bottom', 'left'),
					},
					{
						name : 'Bottom-Right',
						icon : 'fac position-bottom-right',
						gen  : ImageMaskGen.corner('bottom', 'right'),
					}
				]
			},
			{
				name : 'Watermark',
				icon : 'fas fa-id-card',
				gen  : dedent`
				{{watermark Homebrewery}}\n`
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
			}
		]
	},
	/**************** FONTS *************/
	{
		groupName : 'Fonts',
		icon   	  : 'fas fa-keyboard',
		view   	  : 'text',
		snippets  : [
			{
				name : 'Open Sans',
				icon : 'font OpenSans',
				gen	 : dedent`{{font-family:OpenSans Dummy Text}}`
			},
			{
				name : 'Code Bold',
				icon : 'font CodeBold',
				gen	 : dedent`{{font-family:CodeBold Dummy Text}}`
			},
			{
				name : 'Code Light',
				icon : 'font CodeLight',
				gen	 : dedent`{{font-family:CodeLight Dummy Text}}`
			},
			{
				name : 'Scaly Sans',
				icon : 'font ScalySansRemake',
				gen	 : dedent`{{font-family:ScalySansRemake Dummy Text}}`
			},
			{
				name : 'Book Insanity',
				icon : 'font BookInsanityRemake',
				gen	 : dedent`{{font-family:BookInsanityRemake Dummy Text}}`
			},
			{
				name : 'Mr Eaves',
				icon : 'font MrEavesRemake',
				gen	 : dedent`{{font-family:MrEavesRemake Dummy Text}}`
			},
			{
				name : 'Pagella',
				icon : 'font Pagella',
				gen	 : dedent`{{font-family:Pagella Dummy Text}}`
			},
			{
				name : 'Solbera Imitation',
				icon : 'font SolberaImitationRemake',
				gen  : dedent`{{font-family:SolberaImitationRemake Dummy Text}}`
			  },
			  {
				name : 'Scaly Sans Small Caps',
				icon : 'font ScalySansSmallCapsRemake',
				gen  : dedent`{{font-family:ScalySansSmallCapsRemake Dummy Text}}`
			  },
			  {
				name : 'Walter Turncoat',
				icon : 'font WalterTurncoat',
				gen  : dedent`{{font-family:WalterTurncoat Dummy Text}}`
			  },
			  {
				name : 'Lato',
				icon : 'font Lato',
				gen  : dedent`{{font-family:Lato Dummy Text}}`
			  },
			  {
				name : 'Courier',
				icon : 'font Courier',
				gen  : dedent`{{font-family:Courier Dummy Text}}`
			  },
			  {
				name : 'Nodesto Caps Condensed',
				icon : 'font NodestoCapsCondensed',
				gen  : dedent`{{font-family:NodestoCapsCondensed Dummy Text}}`
			  },
			  {
				name : 'Overpass',
				icon : 'font Overpass',
				gen  : dedent`{{font-family:Overpass Dummy Text}}`
			  },
			  {
				name : 'Davek',
				icon : 'font Davek',
				gen  : dedent`{{font-family:Davek Dummy Text}}`
			  },
			  {
				name : 'Iokharic',
				icon : 'font Iokharic',
				gen  : dedent`{{font-family:Iokharic Dummy Text}}`
			  },
			  {
				name : 'Rellanic',
				icon : 'font Rellanic',
				gen  : dedent`{{font-family:Rellanic Dummy Text}}`
			  },
			  {
				name : 'Times New Roman',
				icon : 'font TimesNewRoman',
				gen  : dedent`{{font-family:"Times New Roman" Dummy Text}}`
			  }
		]
	},

	/**************** LAYOUT *************/

	{
		groupName : 'Print',
		icon      : 'fas fa-print',
		view      : 'style',
		snippets  : [
			{
				name : 'US Letter Page Size',
				icon : 'far fa-file',
				gen  : dedent`/* US Letter Page Size */
					.page {
						width  : 215.9mm; /* 8.5in */
						height : 279.4mm; /* 11in */
					}\n\n`,
			},
			{
				name : 'A3 Page Size',
				icon : 'far fa-file',
				gen  : dedent`/* A3 Page Size */
					.page {
						width  : 297mm;
						height : 420mm;
					}\n\n`,
			},
			{
				name : 'A4 Page Size',
				icon : 'far fa-file',
				gen  : dedent`/* A4 Page Size */
					.page {
						width  : 210mm;
						height : 296.8mm;
					}\n\n`
			},
			{
				name : 'A5 Page Size',
				icon : 'far fa-file',
				gen  : dedent`/* A5 Page Size */
					.page {
						width  : 148mm;
						height : 210mm;
				}\n\n`,
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
				name : 'Card Page Size',
				icon : 'far fa-file',
				gen  : dedent`/* Card Size */
					.page {
						width     : 63.5mm;
						height    : 88.9mm;
						padding	  : 5mm;
						columns	  : unset;
					}\n\n`
			},
			{
				name : 'Ink Friendly',
				icon : 'fas fa-tint',
				gen  : dedent`
					/* Ink Friendly */
					*:is(.page) {
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
