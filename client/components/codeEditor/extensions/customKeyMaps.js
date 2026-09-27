/* eslint max-lines: ["error", { "max": 400 }] */
import { keymap } from '@codemirror/view';
import { undo, redo, indentMore, indentLess, deleteLine } from '@codemirror/commands';
import { EditorSelection } from '@codemirror/state';
import { Prec } from '@codemirror/state';
import * as prettier from 'prettier/standalone';
import * as postcssPlugin from 'prettier/plugins/postcss';

export async function formatCSS(view) {
	try {
		const { from, to, empty } = view.state.selection.main;
		const fullDoc = view.state.doc.toString();
		const selection = view.state.doc.sliceString(from, to);
		const code = empty ? fullDoc : selection;

		let formatted = await prettier.format(code, {
			parser  : 'css',
			plugins : [postcssPlugin],

			// formatting options
			tabWidth       : 2,
			useTabs        : false,
			printWidth     : 100,
			singleQuote    : false,
			trailingComma  : 'all',
			bracketSpacing : true,
			endOfLine      : 'lf'
		});

		//format manually single declaration rules to span one line.
		//Prettier can't do it by default, this is crude but it works
		formatted = formatted.replace(
			/([^{]+)\{\s*\n\s*([^;\n]+:[^;\n]+;)\s*\n\s*\}(\s*)/g,
			(_, selector, decl, whitespace)=>`${selector} { ${decl.trim()} }${whitespace}`
		);
		if(formatted === code) return true;

		const dom = view.dom;
		dom.classList.add('cm-flash');

		setTimeout(()=>{
			dom.classList.remove('cm-flash');

			view.dispatch({
				changes : {
					from   : empty ? 0 : from,
					to     : empty ? view.state.doc.length : to,
					insert : formatted
				}
			});

		}, 500);
	} catch (err) {
		console.error('Error formatting css: ', err);
	}

	return true;
}

const forEachSelection = (view, fn)=>{
	view.dispatch(view.state.changeByRange((range)=>fn(view.state, range)));
	return true;
};

const insertTab = (view)=>{
	// If any selection spans multiple lines, delegates to CodeMirror's indentMore
 	// Otherwise inserts two spaces at each cursor/selection
	const shouldIndent = view.state.selection.ranges.some((range)=>view.state.doc.lineAt(range.from).number !==
		view.state.doc.lineAt(range.to).number
	);

	if(shouldIndent) return indentMore(view);

	const changes = [];

	for (const range of view.state.selection.ranges) {
		changes.push({
			from   : range.from,
			to     : range.to,
			insert : '  ' // Insert two spaces, not a tab char!
		});
	}
	// Create a transaction so we can map old positions to
	// their new positions after the edits are applied
	const  mappedChanges = view.state.update({ changes });

	view.dispatch({
		changes,
		selection : EditorSelection.create(
			view.state.selection.ranges.map((range)=>EditorSelection.cursor(
				mappedChanges.changes.mapPos(range.from, -1) + 2
			)
			)
		)
	});

	return true;
};

const wrapSelection = (prefix, suffix)=>(view)=>{
	view.dispatch(
		view.state.changeByRange((range)=>{
			const { from, to } = range;
			const noSelection = from === to;

			const doc = view.state.doc;

			if(noSelection) {
				return {
					changes : {
						from,
						to,
						insert : prefix + suffix
					},
					range : EditorSelection.cursor(from + prefix.length)
				};
			}

			const before = doc.sliceString(
				Math.max(0, from),
				from + prefix.length
			);

			const after = doc.sliceString(
				to - suffix.length,
				to
			);
			const alreadyWrapped = before === prefix && after === suffix;
			if(alreadyWrapped) {
				return {
					changes : [
						{
							from   : from,
							to     : from + prefix.length,
							insert : ''
						},
						{
							from   : to - suffix.length,
							to     : to,
							insert : ''
						}
					],
					range : EditorSelection.range(
						from,
						to - prefix.length - suffix.length,
					)
				};
			}

			return {
				changes : {
					from,
					to,
					insert : prefix + doc.sliceString(from, to) + suffix
				},
				range : EditorSelection.range(
					from,
					to + suffix.length + prefix.length
				)
			};
		})
	);

	return true;
};

const makeNbsp = (view)=>forEachSelection(view, (state, range)=>{
	const { from, to } = range;

	const prev2 = from >= 2 ? state.doc.sliceString(from - 2, from)	: '';
	const insert = (prev2 === ':>' || prev2 === '>>') ? '>' : ':>';

	return {
		changes : { from, to, insert },
		range   : EditorSelection.cursor(from + insert.length)
	};
});

const makeSpace = (view)=>forEachSelection(view, (state, range)=>{
	const { from, to } = range;
	const selected = state.doc.sliceString(from, to);
	const match = selected.match(/^{{width:(\d+)% }}$/);

	let insert = '{{width:10% }}';

	if(match) {
		const percent = Math.min(parseInt(match[1], 10) + 10, 100);
		insert = `{{width:${percent}% }}`;
	}

	return {
		changes : { from, to, insert },
		range   : EditorSelection.range(from, from + insert.length)
	};
});

const removeSpace = (view)=>forEachSelection(view, (state, range)=>{
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to);
	const match = selected.match(/^{{width:(\d+)% }}$/);
	if(match) {
		const percent = parseInt(match[1], 10) - 10;
		const newText = percent > 0 ? `{{width:${percent}% }}` : '';
		return { changes: { from, to, insert: newText } };
	}
	return true;
});

const makeLink = (view)=>{
	const ranges = view.state.selection.ranges;

	// Multiple selections: pair them as alt text + URL
	if(ranges.length > 1) {
		const changes = [];

		for (let i = 0; i < ranges.length - 1; i += 2) {
			const alt = view.state.doc.sliceString(
				ranges[i].from,
				ranges[i].to
			).trim();

			const url = view.state.doc.sliceString(
				ranges[i + 1].from,
				ranges[i + 1].to
			).trim();

			changes.push({
				from   : ranges[i].from,
				to     : ranges[i + 1].to,
				insert : `[${alt}](${url})`
			});
		}

		view.dispatch({ changes });
		return true;
	}

	// Single selection: existing behavior
	const { from, to } = view.state.selection.main;
	const selected = view.state.doc.sliceString(from, to).trim();

	const isLink = /^\[(.*)\]\((.*)\)$/.exec(selected);

	let text;

	if(isLink) {
		text = `${isLink[1]} ${isLink[2]}`;
	} else {
		const isUrl =
			/^(https?:\/\/|www\.)\S+$/i.test(selected) ||
			/^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#]\S*)?$/i.test(selected);

		if(isUrl) {
			const url = selected;
			const domain = url
				.replace(/^https?:\/\//i, '')
				.replace(/^www\./i, '')
				.split(/[/?#]/)[0];

			const name = domain.split('.')[0];

			text = `[${name}](${url})`;
		} else {
			text = `[${selected || 'alt text'}](url)`;
		}
	}

	view.dispatch({
		changes : { from, to, insert: text }
	});

	return true;
};

const makeList = (type)=>(view)=>{
	const { from, to } = view.state.selection.main;
	const startLine = view.state.doc.lineAt(from);
	const endLine = view.state.doc.lineAt(to);
	const lines = [];

	for (let lineNo = startLine.number; lineNo <= endLine.number; lineNo++) {
		lines.push(view.state.doc.line(lineNo).text);
	}
	const joined = lines.join('\n');

	const newText = type === 'UL'
		? joined.replace(/^/gm, '- ')
		: joined.replace(/^/gm, (_, offset)=>{
			const lineNumber = joined.slice(0, offset).split('\n').length;
			return `${lineNumber}. `;
		});

	view.dispatch({
		changes : {
			from   : startLine.from,
			to     : endLine.to,
			insert : newText
		}
	});
	return true;
};

const makeHeader = (level)=>(view)=>forEachSelection(view, (state, range)=>{
	const { from, to } = range;
	const selected = state.doc.sliceString(from, to);
	const insert = `${'#'.repeat(level)} ${selected}`;
	if(selected.length === 0) {
		return { changes: { from, to, insert: insert }, range: EditorSelection.cursor(from + insert.length) };
	} else {
		return { changes: { from, to, insert: insert }, range};
	}
});

const newColumn = (view)=>forEachSelection(view, (state, range)=>{
	const { from, to } = range;
	const insert = '\n\\column\n\n' ;
	return {
		changes   : { from, to, insert },
		range: EditorSelection.cursor(from + insert.length)
	};
});

const newPage = (view)=>forEachSelection(view, (state, range)=>{
	const { from, to } = range;
	const insert = '\n\\page\n\n';

	return {
		changes: { from, to, insert },
		range: EditorSelection.cursor(from + insert.length)
	};
});

export const generalKeymap = Prec.high(keymap.of([
	{ key: 'Tab', run: insertTab }, //runs indentMore if multiple lines selected in a single selection
	{ key: 'Shift-Tab', run: indentLess },
	{ key: 'Mod-z', run: undo }, //it may be unnecessary
	{ key: 'Mod-Shift-z', run: redo },
	{ key: 'Mod-y', run: redo }, //user asked, so double keybind
	{ key: 'Mod-d', run: deleteLine }, //annoyingly overrides "selectNextOccurrence" because users asked
]));

export const cssKeymap = Prec.highest(keymap.of([
	{ key: 'Mod-Shift-f', run: formatCSS },
  	{ key: 'Alt-Shift-f', run: formatCSS },
]));

export const markdownKeymap = Prec.highest(keymap.of([

	{ key: 'Mod-b',           run: wrapSelection('**', '**') },    // makeBold
	{ key: 'Mod-i',           run: wrapSelection('*', '*') },      // makeItalic
	{ key: 'Mod-u',           run: wrapSelection('<u>', '</u>') }, // makeUnderline
	{ key: 'Shift-Mod-=',     run: wrapSelection('^', '^') },      // makeSuper
	{ key: 'Mod-=',           run: wrapSelection('^^', '^^') },    // makeSub
	{ key: 'Mod-.',           run: makeNbsp },
	{ key: 'Shift-Mod-.',     run: makeSpace },
	{ key: 'Shift-Mod-,',     run: removeSpace },
	{ key: 'Mod-m',           run: wrapSelection('{{', '}}') },
	{ key: 'Shift-Mod-m',     run: wrapSelection('{{\n', '\n}}') },
	{ key: 'Mod-/',           run: wrapSelection('<!-- ', ' -->') },
	{ key: 'Mod-k',           run: makeLink },
	{ key: 'Mod-Shift-u',     run: makeList('UL') },
	{ key: 'Mod-Shift-o',     run: makeList('OL') },
	{ key: 'Shift-Mod-1',     run: makeHeader(1) },
	{ key: 'Shift-Mod-2',     run: makeHeader(2) },
	{ key: 'Shift-Mod-3',     run: makeHeader(3) },
	{ key: 'Shift-Mod-4',     run: makeHeader(4) },
	{ key: 'Shift-Mod-5',     run: makeHeader(5) },
	{ key: 'Shift-Mod-6',     run: makeHeader(6) },
	{ key: 'Mod-Enter',       run: newPage },
	{ key: 'Shift-Mod-Enter', run: newColumn },
]));
