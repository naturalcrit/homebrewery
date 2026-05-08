import React from 'react';

export default {
	type         : 'columnBreak',
	label        : 'Column Break',
	category     : 'Layout',
	icon         : 'Columns2',
	slashAliases : ['column', 'break', 'columnbreak'],

	createAst   : ()=>({ type: 'columnBreak' }),
	validateAst : ()=>[],

	pmNode : {
		kind : 'atom',
		spec : {
			group    : 'block',
			atom     : true,
			parseDOM : [{ tag: 'div.columnBreak' }],
			toDOM    : ()=>['div', { class: 'columnBreak' }],
		},
	},

	Render : ()=><div className='columnBreak' />,

	astToPm : (_block, schema)=>schema.nodes.columnBreak.create(),
	pmToAst : ()=>({ type: 'columnBreak' }),

	exportMarkdown : ()=>'\\column',
	importPriority : 50,
	importMarkdown : (lines, i)=>(/^\\column\s*$/.test(lines[i] || '')
		? { node: { type: 'columnBreak' }, advance: 1 }
		: null),
};
