import React from 'react';

export default {
	type         : 'image',
	label        : 'Image',
	category     : 'Media',
	icon         : 'Image',
	slashAliases : ['image', 'picture', 'illustration', 'art'],

	createAst   : (overrides = {})=>({ type: 'image', src: '', alt: '', width: null, height: null, ...overrides }),
	validateAst : (n)=>(typeof n.src === 'string' ? [] : ['image.src must be a string']),

	pmNode : {
		kind : 'atom',
		spec : {
			group : 'block',
			atom  : true,
			attrs : {
				src    : { default: '' },
				alt    : { default: '' },
				width  : { default: null },
				height : { default: null },
			},
			parseDOM : [{
				tag      : 'img[src]',
				getAttrs : (dom)=>({
					src    : dom.getAttribute('src') || '',
					alt    : dom.getAttribute('alt') || '',
					width  : dom.getAttribute('width') || null,
					height : dom.getAttribute('height') || null,
				}),
			}],
			toDOM : (node)=>['img', { ...node.attrs }],
		},
	},

	Render : ({ block })=>(
		<img
			src={block.src}
			alt={block.alt || ''}
			width={block.width || undefined}
			height={block.height || undefined}
		/>
	),

	astToPm : (block, schema)=>schema.nodes.image.create({
		src    : block.src || '',
		alt    : block.alt || '',
		width  : block.width || null,
		height : block.height || null,
	}),
	pmToAst : (node)=>({ type: 'image', ...node.attrs }),

	exportMarkdown : (n)=>`![${n.alt || ''}](${n.src || ''})`,
	importPriority : 75,
	importMarkdown : (lines, i)=>{
		const m = /^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/.exec(lines[i] || '');
		if(!m) return null;
		return {
			node    : { type: 'image', src: m[2], alt: m[1], width: null, height: null },
			advance : 1,
		};
	},
};
