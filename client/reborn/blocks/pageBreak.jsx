import React from 'react';

export default {
	type         : 'pageBreak',
	label        : 'Page Break',
	category     : 'Layout',
	icon         : 'FileText',
	slashAliases : ['page', 'break', 'pagebreak'],

	createAst   : ()=>({ type: 'pageBreak' }),
	validateAst : ()=>[],

	pmNode : {
		kind : 'atom',
		spec : {
			group    : 'block',
			atom     : true,
			parseDOM : [{ tag: 'div.pageBreak' }],
			toDOM    : ()=>['div', { class: 'pageBreak' }],
		},
	},

	Render : ()=><div className='pageBreak' />,

	astToPm : (_block, schema)=>schema.nodes.pageBreak.create(),
	pmToAst : ()=>({ type: 'pageBreak' }),

	exportMarkdown : ()=>'\\page',
	importPriority : 50,
	importMarkdown : (lines, i)=>(/^\\page\s*$/.test(lines[i] || '')
		? { node: { type: 'pageBreak' }, advance: 1 }
		: null),
};
