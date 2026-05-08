// Keymap + commands for the reborn editor.
//
// - History: Mod-z / Mod-Shift-z / Mod-y
// - Marks:   Mod-b/i/u
// - Lists:   Enter splits items, Tab/Shift-Tab sinks/lifts
// - Cmd-A:   selection escalation (inline -> block -> doc)
// - baseKeymap on top.

import { keymap } from 'prosemirror-keymap';
import { history, undo, redo } from 'prosemirror-history';
import {
	baseKeymap,
	chainCommands,
	toggleMark,
	wrapIn,
	setBlockType,
} from 'prosemirror-commands';
import {
	splitListItem,
	liftListItem,
	sinkListItem,
} from 'prosemirror-schema-list';
import { TextSelection, Selection, AllSelection, NodeSelection } from 'prosemirror-state';
import { schema } from './schema.js';

// ---- selection escalation -------------------------------------------------

// Cmd-A grows the selection in three steps:
//   1) inline run -> entire current block
//   2) block      -> entire document
// Once at AllSelection it stays there (AllSelection is the doc-wide select-all).
function selectAllEscalating(state, dispatch){
	const { selection } = state;
	if(selection instanceof AllSelection){
		// Already at doc-wide; nothing to escalate.
		return false;
	}
	// Determine the enclosing block of the cursor / selection.
	const { $from, $to } = selection;
	// Find the nearest block depth.
	let depth = $from.depth;
	while (depth > 0 && !$from.node(depth).isBlock) depth--;
	// If we're a NodeSelection on a block already, jump to AllSelection.
	if(selection instanceof NodeSelection){
		if(dispatch){
			dispatch(state.tr.setSelection(new AllSelection(state.doc)));
		}
		return true;
	}
	// If selection already covers the entire current block, escalate to doc.
	if(depth > 0){
		const blockStart = $from.start(depth);
		const blockEnd   = $from.end(depth);
		if(selection.from <= blockStart && selection.to >= blockEnd){
			if(dispatch){
				dispatch(state.tr.setSelection(new AllSelection(state.doc)));
			}
			return true;
		}
	}
	// Otherwise: select the current block.
	if(depth > 0){
		const blockStart = $from.start(depth);
		const blockEnd   = $to.end(depth);
		if(dispatch){
			const tr = state.tr.setSelection(TextSelection.create(state.doc, blockStart, blockEnd));
			dispatch(tr);
		}
		return true;
	}
	// Fallback: select all.
	if(dispatch) dispatch(state.tr.setSelection(new AllSelection(state.doc)));
	return true;
}

// Heading toggle: Mod-Alt-1 .. Mod-Alt-5 cycle through heading levels;
// Mod-Alt-0 -> paragraph.
function setHeading(level){
	return setBlockType(schema.nodes.heading, { level });
}

// Wrap as note callout / blockquote shortcuts (handy for Wave 8 audit).
const wrapInNote = (state, dispatch)=>{
	// Wrap empty paragraph in a note. Implemented as: replace with note containing
	// title and the paragraph.
	const { $from } = state.selection;
	if($from.parent.type !== schema.nodes.paragraph) return false;
	const noteTitle = schema.nodes.noteTitle.create(null, schema.text('Note'));
	const para = $from.parent.copy($from.parent.content);
	const note = schema.nodes.note.create(null, [noteTitle, para]);
	if(dispatch){
		const tr = state.tr.replaceWith($from.before(), $from.after(), note);
		dispatch(tr);
	}
	return true;
};

export function buildKeymap(){
	return [
		history(),
		keymap({
			'Mod-z'       : undo,
			'Mod-y'       : redo,
			'Mod-Shift-z' : redo,

			'Mod-b' : toggleMark(schema.marks.strong),
			'Mod-B' : toggleMark(schema.marks.strong),
			'Mod-i' : toggleMark(schema.marks.em),
			'Mod-I' : toggleMark(schema.marks.em),
			'Mod-u' : toggleMark(schema.marks.underline),
			'Mod-U' : toggleMark(schema.marks.underline),

			'Mod-a' : selectAllEscalating,

			'Enter' : chainCommands(
				splitListItem(schema.nodes.list_item),
				baseKeymap.Enter,
			),
			'Tab'       : sinkListItem(schema.nodes.list_item),
			'Shift-Tab' : liftListItem(schema.nodes.list_item),

			'Mod-Alt-0' : setBlockType(schema.nodes.paragraph),
			'Mod-Alt-1' : setHeading(1),
			'Mod-Alt-2' : setHeading(2),
			'Mod-Alt-3' : setHeading(3),
			'Mod-Alt-4' : setHeading(4),
			'Mod-Alt-5' : setHeading(5),

			'Mod-Shift-9' : wrapIn(schema.nodes.blockquote),
			'Mod-Shift-n' : wrapInNote,
		}),
		keymap(baseKeymap),
	];
}

// Programmatic command exports for tests.
export const commands = {
	selectAllEscalating,
	setHeading,
	wrapInNote,
	undo,
	redo,
	toggleStrong    : toggleMark(schema.marks.strong),
	toggleEm        : toggleMark(schema.marks.em),
	toggleUnderline : toggleMark(schema.marks.underline),
};

export { Selection, TextSelection, AllSelection, NodeSelection };
