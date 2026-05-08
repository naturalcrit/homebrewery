// Markdown-style input rules.
//
//   `# `   -> h1, `## ` -> h2, ... `##### ` -> h5
//   `* ` or `- ` -> bullet list
//   `1. ` -> ordered list
//   `> ` -> blockquote
//   `--- ` -> horizontal rule

import {
	inputRules,
	textblockTypeInputRule,
	wrappingInputRule,
	InputRule,
} from 'prosemirror-inputrules';
import { schema } from './schema.js';

function hrRule(){
	return new InputRule(/^(?:---|—-|___\s|\*\*\*\s)$/, (state, _match, start, end)=>{
		const tr = state.tr;
		tr.delete(start, end);
		tr.replaceSelectionWith(schema.nodes.horizontalRule.create());
		return tr;
	});
}

export function buildInputRules(){
	return inputRules({
		rules : [
			textblockTypeInputRule(/^(#{1,5})\s$/, schema.nodes.heading, (m)=>({ level: m[1].length })),
			wrappingInputRule(/^\s*([-+*])\s$/, schema.nodes.bullet_list),
			wrappingInputRule(/^(\d+)\.\s$/, schema.nodes.ordered_list),
			wrappingInputRule(/^\s*>\s$/, schema.nodes.blockquote),
			hrRule(),
		],
	});
}
