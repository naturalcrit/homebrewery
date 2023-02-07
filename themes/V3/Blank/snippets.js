/* eslint-disable max-lines */

const WatercolorGen = require('./snippets/watercolor.gen.js');
const ImageMaskGen  = require('./snippets/imageMask.gen.js');
const dedent        = require('dedent-tabs').default;

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
				name : 'Link to page',
				icon : 'fas fa-link',
				gen  : '[Click here](#p3) to go to page 3\n'
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
					![cat warrior](https://s-media-cache-ak0.pinimg.com/736x/4a/81/79/4a8179462cfdf39054a418efd4cb743e.jpg) {width:325px,mix-blend-mode:multiply}`
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
				name        : 'Watercolor Image Mask Edge',
				icon        : 'fac mask-edge',
				gen         : ImageMaskGen.edge('bottom'),
				subsnippets : [
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
				name        : 'Watercolor Image Mask Corner',
				icon        : 'fac mask-corner',
				gen         : ImageMaskGen.corner,
				subsnippets : [
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
					*:is(.page) {
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
