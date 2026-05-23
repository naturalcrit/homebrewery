/* eslint max-lines: ["error", { "max": 405 }] */
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
	drawSelection,
	dropCursor,
	rectangularSelection,
	crosshairCursor,
} from '@codemirror/view';
import { EditorState, Compartment, StateEffect, StateField } from '@codemirror/state';
import {
	unfoldAll as unfoldAllCmd,
	foldGutter,
	foldKeymap,
	foldEffect,
	foldState,
	syntaxHighlighting,
} from '@codemirror/language';
import { defaultKeymap, history, undo, redo, undoDepth, redoDepth } from '@codemirror/commands';
import { languages } from '@codemirror/language-data';
import { css } from '@codemirror/lang-css';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { autocompleteEmoji } from './extensions/autocompleteEmoji.js';
import { searchKeymap, search } from '@codemirror/search';
import { closeBrackets } from '@codemirror/autocomplete';

const autoCloseBrackets = closeBrackets({ brackets: ['()', '[]', '{{}}'] });

import defaultCM5Theme from '@themes/codeMirror/default.js';
import darkbrewery from '@themes/codeMirror/darkbrewery.js';
import cm5Themes from 'codemirror-5-themes';

const themes = { default: defaultCM5Theme, ...cm5Themes, darkbrewery };
const themeCompartment = new Compartment();
const highlightCompartment = new Compartment();

import { generalKeymap, markdownKeymap, cssKeymap, formatCSS } from './extensions/customKeyMaps.js';
import foldOnPages from './extensions/customFolding.js';
import { customHighlightStyle , customHighlightPlugin } from './extensions/customHighlight.js';
import { legacyCustomHighlightStyle } from './extensions/legacyCustomHighlight.js';

const PAGEBREAK_REGEX_V3 = /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m;

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
		const tabRef = useRef(tab);
		const prevTabRef = useRef(tab);
		const scrollRef = useRef({});
		const foldsRef = useRef({});
		const pageMap = useRef([]);

		const recomputePages = (doc)=>{
			if(tab !== 'brewText') return;
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

		const getFoldRanges = (state)=>{
			const folds = [];
			state.field(foldState, false)?.between(0, state.doc.length, (from, to)=>{
				folds.push({ from, to });
			});
			return folds;
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
				highlightCompartment.of([customHighlightPlugin(renderer, tab), highlightExtension]),
				themeCompartment.of(themeExtension),
				highlightActiveLine(),
				highlightActiveLineGutter(),

				//keyboard shortcut
				keymap.of([...defaultKeymap, foldKeymap, ...searchKeymap]),
				generalKeymap,
				...(tab === 'brewStyles' ? [cssKeymap] : [markdownKeymap]),

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
					scrollRef.current[tabRef.current] = top;
					const block = view.lineBlockAtHeight(top);
					const page = findPageFromPos(block.from);
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

		const restoreFolds = (view, folds)=>{
  			if(!folds?.length) return;

  			view.dispatch({
    			effects : folds.map((f)=>foldEffect.of(f))
  			});
		};

		useEffect(()=>{
			const view = viewRef.current;
			if(!view) return;

			tabRef.current = tab;
			const prevTab = prevTabRef.current;

			foldsRef.current[prevTab] = getFoldRanges(view.state);

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
				restoreFolds(view, foldsRef.current[tab]);

				const savedScroll = scrollRef.current[tab];

				if(savedScroll != null) {
					requestAnimationFrame(()=>{
						view.scrollDOM.scrollTop = savedScroll;
					});
				}

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

			view.dispatch({
				effects : highlightCompartment.reconfigure([customHighlightPlugin(renderer, tab), highlightExtension]),
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

			formatCode : ()=>formatCSS(viewRef.current),

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
