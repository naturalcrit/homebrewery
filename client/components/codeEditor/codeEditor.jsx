/* eslint max-lines: ["error", { "max": 600 }] */
// Bumped from 500: Performance Mode adds the viewport-only highlighter, the debounce/idle/
// startTransition pipeline for onChange and recomputePages, and binary-search page lookup.
// Splitting the file would scatter tightly-coupled state (debounced fns, refs, useEffects)
// across modules without making either half easier to read.
import './codeEditor.less';
import React, { useEffect, useRef, useMemo, forwardRef, useImperativeHandle, startTransition } from 'react';
import _ from 'lodash';

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

import * as themesImport from '@uiw/codemirror-themes-all';
import defaultCM5Theme from '@themes/codeMirror/default.js';
import darkbrewery from '@themes/codeMirror/darkbrewery.js';

const themes = { default: defaultCM5Theme, darkbrewery, ...themesImport };
const themeCompartment = new Compartment();
const highlightCompartment = new Compartment();

import { generalKeymap, markdownKeymap } from './customKeyMaps.js';
import foldOnPages from './customFolding.js';
import { customHighlightStyle, tokenizeCustomMarkdown, tokenizeCustomCSS } from './customHighlight.js';
import { legacyCustomHighlightStyle, legacyTokenizeCustomMarkdown } from './legacyCustomHighlight.js';
import { PAGEBREAK_REGEX_V3 } from '@shared/pageBreaks.js';

// Run a callback during browser idle time, with a setTimeout fallback for older browsers
// (Safari < 14). Used in perf mode to keep doc.toString() off the input thread.
const scheduleIdle = (fn)=>{
	if(typeof requestIdleCallback === 'function')
		requestIdleCallback(fn, { timeout: 200 });
	else
		setTimeout(fn, 0);
};

const createHighlightPlugin = (renderer, tab, performanceMode = false, pageMapRef = null)=>{
	//this function takes the custom tokens created in the tokenize function in customhighlight files
	//takes the tokens defined by that function and assigns classes to them
	//it also creates page number and snippet number widgets

	let tokenize;

	if(tab === 'brewStyles') {
		tokenize = tokenizeCustomCSS;
	} else {
		tokenize = renderer === 'V3' ? tokenizeCustomMarkdown : legacyTokenizeCustomMarkdown;
	}

	const collectFullDocTokens = (view)=>{
		// returns [{ tokens, lineOffset }] where lineOffset is the 1-based line number that token.line=0 refers to
		return [{ tokens: tokenize(view.state.doc.toString()), lineOffset: 1 }];
	};

	const collectViewportTokens = (view)=>{
		// Tokenize each visible range separately. Substring boundaries align to line boundaries
		// so token line indices stay valid; offset by the absolute starting line number.
		const groups = [];
		for (const { from, to } of view.visibleRanges) {
			const startLine = view.state.doc.lineAt(from).number;
			const endLine = view.state.doc.lineAt(to).number;
			let text = '';
			for (let n = startLine; n <= endLine; n++) {
				const l = view.state.doc.line(n);
				text += (n === startLine ? '' : '\n') + l.text;
			}
			groups.push({ tokens: tokenize(text), lineOffset: startLine });
		}
		return groups;
	};

	// Viewport-only tokenization only pays off for large documents; below this line count the
	// extra per-line iteration is slower than tokenizing the whole doc once.
	const VIEWPORT_TOKENIZE_THRESHOLD_LINES = 2000;
	const useViewportTokens = (view)=>performanceMode && view.state.doc.lines >= VIEWPORT_TOKENIZE_THRESHOLD_LINES;

	return ViewPlugin.fromClass(
		class {
			constructor(view) {
				this.decorations = this.buildDecorations(view);
			}
			update(update) {
				// In performance mode the viewport drives what gets highlighted on large docs,
				// so rebuild whenever it changes (otherwise scrolled-in lines stay un-styled).
				const viewportMatters = useViewportTokens(update.view);
				if(update.docChanged || (viewportMatters && update.viewportChanged)) {
					this.decorations = this.buildDecorations(update.view);
				}
			}
			buildDecorations(view) {
				const decos = [];
				const viewportMode = useViewportTokens(view);
				const groups = viewportMode ? collectViewportTokens(view) : collectFullDocTokens(view);
				let pageCount = 1;
				let snippetCount = 0;

				groups.forEach(({ tokens, lineOffset })=>{
					tokens.forEach((tok)=>{
						const line = view.state.doc.line(tok.line + lineOffset);

						if(tok.from != null && tok.to != null && tok.from < tok.to) {
							decos.push(Decoration.mark({ class: `cm-${tok.type}` }).range(line.from + tok.from, line.from + tok.to));
						} else {
							decos.push(Decoration.line({ class: `cm-${tok.type}` }).range(line.from));
							if(tok.type === 'pageLine'  && tab === 'brewText') {
								if(viewportMode && pageMapRef?.current) {
									// Look up page number from the document-wide page map; viewport-only
									// tokenization can't sequentially count pages because earlier ones aren't seen.
									const idx = pageMapRef.current.indexOf(line.from);
									const pageNum = idx >= 0 ? idx + 1 : null;
									if(pageNum != null)
										decos.push(Decoration.line({ attributes: { 'data-page-number': pageNum } }).range(line.from));
								} else {
									pageCount++;
									line.from === 0 && pageCount--;
									decos.push(Decoration.line({ attributes: { 'data-page-number': pageCount } }).range(line.from));
								}
							}
							if(tok.type === 'snippetLine' && tab === 'brewSnippets') {
								// Snippet numbering is left as-is in performance mode; it sequences within
								// the viewport rather than the full document. Acceptable for snippets tab.
								snippetCount++;
								decos.push(Decoration.line({ attributes: { 'data-page-number': snippetCount } }).range(line.from));
							}
						}
					});
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
			value = '',
			onChange = ()=>{},
			onCursorChange = ()=>{},
			onViewChange = ()=>{},
			editorTheme = 'default',
			style,
			renderer,
			performanceMode = false,
			...props
		},
		ref,
	)=>{
		const editorRef = useRef(null);
		const viewRef = useRef(null);
		const docsRef = useRef({});
		const prevTabRef = useRef(tab);

		const pageMap = useRef([]);
		const performanceModeRef = useRef(performanceMode);
		performanceModeRef.current = performanceMode;

		const recomputePages = (doc)=>{
			// Iterate CodeMirror's rope line-by-line instead of materializing the whole document
			// as a string and split('\n')-allocating ~50k substrings. About 2× faster on large
			// brews and dramatically lower peak memory.
			const pages = [0];
			let offset = 0;
			const iter = doc.iterLines();
			while (!iter.next().done) {
				if(PAGEBREAK_REGEX_V3.test(iter.value)) pages.push(offset);
				offset += iter.value.length + 1; // +1 for the implicit line break
			}

			pageMap.current = pages;
		};

		// In performance mode, the full-document page-map scan is deferred so the input thread
		// stays responsive. The cursor-page indicator briefly lags during typing (~250ms).
		// Recreate the debounced instance when performanceMode toggles; cancel on unmount.
		const debouncedRecomputePages = useMemo(
			()=>_.debounce((doc)=>recomputePages(doc), 250, { trailing: true, maxWait: 1000 }),
			[]
		);
		// Flush (not cancel) on unmount so the last pending page-map recompute actually runs. SPA
		// route changes don't fire `beforeunload`, and the contentDOM `blur` listener is torn
		// down in the same cleanup — this is the last chance to drain the debounce.
		useEffect(()=>()=>{
			debouncedRecomputePages.flush();
			debouncedRecomputePages.cancel();
		}, [debouncedRecomputePages]);

		// Holds the latest onChange so the debounced wrapper always calls into a fresh closure
		// without recreating the debounce instance (which would lose pending calls on prop change).
		const onChangeRef = useRef(onChange);
		onChangeRef.current = onChange;
		// Tracks the most recent string we emitted upstream. When the resulting React state cycles
		// back as the `value` prop, we can skip the expensive round-trip dispatch via ref equality.
		const lastEmittedRef = useRef(value);
		// In performance mode the heavy work isn't tokenization — it's `doc.toString()` on a 50k-line
		// rope plus the React cascade through EditPage→Editor→BrewRenderer with a 1MB+ text prop.
		// Three layers keep the editor input thread responsive even on a 50k-line brew:
		//   1. `_.debounce` coalesces bursts (150ms quiet / 600ms maxWait).
		//   2. `requestIdleCallback` defers the actual toString + React work until the next idle
		//      slot, so the debounce trigger itself doesn't block the next keystroke.
		//   3. `startTransition` marks the React state update as low-priority, letting React yield
		//      to incoming user input partway through the EditPage→Editor→BrewRenderer cascade.
		// `flushPending` (Ctrl+S, blur, onbeforeunload) calls `.flush()` which invokes the
		// debounced fn synchronously and bypasses the idle scheduler — saves never wait for idle.
		const debouncedOnChange = useMemo(
			()=>_.debounce((doc)=>{
				const propagate = ()=>{
					const text = doc.toString();
					lastEmittedRef.current = text;
					if(performanceModeRef.current)
						startTransition(()=>onChangeRef.current(text));
					else
						onChangeRef.current(text);
				};
				if(performanceModeRef.current)
					scheduleIdle(propagate);
				else
					propagate();
			}, 150, { trailing: true, maxWait: 600 }),
			[]
		);
		// Flush before cancel: a keystroke landing within the 150ms quiet window must still
		// reach upstream state before the editor unmounts (SPA navigation, hot-reload) or the
		// trailing characters are silently dropped.
		useEffect(()=>()=>{
			debouncedOnChange.flush();
			debouncedOnChange.cancel();
		}, [debouncedOnChange]);

		const findPageFromPos = (pos)=>{
			// Binary search on the monotonically increasing pageMap (page-start offsets).
			// On an 800-page document this avoids a ~800-comparison linear scan per cursor move.
			const pages = pageMap.current;
			let lo = 1;
			let hi = pages.length - 1;
			let page = 1;
			while (lo <= hi) {
				const mid = (lo + hi) >>> 1;
				if(pos >= pages[mid]) {
					page = mid + 1;
					lo = mid + 1;
				} else {
					hi = mid - 1;
				}
			}
			return page;
		};

		const createExtensions = ({ onChange, language, editorTheme })=>{
			const isTextTab = tab === 'brewText';
			const setEventListeners = EditorView.updateListener.of((update)=>{
				if(update.docChanged) {
					if(performanceModeRef.current) {
						// `\page` only matters in the brewText tab; skip the full-doc scan elsewhere.
						if(isTextTab) debouncedRecomputePages(update.state.doc);
						debouncedOnChange(update.state.doc);
					} else {
						if(isTextTab) recomputePages(update.state.doc);
						onChange(update.state.doc.toString());
					}
				}
				if(update.selectionSet && isTextTab) {
					const pos = update.state.selection.main.head;
					const page = findPageFromPos(pos);
					onCursorChange(page);
				}
			});

			const highlightExtension = renderer === 'V3'
  			? syntaxHighlighting(customHighlightStyle)
  			: syntaxHighlighting(legacyCustomHighlightStyle);

			const customHighlightPlugin = createHighlightPlugin(renderer, tab, performanceMode, pageMap);

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

			if(tab === 'brewText') recomputePages(state.doc);

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

					const page = findPageFromPos(block.from);
					onViewChange(page);

					ticking = false;
				});
			};

			view.scrollDOM.addEventListener('scroll', handleScroll);

			// Flush pending debounced work when the editor loses focus so React state catches up
			// before the user navigates away or starts interacting with other UI.
			const handleBlur = ()=>{
				debouncedRecomputePages.flush();
				debouncedOnChange.flush();
			};
			view.contentDOM.addEventListener('blur', handleBlur);

			// Per-tab EditorState + CM6 scroll snapshot; see capture site below.
			docsRef.current[tab] = { state, scrollSnapshot: null };

			return ()=>{
				view.scrollDOM.removeEventListener('scroll', handleScroll);
				view.contentDOM.removeEventListener('blur', handleBlur);
				viewRef.current?.destroy();
			};
		}, []);

		useEffect(()=>{
			const view = viewRef.current;
			if(!view) return;

			const prevTab = prevTabRef.current;

			if(prevTab !== tab) {
				// Flush any pending debounced text propagation BEFORE we tear down the previous
				// tab's state. Otherwise the trailing flush would call `onChangeRef.current` —
				// which by then references the new tab's change handler — and route the previous
				// tab's typed text into the wrong field (e.g. brewText -> brewStyles corruption).
				debouncedOnChange.flush();
				debouncedRecomputePages.flush();

				// `view.scrollSnapshot()` captures scroll as a StateEffect; re-dispatching it
				// after setState hits CM6's isSnapshot fast path (reads from the block tree, not
				// from DOM measurements), avoiding the virtualized-viewport clamp that defeats
				// raw scrollTop writes. Raw scrollTop and coordsAt-based scrollIntoView both drift.
				docsRef.current[prevTab] = {
					state          : view.state,
					scrollSnapshot : view.scrollSnapshot(),
				};

				const saved = docsRef.current[tab];
				let nextState = saved?.state;

				if(!nextState) {
					nextState = EditorState.create({
						doc        : value,
						extensions : createExtensions({ onChange, language, editorTheme }),
					});
				}

				view.setState(nextState);
				prevTabRef.current = tab;

				// Re-apply the saved scroll snapshot. Skipped for first-visit tabs (no snapshot
				// yet) so they open naturally at the top of the doc.
				if(saved?.scrollSnapshot) {
					view.dispatch({ effects: saved.scrollSnapshot });
				}
			}
			view.focus();
		}, [tab]);

		useEffect(()=>{
			const view = viewRef.current;
			if(!view) return;

			// Fast path: when the incoming value is the very string we just emitted upstream,
			// it's the React round-trip — CodeMirror already has it. Skip the expensive
			// doc.toString() + string compare on a multi-MB document.
			if(value === lastEmittedRef.current) return;

			const current = view.state.doc.toString();
			if(value !== current) {
				view.dispatch({
					changes : { from: 0, to: current.length, insert: value },
				});
				lastEmittedRef.current = value;
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
			//rebuild syntax highlight when changing tab, renderer, or performance mode
			const view = viewRef.current;
			if(!view) return;

			// Toggling perf mode mid-session means stale debounced calls could fire after the
			// reconfigure. Flush onChange so we don't lose the trailing characters; cancel the
			// page-map recompute since it'll re-derive from the next docChanged anyway.
			debouncedOnChange.flush();
			debouncedRecomputePages.cancel();

			const highlightExtension =renderer === 'V3'
    		? syntaxHighlighting(customHighlightStyle)
    		: syntaxHighlighting(legacyCustomHighlightStyle);

			const customHighlightPlugin = createHighlightPlugin(renderer, tab, performanceMode, pageMap);

			view.dispatch({
				effects : highlightCompartment.reconfigure([customHighlightPlugin, highlightExtension]),
			});
		}, [renderer, tab, performanceMode]);

		useImperativeHandle(ref, ()=>({

			// Force any pending debounced page-map recompute to run immediately. Called before
			// save and on split-pane resize so the cursor-page indicator is accurate.
			flushPending : ()=>{
				debouncedRecomputePages.flush();
				debouncedOnChange.flush();
			},

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

				// Make sure any pending debounced page-map recompute has run so the lookup is accurate.
				debouncedRecomputePages.flush();
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

				debouncedRecomputePages.flush();
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
