import './codeEditor.less';
import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Compartment, EditorSelection, EditorState } from '@codemirror/state';
import { EditorView, keymap, highlightActiveLine, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { history, historyKeymap, undo as historyUndo, redo as historyRedo, undoDepth, redoDepth } from '@codemirror/history';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultHighlightStyle } from '@codemirror/language';
import { syntaxHighlighting } from '@codemirror/language';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';

const baseExtensions = [
	lineNumbers(),
	highlightActiveLineGutter(),
	EditorView.lineWrapping,
	history(),
	keymap.of([
		indentWithTab,
		...closeBracketsKeymap,
		...searchKeymap,
		...historyKeymap,
		...defaultKeymap
	]),
	closeBrackets(),
	highlightSelectionMatches(),
	highlightActiveLine(),
	syntaxHighlighting(defaultHighlightStyle, { fallback: true })
];

const languageExtension = (language)=>{
	switch(language){
	case 'css':
		return css();
	case 'javascript':
		return javascript({ jsx: true, typescript: true });
	case 'gfm':
	default:
		return markdown({ base: markdownLanguage, codeLanguages: languages });
	}
};

const CodeEditorV6 = React.forwardRef(({
	value = '',
	onChange = ()=>{},
	language = 'gfm',
	readOnly = false,
	style = {},
	editorTheme,
	onSelectionChange = ()=>{},
	onScroll = ()=>{}
}, ref)=>{
	const containerRef = useRef(null);
	const viewRef = useRef(null);
	const languageCompartment = useMemo(()=>new Compartment(), []);
	const readOnlyCompartment = useMemo(()=>new Compartment(), []);

	useImperativeHandle(ref, ()=>({
		focus : ()=>viewRef.current?.focus(),
		getView : ()=>viewRef.current,
		getCM6View : ()=>viewRef.current,
		getCursorPosition : ()=>{
			const view = viewRef.current;
			if(!view) return { line: 0, ch: 0 };
			const { head } = view.state.selection.main;
			const lineInfo = view.state.doc.lineAt(head);
			return { line: lineInfo.number - 1, ch: head - lineInfo.from };
		},
		setCursorPosition : ({ line = 0, ch = 0 })=>{
			const view = viewRef.current;
			if(!view) return;
			const docLine = view.state.doc.line(Math.max(1, line + 1));
			const pos = Math.min(docLine.from + ch, docLine.to);
			view.dispatch({ selection: EditorSelection.cursor(pos), scrollIntoView: true });
		},
		getTopVisibleLine : ()=>{
			const view = viewRef.current;
			if(!view) return 0;
			const top = view.scrollDOM.scrollTop;
			const block = view.lineBlockAtHeight(top);
			const lineInfo = view.state.doc.lineAt(block.from);
			return lineInfo.number - 1;
		},
		updateSize : ()=>viewRef.current?.requestMeasure(),
		injectText : (text, overwrite=true)=>{
			const view = viewRef.current;
			if(!view) return;
			const { from, to } = view.state.selection.main;
			const insertFrom = overwrite ? from : from;
			const insertTo = overwrite ? to : from;
			view.dispatch({
				changes   : { from: insertFrom, to: insertTo, insert: text },
				selection : EditorSelection.cursor(insertFrom + text.length),
				scrollIntoView : true
			});
			view.focus();
		},
		undo : ()=>{
			const view = viewRef.current;
			if(!view) return;
			historyUndo(view);
		},
		redo : ()=>{
			const view = viewRef.current;
			if(!view) return;
			historyRedo(view);
		},
		historySize : ()=>{
			const view = viewRef.current;
			if(!view) return { undo: 0, redo: 0 };
			return {
				undo : undoDepth(view.state),
				redo : redoDepth(view.state)
			};
		},
		foldAllCode : ()=>{},
		unfoldAllCode : ()=>{}
	}), []);

	useEffect(()=>{
		if(!containerRef.current) return;

		const initialExtensions = [
			...baseExtensions,
			languageCompartment.of(languageExtension(language)),
			readOnlyCompartment.of(EditorState.readOnly.of(readOnly)),
			EditorView.updateListener.of((update)=>{
				if(update.docChanged) onChange(update.state.doc.toString());
				if(update.selectionSet) onSelectionChange(update.view);
			})
		];

		const state = EditorState.create({
			doc        : value,
			extensions : initialExtensions
		});

		const view = new EditorView({
			state,
			parent : containerRef.current
		});
		viewRef.current = view;

		const handleScroll = ()=>onScroll(view);
		view.scrollDOM.addEventListener('scroll', handleScroll);

		return ()=>{
			view.scrollDOM.removeEventListener('scroll', handleScroll);
			view.destroy();
			viewRef.current = null;
		};
	}, []);

	useEffect(()=>{
		const view = viewRef.current;
		if(!view) return;
		view.dispatch({
			effects : languageCompartment.reconfigure(languageExtension(language))
		});
	}, [language, languageCompartment]);

	useEffect(()=>{
		const view = viewRef.current;
		if(!view) return;
		view.dispatch({
			effects : readOnlyCompartment.reconfigure(EditorState.readOnly.of(readOnly))
		});
	}, [readOnly, readOnlyCompartment]);

	useEffect(()=>{
		const view = viewRef.current;
		if(!view) return;
		const currentValue = view.state.doc.toString();
		if(value === currentValue) return;
		const transaction = view.state.update({
			changes : { from: 0, to: currentValue.length, insert: value }
		});
		view.dispatch(transaction);
	}, [value]);

	return (
		<div className='codeEditor' ref={containerRef} style={style} data-editor='cm6'></div>
	);
});

CodeEditorV6.displayName = 'CodeEditorV6';

export default CodeEditorV6;
