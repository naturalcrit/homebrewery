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
	drawSelection,
	dropCursor,
	rectangularSelection,
	crosshairCursor,
} from '@codemirror/view';
import { EditorState, Compartment, StateEffect, StateField } from '@codemirror/state';
import { foldAll as foldAllCmd, unfoldAll as unfoldAllCmd, foldGutter, foldKeymap, syntaxHighlighting } from '@codemirror/language';
import { foldEffect } from '@codemirror/language';
import { defaultKeymap, history, undo, redo, undoDepth, redoDepth } from '@codemirror/commands';
import { languages } from '@codemirror/language-data';
import { css } from '@codemirror/lang-css';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { autocompleteEmoji } from './autocompleteEmoji.js';
import { searchKeymap, search } from '@codemirror/search';
import { closeBrackets } from '@codemirror/autocomplete';

const autoCloseBrackets = closeBrackets({ brackets: ['()', '[]', '{{}}'] });

import defaultCM5Theme from '@themes/codeMirror/default.js';
import darkbrewery from '@themes/codeMirror/darkbrewery.js';
import cm5Themes from 'codemirror-5-themes';

const themes = { default: defaultCM5Theme, ...cm5Themes, darkbrewery };
const themeCompartment = new Compartment();
const highlightCompartment = new Compartment();

console.log(themes);

import { generalKeymap, markdownKeymap } from './customKeyMaps.js';
import foldOnPages from './customFolding.js';
import { customHighlightStyle, tokenizeCustomMarkdown, tokenizeCustomCSS } from './customHighlight.js';
import { legacyCustomHighlightStyle, legacyTokenizeCustomMarkdown } from './legacyCustomHighlight.js';

const PAGEBREAK_REGEX_V3 = /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m;

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
							decos.push(Decoration.line({ attributes: { 'data-page-number': snippetCount } }).range(line.from));
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

const setProgrammaticCursorLine = StateEffect.define();

const programmaticCursorLineField = StateField.define({
	create() {
		return Decoration.none;
	},
	update(decorations, transitionState) {
		//deco is the decoratiions object
		//tr is the transition state object, tr.effects is an array of stateEffects
		//seems to be the easiest way of setting a class programatically only when called
		for (const effects of transitionState.effects) {
			if(effects.is(setProgrammaticCursorLine)) {
				const pos = effects.value;
				if(pos == null) return Decoration.none;
				const line = transitionState.state.doc.lineAt(pos);

				return Decoration.set([
					Decoration.line({
						class : 'sourceMoveFlash'
					}).range(line.from)
				]);
			}
		}
		return decorations;
	},
	provide : (decorationSet)=>EditorView.decorations.from(decorationSet)
});

const CodeEditor = forwardRef(
	(
		{
			language = '',
			tab = 'brewText',
			view,
			value = '',
			onChange = ()=>{},
			onCursorChange = ()=>{},
			onViewChange = ()=>{},
			editorTheme = 'default',
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

		const pageMap = useRef([]);

		const recomputePages = (doc)=>{
			const pages = [0];
			const text = doc.toString();
			let offset = 0;

			for (const line of text.split('\n')) {
				if(PAGEBREAK_REGEX_V3.test(line)) {
					pages.push(offset);
				}
				offset += line.length + 1;
			}

			pageMap.current = pages;
		};

		const findPageFromPos = (pos)=>{
			const pages = pageMap.current;
			let page = 1;

			for (let i = 1; i < pages.length; i++) {
				if(pos >= pages[i]) page = i + 1;
			}

			return page;
		};

		const createExtensions = ({ onChange, language, editorTheme })=>{
			const setEventListeners = EditorView.updateListener.of((update)=>{
				if(update.docChanged) {
					recomputePages(update.state.doc);
					onChange(update.state.doc.toString());
				}
				if(update.selectionSet) {
					const pos = update.state.selection.main.head;
					const page = findPageFromPos(pos);
					onCursorChange(page);
				}
			});

			const highlightExtension = renderer === 'V3'
  			? syntaxHighlighting(customHighlightStyle)
  			: syntaxHighlighting(legacyCustomHighlightStyle);

			const customHighlightPlugin = createHighlightPlugin(renderer, tab);

			const languageExtension = language === 'css' ? css() : [markdown({ base: markdownLanguage, codeLanguages: languages }), html({ autoCloseTags: true })];
			const themeExtension = Array.isArray(themes[editorTheme]) ? themes[editorTheme] : themes[editorTheme] || themes['default'];

			return [
				EditorView.lineWrapping,
				setEventListeners,
				languageExtension,
				autoCloseBrackets,
				lineNumbers(),
				scrollPastEnd(),
				search(),
				history(), //allows for undo and redo
				...(tab !== 'brewStyles' ? [autocompleteEmoji] : []),

				//folding
				foldOnPages,
				foldGutter({
					openText   : '▾',
					closedText : '▸'
				}),

				//highlights
				highlightCompartment.of([customHighlightPlugin, highlightExtension]),
				themeCompartment.of(themeExtension),
				highlightActiveLine(),
				highlightActiveLineGutter(),

				//keyboard shortcut
				keymap.of([...defaultKeymap, foldKeymap, ...searchKeymap]),
				generalKeymap,
				...(tab !== 'brewStyles' ? [markdownKeymap] : []),

				//multiple cursors and selections
				drawSelection(),
				rectangularSelection(),
				crosshairCursor(),
				EditorState.allowMultipleSelections.of(true),
				dropCursor(),
				programmaticCursorLineField,
			];
		};

		useEffect(()=>{
			if(!editorRef.current) return;

			const state = EditorState.create({
				doc        : value,
				extensions : createExtensions({ onChange, language, editorTheme }),
			});

			recomputePages(state.doc);

			viewRef.current = new EditorView({
				state,
				parent : editorRef.current,
			});

			const view = viewRef.current;

			let ticking = false;

			const handleScroll = ()=>{
				if(ticking) return;

				ticking = true;
				requestAnimationFrame(()=>{
					const top = view.scrollDOM.scrollTop;
					const block = view.lineBlockAtHeight(top);

					const page = findPageFromPos(block.from); // CHANGED
					onViewChange(page);

					ticking = false;
				});
			};

			view.scrollDOM.addEventListener('scroll', handleScroll);

			docsRef.current[tab] = state;

			return ()=>{
				view.scrollDOM.removeEventListener('scroll', handleScroll);
				viewRef.current?.destroy();
			};
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
			view.focus();
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

			const themeExtension = Array.isArray(themes[editorTheme])? themes[editorTheme]: themes[editorTheme] || themes['default'];

			view.dispatch({
				effects : themeCompartment.reconfigure(themeExtension),
			});
		}, [editorTheme]);

		useEffect(()=>{
			//rebuild syntax highlight when changing tab or renderer
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

			injectText : (text)=>{
				const view = viewRef.current;


				view.dispatch(
					view.state.replaceSelection(text)
				);
				view.focus();
			},
			getCursorPosition : ()=>viewRef.current.state.selection.main.head,

			scrollToPage : (pageNumber, smooth = true)=>{
				const view = viewRef.current;
				if(!view) return;

				const pos = pageMap.current[pageNumber - 1] ?? 0;

				view.dispatch({
					selection : { anchor: pos },
					effects   : [setProgrammaticCursorLine.of(pos), EditorView.scrollIntoView(pos, { y: 'start' })],
				});

				view.focus();

				setTimeout(()=>{
					view.dispatch({
						effects : setProgrammaticCursorLine.of(null)
					});
				}, 400);
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

				const doc = view.state.doc;
				const pages = pageMap.current;

				const effects = pages.map((start, i)=>{
					const next = pages[i + 1] || doc.length;
					const from = i ? doc.line(doc.lineAt(start).number + 1).from : 0;
					const to = doc.line(doc.lineAt(next).number).from - 1;

					return to > from ? foldEffect.of({ from, to }) : null;
				}).filter(Boolean);

				view.dispatch({ effects });
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
