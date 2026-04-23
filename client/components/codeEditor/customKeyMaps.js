/* eslint max-lines: ["error", { "max": 300 }] */
import { keymap } from '@codemirror/view';
import { undo, redo, indentMore, deleteLine } from '@codemirror/commands';
import { Prec } from '@codemirror/state';

const indentLess = (view)=>{
	const { from, to } = view.state.selection.main;
	const lines = [];
	for (let l = view.state.doc.lineAt(from).number; l <= view.state.doc.lineAt(to).number; l++) {
		const line = view.state.doc.line(l);
		const match = line.text.match(/^ {1,2}/); // match up to 2 spaces
		if(match) {
			lines.push({ from: line.from, to: line.from + match[0].length, insert: '' });
		}
	}
	if(lines.length > 0) view.dispatch({ changes: lines });
	return true;
};

const makeBold = (view)=>{
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to);

	let text, cursor;

	if(from === to) {
		text = '****';
		cursor = from + 2;
	} else if(selected.startsWith('**') && selected.endsWith('**')) {
		text = selected.slice(2, -2);
		cursor = from + text.length;
	} else {
		text = `**${selected}**`;
		cursor = from + text.length;
	}

	view.dispatch({
		changes   : { from, to, insert: text },
		selection : { anchor: cursor },
	});

	return true;
};

const makeItalic = (view)=>{
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to);

	let text, cursor;

	if(from === to) {
		text = '**';
		cursor = from + 1;
	} else if(selected.startsWith('*') && selected.endsWith('*')) {
		text = selected.slice(2, -2);
		cursor = from + text.length;
	} else {
		text = `*${selected}*`;
		cursor = from + text.length;
	}

	view.dispatch({
		changes   : { from, to, insert: text },
		selection : { anchor: cursor },
	});

	return true;
};

const makeUnderline = (view)=>{
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to);

	let text, cursor;

	if(from === to) {
		text = '<u></u>';
		cursor = from + 3;
	} else if(selected.startsWith('<u>') && selected.endsWith('</u>')) {
		text = selected.slice(3, -4);
		cursor = from + text.length;
	} else {
		text = `<u>${selected}</u>`;
		cursor = from + text.length;
	}

	view.dispatch({
		changes   : { from, to, insert: text },
		selection : { anchor: cursor },
	});

	return true;
};
const makeSuper = (view)=>{
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to);

	let text, cursor;

	if(from === to) {
		text = '^^';
		cursor = from + 1;
	} else if(selected.startsWith('^') && selected.endsWith('^')) {
		text = selected.slice(1, -1);
		cursor = from + text.length;
	} else {
		text = `^${selected}^`;
		cursor = from + text.length;
	}

	view.dispatch({
		changes   : { from, to, insert: text },
		selection : { anchor: cursor },
	});

	return true;
};

const makeSub = (view)=>{
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to);

	let text, cursor;

	if(from === to) {
		text = '^^^^';
		cursor = from + 2;
	} else if(selected.startsWith('^^') && selected.endsWith('^^')) {
		text = selected.slice(2, -2);
		cursor = from + text.length;
	} else {
		text = `^^${selected}^^`;
		cursor = from + text.length;
	}

	view.dispatch({
		changes   : { from, to, insert: text },
		selection : { anchor: cursor },
	});

	return true;
};

const makeNbsp = (view) => {
  const { from } = view.state.selection.main;

  const prev2 = from >= 2
    ? view.state.doc.sliceString(from - 2, from)
    : '';

  const insert = (prev2 === ':>' || prev2 === '>>') ? '>' : ':>';

  view.dispatch({
    changes: { from, to: from, insert },
    selection: { anchor: from + insert.length },
  });

  return true;
};

const makeSpace = (view)=>{
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to);
	const match = selected.match(/^{{width:(\d+)% }}$/);
	let newText = '{{width:10% }}';
	if(match) {
		const percent = Math.min(parseInt(match[1], 10) + 10, 100);
		newText = `{{width:${percent}% }}`;
	}
	view.dispatch({ changes: { from, to, insert: newText } });
	return true;
};

const removeSpace = (view)=>{
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to);
	const match = selected.match(/^{{width:(\d+)% }}$/);
	if(match) {
		const percent = parseInt(match[1], 10) - 10;
		const newText = percent > 0 ? `{{width:${percent}% }}` : '';
		view.dispatch({ changes: { from, to, insert: newText } });
	}
	return true;
};

const makeSpan = (view)=>{
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to);
	const text = selected.startsWith('{{') && selected.endsWith('}}')
		? selected.slice(2, -2)
		: `{{${selected}}}`;
	view.dispatch({ changes: { from, to, insert: text } });
	return true;
};

const makeDiv = (view)=>{
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to);
	const text = selected.startsWith('{{') && selected.endsWith('}}')
		? selected.slice(2, -2)
		: `{{\n${selected}\n}}`;
	view.dispatch({ changes: { from, to, insert: text } });
	return true;
};

const makeComment = (view)=>{
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to);
	const isHtmlComment = selected.startsWith('<!--') && selected.endsWith('-->');
	const text = isHtmlComment
		? selected.slice(4, -3)
		: `<!-- ${selected} -->`;
	view.dispatch({ changes: { from, to, insert: text } });
	return true;
};

const makeLink = (view)=>{
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to).trim();
	const isLink = /^\[(.*)\]\((.*)\)$/.exec(selected);
	const text = isLink ? `${isLink[1]} ${isLink[2]}` : `[${selected || 'alt text'}](url)`;
	view.dispatch({ changes: { from, to, insert: text } });
	return true;
};

const makeList = (type)=>(view)=>{
	const { from, to } = view.state.selection.main;
	const lines = [];
	for (let l = from; l <= to; l++) {
		const lineText = view.state.doc.line(l + 1).text;
		lines.push(lineText);
	}
	const joined = lines.join('\n');
	let newText;
	if(type === 'UL') newText = joined.replace(/^/gm, '- ');
	else newText = joined.replace(/^/gm, (m, i)=>`${i + 1}. `);
	view.dispatch({ changes: { from, to, insert: newText } });
	return true;
};

const makeHeader = (level)=>(view)=>{
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to);
	const text = `${'#'.repeat(level)} ${selected}`;
	view.dispatch({ changes: { from, to, insert: text } });
	return true;
};

const newColumn = (view)=>{
	const { from, to } = view.state.selection.main;
	view.dispatch({ changes: { from, to, insert: '\n\\column\n\n' } });
	return true;
};

const newPage = (view)=>{
	const { from, to } = view.state.selection.main;
	view.dispatch({ changes: { from, to, insert: '\n\\page\n\n' } });
	return true;
};

export const generalKeymap = Prec.high(keymap.of([
	{ key: 'Tab', run: indentMore },
	{ key: 'Mod-z', run: undo }, //i think it may be unnecessary
	{ key: 'Mod-Shift-z', run: redo },
	{ key: 'Mod-y', run: redo },
	{ key: 'Mod-d', run: deleteLine },
]));

export const markdownKeymap = Prec.highest(keymap.of([
	//{ key: 'Shift-Tab', run: indentMore },
	{ key: 'Shift-Tab', run: indentLess },
	{ key: 'Mod-b', run: makeBold },
	{ key: 'Mod-i', run: makeItalic },
	{ key: 'Mod-u', run: makeUnderline },
	{ key: 'Shift-Mod-=', run: makeSuper },
	{ key: 'Mod-=', run: makeSub },
	{ key: 'Mod-.', run: makeNbsp },
	{ key: 'Shift-Mod-.', run: makeSpace },
	{ key: 'Shift-Mod-,', run: removeSpace },
	{ key: 'Mod-m', run: makeSpan },
	{ key: 'Shift-Mod-m', run: makeDiv },
	{ key: 'Mod-/', run: makeComment },
	{ key: 'Mod-k', run: makeLink },
	{ key: 'Mod-l', run: makeList('UL') },
	{ key: 'Shift-Mod-l', run: makeList('OL') },
	{ key: 'Shift-Mod-1', run: makeHeader(1) },
	{ key: 'Shift-Mod-2', run: makeHeader(2) },
	{ key: 'Shift-Mod-3', run: makeHeader(3) },
	{ key: 'Shift-Mod-4', run: makeHeader(4) },
	{ key: 'Shift-Mod-5', run: makeHeader(5) },
	{ key: 'Shift-Mod-6', run: makeHeader(6) },
	{ key: 'Shift-Mod-Enter', run: newColumn },
	{ key: 'Mod-Enter', run: newPage },
]));
