import React from 'react';

// AST type is `hr` (Wave 2 froze that name); PM node name is `horizontalRule`.
// The mismatch is the entire reason `pmName` exists in the manifest contract.

export default {
	type         : 'hr',
	pmName       : 'horizontalRule',
	label        : 'Horizontal Rule',
	category     : 'Layout',
	icon         : 'Minus',
	slashAliases : ['hr', 'rule', 'divider', 'separator'],

	createAst   : ()=>({ type: 'hr' }),
	validateAst : ()=>[],

	pmNode : {
		kind : 'standard',
		spec : {
			group    : 'block',
			parseDOM : [{ tag: 'hr' }],
			toDOM    : ()=>['hr'],
		},
	},

	Render : ()=><hr />,

	astToPm : (_block, schema)=>schema.nodes.horizontalRule.create(),
	pmToAst : ()=>({ type: 'hr' }),

	exportMarkdown : ()=>'---',
	importPriority : 60,
	importMarkdown : (lines, i)=>{
		if(/^\s*(?:---+|\*\*\*+|___+)\s*$/.test(lines[i] || '')){
			return { node: { type: 'hr' }, advance: 1 };
		}
		return null;
	},
};
