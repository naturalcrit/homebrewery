import { HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const customTags = {
	pageLine    : 'pageLine', // .cm-pageLine
	snippetLine : 'snippetLine', // .cm-snippetLine
};

export function legacyTokenizeCustomMarkdown(text) {
	const tokens = [];
	const lines = text.split('\n');

	lines.forEach((lineText, lineNumber)=>{
		// --- Page / snippet lines ---
		if(/^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m.test(lineText)) tokens.push({ line: lineNumber, type: customTags.pageLine });
		if(/^\\snippet\ .*$/.test(lineText)) tokens.push({ line: lineNumber, type: customTags.snippetLine });
	});

	return tokens;
}

export const legacyCustomHighlightStyle = HighlightStyle.define([
	{ tag: tags.heading,  class: 'cm-header' },
	{ tag: tags.heading1,  class: 'cm-header cm-header-1' },
	{ tag: tags.heading2,  class: 'cm-header cm-header-2' },
	{ tag: tags.heading3,  class: 'cm-header cm-header-3' },
	{ tag: tags.heading4,  class: 'cm-header cm-header-4' },
	{ tag: tags.heading5,  class: 'cm-header cm-header-5' },
	{ tag: tags.heading6,  class: 'cm-header cm-header-6' },
	{ tag: tags.link,  class: 'cm-link' },
	{ tag: tags.string,  class: 'cm-string' },
	{ tag: tags.url,  class: 'cm-string cm-url' },
	{ tag: tags.list,  class: 'cm-list' },
	{ tag: tags.strong,  class: 'cm-strong' },
	{ tag: tags.emphasis,  class: 'cm-em' },
	{ tag: tags.quote,  class: 'cm-quote' },

	//css tags

	{ tag: tags.tagName,  class: 'cm-tag' },
	{ tag: tags.className,  class: 'cm-class' },
	{ tag: tags.propertyName,  class: 'cm-property' },
	{ tag: tags.attributeValue,  class: 'cm-value' },
	{ tag: tags.keyword,  class: 'cm-keyword' },
	{ tag: tags.atom,  class: 'cm-atom' },
	{ tag: tags.integer,  class: 'cm-integer' },
	{ tag: tags.unit,  class: 'cm-unit' },
	{ tag: tags.color,  class: 'cm-color' },
	{ tag: tags.paren,  class: 'cm-paren' },
	{ tag: tags.variableName,  class: 'cm-variable' },
	{ tag: tags.invalid,  class: 'cm-error' },
	{ tag: tags.comment,  class: 'cm-comment' },
]);

