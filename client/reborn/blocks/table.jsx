import React from 'react';
import Inline from '../renderer/Inline.jsx';
import { runsToPmInline, pmInlineToRuns, runsToMarkdown } from './_helpers.js';

// Bare-bones table: header row + body rows. Cells contain a single paragraph,
// which means inline editing inside cells composes with the paragraph
// manifest. PM contributes four nodes here because `table`, `tableRow`,
// `tableCell`, and `tableHeader` are siblings in the schema graph.

function inlineCellToParagraph(cellRuns, schema){
	return schema.nodes.paragraph.create(null, runsToPmInline(cellRuns, schema));
}

export default {
	type         : 'table',
	label        : 'Table',
	category     : 'Tables',
	icon         : 'Table',
	slashAliases : ['table', 'grid', 'data'],
	keepTogether : true,

	createAst : (overrides = {})=>({
		type    : 'table',
		headers : [[], []],
		rows    : [[[], []], [[], []]],
		...overrides,
	}),
	validateAst : (n)=>{
		const errs = [];
		if(!Array.isArray(n.headers)) errs.push('table.headers must be an array');
		if(!Array.isArray(n.rows)) errs.push('table.rows must be an array');
		return errs;
	},

	pmNode : {
		kind  : 'group',
		name  : 'table',
		nodes : {
			table : {
				content   : 'tableRow+',
				group     : 'block',
				isolating : true,
				parseDOM  : [{ tag: 'table' }],
				toDOM     : ()=>['table', ['tbody', 0]],
			},
			tableRow : {
				content  : '(tableHeader | tableCell)+',
				parseDOM : [{ tag: 'tr' }],
				toDOM    : ()=>['tr', 0],
			},
			tableCell : {
				attrs     : { align: { default: null } },
				content   : 'paragraph+',
				isolating : true,
				parseDOM  : [{ tag: 'td', getAttrs: (dom)=>({ align: dom.getAttribute('align') || null }) }],
				toDOM     : (node)=>{
					const a = {};
					if(node.attrs.align) a.align = node.attrs.align;
					return ['td', a, 0];
				},
			},
			tableHeader : {
				attrs     : { align: { default: null } },
				content   : 'paragraph+',
				isolating : true,
				parseDOM  : [{ tag: 'th', getAttrs: (dom)=>({ align: dom.getAttribute('align') || null }) }],
				toDOM     : (node)=>{
					const a = {};
					if(node.attrs.align) a.align = node.attrs.align;
					return ['th', a, 0];
				},
			},
		},
	},

	Render : ({ block })=>(
		<table>
			{block.headers && block.headers.length > 0 && (
				<thead>
					<tr>
						{block.headers.map((cell, i)=>(
							<th key={i}><Inline runs={cell} /></th>
						))}
					</tr>
				</thead>
			)}
			<tbody>
				{(block.rows || []).map((row, ri)=>(
					<tr key={ri}>
						{row.map((cell, ci)=>(
							<td key={ci}><Inline runs={cell} /></td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	),

	astToPm : (block, schema)=>{
		const rows = [];
		if(block.headers && block.headers.length){
			const cells = block.headers.map((cellRuns)=>(
				schema.nodes.tableHeader.create(null, [inlineCellToParagraph(cellRuns, schema)])
			));
			rows.push(schema.nodes.tableRow.create(null, cells));
		}
		for (const row of block.rows || []){
			const cells = row.map((cellRuns)=>(
				schema.nodes.tableCell.create(null, [inlineCellToParagraph(cellRuns, schema)])
			));
			rows.push(schema.nodes.tableRow.create(null, cells));
		}
		return schema.nodes.table.create(null, rows);
	},

	pmToAst : (node, schema)=>{
		const headers = [];
		const rows = [];
		let first = true;
		node.forEach((rowNode)=>{
			let isHeader = false;
			const cellsThisRow = [];
			rowNode.forEach((cellNode)=>{
				if(cellNode.type === schema.nodes.tableHeader) isHeader = true;
				const runs = [];
				cellNode.forEach((p)=>{ runs.push(...pmInlineToRuns(p)); });
				cellsThisRow.push(runs);
			});
			if(first && isHeader){ headers.push(...cellsThisRow); first = false; } else { rows.push(cellsThisRow); first = false; }
		});
		return { type: 'table', headers, rows };
	},

	exportMarkdown : (n)=>{
		const lines = [];
		const cols = (n.headers && n.headers.length) || (n.rows && n.rows[0] && n.rows[0].length) || 0;
		if(n.headers && n.headers.length){
			lines.push(`| ${n.headers.map(runsToMarkdown).join(' | ')} |`);
			lines.push(`| ${Array(cols).fill('---').join(' | ')} |`);
		}
		(n.rows || []).forEach((row)=>{
			lines.push(`| ${row.map(runsToMarkdown).join(' | ')} |`);
		});
		return lines.join('\n');
	},

	importPriority : 65,
	importMarkdown : (lines, i)=>{
		const head = lines[i] || '';
		if(!/^\s*\|.*\|\s*$/.test(head)) return null;
		const sep  = lines[i + 1] || '';
		if(!/^\s*\|\s*:?-{3,}:?(\s*\|\s*:?-{3,}:?)*\s*\|\s*$/.test(sep)) return null;
		const splitRow = (line)=>line
			.replace(/^\s*\|/, '')
			.replace(/\|\s*$/, '')
			.split('|')
			.map((cell)=>[{ text: cell.trim() }]);
		const headers = splitRow(head);
		const rows = [];
		let j = i + 2;
		while (j < lines.length && /^\s*\|.*\|\s*$/.test(lines[j])){
			rows.push(splitRow(lines[j]));
			j++;
		}
		return { node: { type: 'table', headers, rows }, advance: j - i };
	},

	slashItems : [{
		id       : 'table',
		label    : 'Table',
		category : 'Tables',
		icon     : 'Table',
		keywords : 'table grid data',
		make     : (schema)=>{
			const cell = ()=>schema.nodes.tableCell.create(null, schema.nodes.paragraph.create());
			const headerCell = ()=>schema.nodes.tableHeader.create(null, schema.nodes.paragraph.create());
			const headRow = schema.nodes.tableRow.create(null, [headerCell(), headerCell()]);
			const bodyRow = schema.nodes.tableRow.create(null, [cell(), cell()]);
			return schema.nodes.table.create(null, [headRow, bodyRow]);
		},
	}],
};
