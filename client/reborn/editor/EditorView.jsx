// React wrapper that owns the lifecycle of a ProseMirror EditorView.
//
// Mounts a single PM editor over the AST. Emits the same .brewRenderer /
// .pages / .page DOM the read-only renderer produces, but contentEditable —
// the contenteditable region IS the editor and the page-shell DOM lives just
// outside it.
//
// Wave 5 paginator integration — Approach A (deferred):
// The read-only `BrewRenderer` runs every block through the real paginator.
// The PM editor does NOT, in Wave 5, carve PM into per-page editors. PM
// owns its own DOM and splitting the doc into multiple `.page` divs without
// breaking PM's transaction model is a non-trivial refactor (it requires
// either NodeView page wrappers or a proper PM page plugin). We picked
// approach A from plan.md: keep PM as a single contentEditable region,
// painted into one `.page` div. The author still sees correct typography,
// drop caps, two-column flow, stat-block frames, etc. — they only see one
// page at a time. This matches the canonical Homebrewery editor's behavior
// of editing one page (or one column) at a time.
//
// Limitation flagged for Wave 6/7: when a PM document grows past one
// page's worth of content, the overflow is clipped (canonical .page sets
// `overflow: clip`). The fix is a PM-aware paginator: either pageBreak
// NodeViews that mark page boundaries inside PM, or a sibling plugin that
// monitors content and shifts overflow into a sibling .page below.
// Authors who need to scroll today can switch to read-only via
// `?view=read`, where Wave 5's paginator runs the full multi-page split.

import React, { useEffect, useRef } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView as PMEditorView } from 'prosemirror-view';
import { schema } from './schema.js';
import { astToPmDoc, pmDocToAst } from './convert.js';
import { buildKeymap } from './keymap.js';
import { buildInputRules } from './inputRules.js';
import { slashCommandPlugin } from './slashPlugin.js';
import { nodeViewFactories } from '../blocks/registry.js';

export function makePmState(documentAst){
	const doc = astToPmDoc(documentAst);
	return EditorState.create({
		doc,
		schema,
		plugins : [
			buildInputRules(),
			...buildKeymap(),
			slashCommandPlugin(),
		],
	});
}

export default function RebornEditor({ document: ast, onChange }) {
	const hostRef = useRef(null);
	const viewRef = useRef(null);

	useEffect(()=>{
		if(!hostRef.current) return undefined;
		// PM mounts its `.ProseMirror` element directly as a child of the
		// host. We mount it as a child of the .page itself (via the host
		// element, which we configure as the .page below) so that the
		// canonical column-count: 2 / footer ornament / drop-cap rules all
		// fire on the same element they expect to.
		const state = makePmState(ast);
		const view = new PMEditorView(
			// custom mount: replace the placeholder child of host with the PM editor.
			(editorElt)=>{ hostRef.current.appendChild(editorElt); editorElt.classList.add('reborn-pm-content'); },
			{
				state,
				nodeViews : nodeViewFactories,
				dispatchTransaction(tr){
					const next = view.state.apply(tr);
					view.updateState(next);
					if(tr.docChanged && onChange){
						onChange(pmDocToAst(next.doc, ast.metadata || {}));
					}
				},
			},
		);
		viewRef.current = view;
		return ()=>{
			view.destroy();
			viewRef.current = null;
		};
	// We deliberately ignore subsequent ast prop changes; PM owns state after
	// construction. Higher-level "load a different document" should remount.
	}, []);

	// The .page itself acts as the editor's host. PM appends its
	// contenteditable wrapper as a sibling of the page-number node; the page's
	// column layout flows through PM's blocks just as it flows through the
	// read-only renderer's blocks. Wave 5 will replace this with a real
	// per-page paginator.
	return (
		<div className='brewRenderer'>
			<div className='pages'>
				<div className='page' id='p1' ref={hostRef}>
					<div className='pageNumber'>1</div>
				</div>
			</div>
		</div>
	);
}

// Test-friendly headless construction. Returns { state, view? } where `view`
// is built only if a host element is provided. Useful for jsdom tests that
// want to dispatch transactions without rendering.
export function buildHeadlessEditor(documentAst, host){
	const state = makePmState(documentAst);
	if(!host) return { state, view: null };
	const view = new PMEditorView(host, { state });
	return { state: view.state, view };
}
