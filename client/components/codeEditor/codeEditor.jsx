/* eslint max-lines: ["error", { "max": 400 }] */
import './codeEditor.less';
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

import {
	EditorView,
	keymap,
	lineNumbers,
	highlightActiveLineGutter,
	highlightActiveLine,
	scrollPastEnd,
	Decoration,
	ViewPlugin,
	WidgetType,
	drawSelection,
	dropCursor,
} from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { foldAll as foldAllCmd, unfoldAll as unfoldAllCmd, foldGutter, foldKeymap, syntaxHighlighting } from '@codemirror/language';
import { defaultKeymap, history, undo, redo, undoDepth, redoDepth } from '@codemirror/commands';
import { languages } from '@codemirror/language-data';
import { css, cssLanguage } from '@codemirror/lang-css';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { autocompleteEmoji } from './autocompleteEmoji.js';
import { searchKeymap, search } from '@codemirror/search';
import { closeBrackets } from '@codemirror/autocomplete';

const customClose = closeBrackets({ brackets: ['()', '[]', '{{}}'] });

import * as themesImport from '@uiw/codemirror-themes-all';
import defaultCM5Theme from '@themes/codeMirror/default.js';
import darkbrewery from '@themes/codeMirror/darkbrewery.js';

const themes = { default: defaultCM5Theme, darkbrewery, ...themesImport };
const themeCompartment = new Compartment();
const highlightCompartment = new Compartment();

import customKeymap from './customKeyMap.js';
import pageFoldExtension from './customFolding.js';
import { customHighlightStyle, tokenizeCustomMarkdown, tokenizeCustomCSS } from './customHighlight.js';
import { legacyCustomHighlightStyle, legacyTokenizeCustomMarkdown } from './legacyCustomHighlight.js';

const createHighlightPlugin = (renderer, tab)=>{
	//this function takes the custom tokens created in the tokenize function in customhighlight files
	//takes the tokens defined by that function and assigns classes to them
	//it also creates page number and snippet number widgets

	let tokenize;

	if(tab === 'brewStyles') {
		tokenize = tokenizeCustomCSS;
	} else {
		tokenize = renderer === 'V3' ? tokenizeCustomMarkdown : legacyTokenizeCustomMarkdown;
	}

	return ViewPlugin.fromClass(
		class {
			constructor(view) {
				this.decorations = this.buildDecorations(view);
			}
			update(update) {
				if(update.docChanged) {
					this.decorations = this.buildDecorations(update.view);
				}
			}
			buildDecorations(view) {
				const decos = [];
				const tokens = tokenize(view.state.doc.toString());
				let pageCount = 1;
				let snippetCount = 0;

				tokens.forEach((tok)=>{
					const line = view.state.doc.line(tok.line + 1);

					if(tok.from != null && tok.to != null && tok.from < tok.to) {
						decos.push(Decoration.mark({ class: `cm-${tok.type}` }).range(line.from + tok.from, line.from + tok.to));
					} else {
						decos.push(Decoration.line({ class: `cm-${tok.type}` }).range(line.from));
						if(tok.type === 'pageLine'  && tab === 'brewText') {
							pageCount++;
							line.from === 0 && pageCount--;
							decos.push(Decoration.line({ attributes: { 'data-page-number': pageCount } }).range(line.from));
						}
						if(tok.type === 'snippetLine' && tab === 'brewSnippets') {
							snippetCount++;
							decos.push(Decoration.line({ attributes: { 'data-page-number': pageCount } }).range(line.from));
						}
					}
				});

				decos.sort((a, b)=>a.from - b.from || a.to - b.to);
				return Decoration.set(decos);
			}
		},
		{ decorations: (v)=>v.decorations }
	);
};

const CodeEditor = forwardRef(
	(
		{
			value = '',
			onChange = ()=>{},
			onCursorChange = ()=>{},
			onViewChange = ()=>{},
			language = '',
			tab = 'brewText',
			editorTheme = 'default',
			view,
			style,
			renderer,
			...props
		},
		ref,
	)=>{
		const editorRef = useRef(null);
		const viewRef = useRef(null);
		const docsRef = useRef({});
		const prevTabRef = useRef(tab);

		const createExtensions = ({ onChange, language, editorTheme })=>{
			const setEventListeners = EditorView.updateListener.of((update)=>{
				if(update.docChanged) {
					onChange(update.state.doc.toString());
				}
				if(update.selectionSet) {
					const pos = update.state.selection.main.head;
					const line = update.state.doc.lineAt(pos).number;

					onCursorChange(line);
				}
				if(update.viewportChanged) {
					const { from } = update.view.viewport;
					const line = update.state.doc.lineAt(from).number;

					onViewChange(line);
				}
			});

			const highlightExtension = renderer === 'V3'
  			? syntaxHighlighting(customHighlightStyle)
  			: syntaxHighlighting(legacyCustomHighlightStyle);

			const customHighlightPlugin = createHighlightPlugin(renderer, tab);

			const languageExtension = language === 'css' ? css() : [markdown({ base: markdownLanguage, codeLanguages: languages }), html({ autoCloseTags: true })];
			const themeExtension = Array.isArray(themes[editorTheme]) ? themes[editorTheme] : themes[0];

			return [
				history(), //allows for undo and redo
				setEventListeners,
				EditorView.lineWrapping,
				scrollPastEnd(),
				languageExtension,
				lineNumbers(),
				pageFoldExtension,

				foldGutter({
					openText   : '▾',
					closedText : '▸'
				}),

				highlightActiveLine(),
				highlightActiveLineGutter(),
				highlightCompartment.of([customHighlightPlugin, highlightExtension]),
				themeCompartment.of(themeExtension),
				...(tab !== 'brewStyles' ? [autocompleteEmoji] : []),
				search(),
				keymap.of([...defaultKeymap, foldKeymap, ...searchKeymap]),
				customKeymap,
				drawSelection(),
				EditorState.allowMultipleSelections.of(true),
				customClose,
				dropCursor(),
			];
		};

		useEffect(()=>{
			if(!editorRef.current) return;

			const state = EditorState.create({
				doc        : value,
				extensions : createExtensions({ onChange, language, editorTheme }),
			});

			viewRef.current = new EditorView({
				state,
				parent : editorRef.current,
			});

			docsRef.current[tab] = state;

			return ()=>viewRef.current?.destroy();
		}, []);

		useEffect(()=>{
			const view = viewRef.current;
			if(!view) return;

			const prevTab = prevTabRef.current;

			if(prevTab !== tab) {
				docsRef.current[prevTab] = view.state;

				let nextState = docsRef.current[tab];

				if(!nextState) {
					nextState = EditorState.create({
						doc        : value,
						extensions : createExtensions({ onChange, language, editorTheme }),
					});
				}

				view.setState(nextState);
				prevTabRef.current = tab;
			}
		}, [tab]);

		useEffect(()=>{
			const view = viewRef.current;
			if(!view) return;

			const current = view.state.doc.toString();
			if(value !== current) {
				view.dispatch({
					changes : { from: 0, to: current.length, insert: value },
				});
			}
		}, [value]);

		useEffect(()=>{
			//rebuild theme extension on theme change
			const view = viewRef.current;
			if(!view) return;

			const themeExtension = Array.isArray(themes[editorTheme]) ? themes[editorTheme] : [];

			view.dispatch({
				effects : themeCompartment.reconfigure(themeExtension),
			});
		}, [editorTheme]);
		useEffect(()=>{
			const view = viewRef.current;
			if(!view) return;

			const highlightExtension =renderer === 'V3'
    		? syntaxHighlighting(customHighlightStyle)
    		: syntaxHighlighting(legacyCustomHighlightStyle);

			const customHighlightPlugin = createHighlightPlugin(renderer, tab);

			view.dispatch({
				effects : highlightCompartment.reconfigure([customHighlightPlugin, highlightExtension]),
			});
		}, [renderer, tab]);

		useImperativeHandle(ref, ()=>({
			getValue : ()=>viewRef.current.state.doc.toString(),

			setValue : (text)=>{
				const view = viewRef.current;
				view.dispatch({
					changes : { from: 0, to: view.state.doc.length, insert: text },
				});
			},

			injectText : (text)=>{
				const view = viewRef.current;
				const changes = view.state.selection.ranges.map((range)=>({
					from   : range.from,
					to     : range.to,
					insert : text
				}));

				const newRanges = view.state.selection.ranges.map((range)=>({
					anchor : range.from + text.length
				}));

				view.dispatch({
					changes,
					selection : { ranges: newRanges }
				});

				view.focus();
			},
			getCursorPosition : ()=>viewRef.current.state.selection.main.head,

			getScrollTop : ()=>viewRef.current.scrollDOM.scrollTop,

			scrollToY : (y)=>{
				viewRef.current.scrollDOM.scrollTo({ top: y });
			},

			getLineTop : (lineNumber)=>{
				const view = viewRef.current;
				if(!view) return 0;

				const line = view.state.doc.line(lineNumber);
				return view.coordsAtPos(line.from)?.top ?? 0;
			},

			setCursorToLine : (lineNumber)=>{
				const view = viewRef.current;
				const line = view.state.doc.line(lineNumber);

				view.dispatch({
					selection : { anchor: line.from }
				});

				view.focus();
			},

			undo : ()=>undo(viewRef.current),
			redo : ()=>redo(viewRef.current),

			historySize : ()=>{
				const view = viewRef.current;
				if(!view) return { done: 0, undone: 0 };

				return {
					done   : undoDepth(view.state),
					undone : redoDepth(view.state),
				};
			},

			foldAll : ()=>{
				const view = viewRef.current;
				if(!view) return;
				view.dispatch(foldAllCmd(view));
			},
			unfoldAll : ()=>{
				const view = viewRef.current;
				if(!view) return;
				view.dispatch(unfoldAllCmd(view));
			},

			focus : ()=>viewRef.current.focus(),
		}));

		return <div className={`codeEditor ${tab}`} ref={editorRef} style={style} />;
	},
);

export default CodeEditor;
