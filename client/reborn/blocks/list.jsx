import React from 'react';
import Inline from '../renderer/Inline.jsx';
import { runsToPmInline, pmInlineToRuns, runsToMarkdown } from './_helpers.js';

// One manifest covers both bullet and ordered lists. The AST collapses them
// under a single `list` type with `style: 'bullet'|'ordered'`; PM splits them
// into the two canonical node types `bullet_list` / `ordered_list` (with
// `list_item` as their child). All three PM nodes are contributed via the
// `group` shape so the registry knows to register them together.

function ListItem({ item }){
	return (
		<li>
			<Inline runs={item.content} />
			{item.children && <ListRender block={item.children} />}
		</li>
	);
}

function ListRender({ block }){
	const Tag = block.style === 'ordered' ? 'ol' : 'ul';
	return (
		<Tag>
			{(block.items || []).map((item, i)=><ListItem key={i} item={item} />)}
		</Tag>
	);
}

function listToPm(block, schema){
	const listType = block.style === 'ordered' ? schema.nodes.ordered_list : schema.nodes.bullet_list;
	const itemType = schema.nodes.list_item;
	const items = (block.items || []).map((item)=>{
		const para = schema.nodes.paragraph.create(null, runsToPmInline(item.content, schema));
		const children = [para];
		if(item.children) children.push(listToPm(item.children, schema));
		return itemType.create(null, children);
	});
	return listType.create(null, items);
}

function pmToList(node, schema){
	const style = node.type.name === 'ordered_list' ? 'ordered' : 'bullet';
	const items = [];
	node.forEach((itemNode)=>{
		const item = { content: [] };
		itemNode.forEach((child)=>{
			if(child.type === schema.nodes.paragraph){
				item.content = pmInlineToRuns(child);
			} else if(child.type === schema.nodes.bullet_list || child.type === schema.nodes.ordered_list){
				item.children = pmToList(child, schema);
			}
		});
		items.push(item);
	});
	return { type: 'list', style, items };
}

export default {
	type         : 'list',
	label        : 'List',
	category     : 'Text',
	icon         : 'List',
	slashAliases : ['list', 'bullet', 'ordered', 'ul', 'ol', 'numbered'],

	createAst : (overrides = {})=>({
		type  : 'list',
		style : 'bullet',
		items : [{ content: [] }],
		...overrides,
	}),
	validateAst : (n)=>{
		const errs = [];
		if(n.style !== 'bullet' && n.style !== 'ordered') errs.push('list.style must be bullet|ordered');
		if(!Array.isArray(n.items)) errs.push('list.items must be an array');
		return errs;
	},

	pmNode : {
		kind  : 'group',
		name  : 'list',                 // primary node — registered handlers key off this
		nodes : {
			ordered_list : {
				attrs    : { order: { default: 1 } },
				content  : 'list_item+',
				group    : 'block',
				parseDOM : [{ tag: 'ol', getAttrs: (dom)=>({ order: dom.hasAttribute('start') ? +dom.getAttribute('start') : 1 }) }],
				toDOM    : (node)=>(node.attrs.order === 1 ? ['ol', 0] : ['ol', { start: node.attrs.order }, 0]),
			},
			bullet_list : {
				content  : 'list_item+',
				group    : 'block',
				parseDOM : [{ tag: 'ul' }],
				toDOM    : ()=>['ul', 0],
			},
			list_item : {
				content  : 'paragraph block*',
				defining : true,
				parseDOM : [{ tag: 'li' }],
				toDOM    : ()=>['li', 0],
			},
		},
	},

	Render : ({ block })=><ListRender block={block} />,

	astToPm       : listToPm,
	// Two PM node names round-trip to this manifest's AST type.
	pmToAstByNode : { ordered_list: pmToList, bullet_list: pmToList },

	exportMarkdown : (n)=>{
		const lines = [];
		const each = (block, depth)=>{
			(block.items || []).forEach((item, i)=>{
				const bullet = block.style === 'ordered' ? `${i + 1}.` : '-';
				lines.push(`${'  '.repeat(depth)}${bullet} ${runsToMarkdown(item.content)}`);
				if(item.children) each(item.children, depth + 1);
			});
		};
		each(n, 0);
		return lines.join('\n');
	},

	// Slash menu: two entries, both routing to this manifest.
	slashItems : [
		{
			id       : 'bulletList',
			label    : 'Bullet List',
			category : 'Text',
			icon     : 'List',
			keywords : 'list bullet ul unordered',
			make     : (schema)=>schema.nodes.bullet_list.create(null,
				schema.nodes.list_item.create(null, schema.nodes.paragraph.create())),
		},
		{
			id       : 'orderedList',
			label    : 'Ordered List',
			category : 'Text',
			icon     : 'ListOrdered',
			keywords : 'list ordered numbered ol',
			make     : (schema)=>schema.nodes.ordered_list.create(null,
				schema.nodes.list_item.create(null, schema.nodes.paragraph.create())),
		},
	],

	importPriority : 80,
	importMarkdown : (lines, i)=>{
		const line = lines[i] || '';
		const bm = /^[-+*]\s+(.*)$/.exec(line);
		const om = /^\d+\.\s+(.*)$/.exec(line);
		if(!bm && !om) return null;
		const style = om ? 'ordered' : 'bullet';
		const re = om ? /^\d+\.\s+(.*)$/ : /^[-+*]\s+(.*)$/;
		const items = [];
		let j = i;
		while (j < lines.length){
			const m = re.exec(lines[j]);
			if(!m) break;
			items.push({ content: [{ text: m[1] }] });
			j++;
		}
		return { node: { type: 'list', style, items }, advance: j - i };
	},
};
