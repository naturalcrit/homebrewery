/*eslint max-lines: ["warn", {"max": 500, "skipBlankLines": true, "skipComments": true}]*/
import './editor.less';
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import dedent from 'dedent';
import { EditorView } from '@codemirror/view';

import CodeEditor from '@components/codeEditor/codeEditor.jsx';
import SnippetBar from './snippetbar/snippetbar.jsx';
import MetadataEditor from './metadataEditor/metadataEditor.jsx';

const EDITOR_THEME_KEY = 'HB_editor_theme';

import defaultCM5Theme from '@themes/codeMirror/default.js';
import darkbrewery from '@themes/codeMirror/darkbrewery.js';
import cm5Themes from 'codemirror-5-themes';

const themes = { default: defaultCM5Theme, ...cm5Themes, darkbrewery };

const EditorThemes = Object.entries(themes)
	.filter(([name, value])=>Array.isArray(value) && !name.endsWith('Init') && !name.endsWith('Style'))
	.map(([name])=>name);

//const PAGEBREAK_REGEX_V3 = /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m;
//const SNIPPETBREAK_REGEX_V3 = /^\\snippet\ .*$/;
const DEFAULT_STYLE_TEXT = dedent`
				/*=======---  Example CSS styling  ---=======*/
				/* Any CSS here will apply to your document! */

				.myExampleClass {
					color: black;
				}`;

const DEFAULT_SNIPPET_TEXT = dedent`
				\snippet example snippet
				
				The text between \`\snippet title\` lines will become a snippet of name \`title\` as this example provides.
				
				This snippet is accessible in the brew tab, and will be inherited if the brew is used as a theme.
`;
let isJumping = false;
let jumpSource = null;

const Editor = forwardRef(
	(
		{
			brew = {},

			onBrewChange = ()=>{},
			reportError = ()=>{},

			onCursorPageChange = ()=>{},
			onViewPageChange = ()=>{},

			editorTheme = 'default',
			renderer = 'legacy',

			moveBrew,
			moveSource,
			liveScroll,

			setMoveArrows,
			updateBrew,
			showEditButtons,
			themeBundle,
			userThemes,

			currentEditorCursorPageNum = 1,
			currentEditorViewPageNum = 1,
			currentBrewRendererPageNum = 1,
		},
		ref,
	)=>{
		const [currentEditorTheme, setEditorTheme] = useState(editorTheme);
		const [view, setView] = useState('text'); // 'text', 'style', 'meta', 'snippet'
		const [snippetBarHeight, setSnippetBarHeight] = useState(26);
		const [isDark, setIsDark] = useState(false);

		const editor = useRef(null);
		const codeEditor = useRef(null);
		const throttleBrewMove = useRef(null);

		const isText = ()=>isView('text');
		const isStyle = ()=>isView('style');
		const isMeta = ()=>isView('meta');
		const isSnip = ()=>isView('snippet');

		const isView = (name)=>view === name;

		useEffect(()=>{
			const brewRenderer = document.getElementById('BrewRenderer');
			brewRenderer.onload = ()=>brewRenderer.contentDocument?.addEventListener('keydown', handleControlKeys);
			document.addEventListener('keydown', handleControlKeys);

			const editorTheme = window.localStorage.getItem(EDITOR_THEME_KEY);
			if(editorTheme && EditorThemes.includes(editorTheme)) setEditorTheme(editorTheme); else setEditorTheme('default');
			const snippetBar = document.querySelector('.editor > .snippetBar');
			if(!snippetBar) return;

			const resizeObserver = new ResizeObserver((entries)=>{
				const height = document.querySelector('.editor > .snippetBar').offsetHeight;
				setSnippetBarHeight(height);
			});
			resizeObserver.observe(snippetBar);

			return ()=>{
				if(resizeObserver) resizeObserver.disconnect();
			};
		}, []);

		useEffect(()=>{ if(moveBrew) brewJump(); }, [moveBrew]);
		useEffect(()=>{ if(moveSource) sourceJump(); }, [moveSource]);
		useEffect(()=>{ if(liveScroll) sourceJump(currentBrewRendererPageNum, false); }, [currentBrewRendererPageNum, liveScroll]);
		useEffect(()=>{ if(liveScroll) brewJump(currentEditorViewPageNum, false); }, [currentEditorViewPageNum, liveScroll]);
		useEffect(()=>{ if(liveScroll) brewJump(currentEditorCursorPageNum, false); }, [currentEditorCursorPageNum, liveScroll]);

		const handleControlKeys = (e)=>{
			if(!(e.ctrlKey && e.metaKey && e.shiftKey)) return;
			const LEFTARROW_KEY = 37;
			const RIGHTARROW_KEY = 39;
			if(e.keyCode == RIGHTARROW_KEY) brewJump();
			if(e.keyCode == LEFTARROW_KEY) sourceJump();
			if(e.keyCode == LEFTARROW_KEY || e.keyCode == RIGHTARROW_KEY) {
				e.stopPropagation();
				e.preventDefault();
			}
		};

		const updateCurrentCursorPage = (pageNumber)=>{
			onCursorPageChange(pageNumber);
		};

		const updateCurrentViewPage = (pageNumber)=>{
			onViewPageChange(pageNumber);
		};

		const handleInject = (injectText)=>{
			codeEditor.current?.injectText(injectText);
		};

		const handleViewChange = (newView)=>{
			setMoveArrows(newView === 'text');
			setView(newView);
		};
		useEffect(()=>{
			codeEditor.current?.focus();
		}, [view]);

		const brewJump = (targetPage = currentEditorCursorPageNum, smooth = true)=>{
			if(!window || !isText() || isJumping || jumpSource === 'source') return;

			const brewRenderer =
				window.frames['BrewRenderer'].contentDocument.getElementsByClassName('brewRenderer')[0];

			const currentPos = brewRenderer.scrollTop;

			const targetPos = window.frames['BrewRenderer'].contentDocument
				.getElementById(`p${targetPage}`)
				.getBoundingClientRect().top;

			let scrollingTimeout;

			const checkIfScrollComplete = ()=>{// Prevent interrupting a scroll in progress if user clicks multiple times
				clearTimeout(scrollingTimeout);// Reset the timer every time a scroll event occurs

				scrollingTimeout = setTimeout(()=>{
					isJumping = false;
					jumpSource = null;

					brewRenderer.removeEventListener('scroll', checkIfScrollComplete);
				}, 150);// If 150 ms pass without a brewRenderer scroll event, assume scrolling is done
			};

			isJumping = true;
			jumpSource = 'brew';

			checkIfScrollComplete();
			brewRenderer.addEventListener('scroll', checkIfScrollComplete);

			if(smooth) {
				const bouncePos = targetPos >= 0 ? -30 : 30; //Do a little bounce before scrolling
				const now = Date.now();

				if(now - throttleBrewMove.current >= 500) {
					throttleBrewMove.current = now;

					brewRenderer.scrollTo({ top: currentPos + bouncePos, behavior: 'smooth' });

					setTimeout(()=>{
						brewRenderer.scrollTo({	top: currentPos + targetPos, behavior: 'smooth', block: 'start' });
					}, 100);
				}
			} else {
				brewRenderer.scrollTo({ top : currentPos + targetPos, behavior : 'instant', block : 'start',
				});
			}
		};

		const sourceJump = (targetPage = currentBrewRendererPageNum, smooth = true)=>{
			if(!isText() || isJumping || jumpSource === 'brew') return;

			if(!codeEditor.current) return;
			jumpSource = 'source';

			codeEditor.current.scrollToPage(targetPage);
			setTimeout(()=>{
				jumpSource = null;
			}, 200);
		};

		const updateEditorTheme = (newTheme)=>{
			window.localStorage.setItem(EDITOR_THEME_KEY, newTheme);
			setEditorTheme(newTheme);
		};

		const renderEditor = ()=>{
			if(isText()) {
				return (
					<>
						<CodeEditor
							key='codeEditor'
							ref={codeEditor}
							language='gfm'
							tab='brewText'
							view={view}
							value={brew.text}
							onChange={onBrewChange('text')}
							onCursorChange={(page)=>updateCurrentCursorPage(page)}
							onViewChange={(page)=>updateCurrentViewPage(page)}
							editorTheme={currentEditorTheme}
							onThemeChange={setIsDark}
							renderer={brew.renderer}
							style={{ height: `calc(100% - ${snippetBarHeight}px)` }}
						/>
					</>
				);
			}
			if(isStyle()) {
				return (
					<>
						<CodeEditor
							key='codeEditor'
							ref={codeEditor}
							language='css'
							tab='brewStyles'
							view={view}
							value={brew.style ?? DEFAULT_STYLE_TEXT}
							onChange={onBrewChange('style')}
							editorTheme={currentEditorTheme}
							onThemeChange={setIsDark}
							renderer={brew.renderer}
							style={{ height: `calc(100% - ${snippetBarHeight}px)` }}
						/>
					</>
				);
			}
			if(isSnip()) {
				if(!brew.snippets) {
					brew.snippets = DEFAULT_SNIPPET_TEXT;
				}
				return (
					<>
						<CodeEditor
							key='codeEditor'
							ref={codeEditor}
							language='gfm'
							tab='brewSnippets'
							view={view}
							value={brew.snippets}
							onChange={onBrewChange('snippets')}
							enableFolding={true}
							editorTheme={currentEditorTheme}
							onThemeChange={setIsDark}
							renderer={brew.renderer}
							style={{ height: `calc(100% - 25px)` }}
						/>
					</>
				);
			}
			if(isMeta()) {
				return (
					<>
						<CodeEditor key='codeEditor' editorTheme={currentEditorTheme} onThemeChange={setIsDark} view={view} style={{ display: 'none' }} />
						<MetadataEditor
							metadata={brew}
							themeBundle={themeBundle}
							onChange={onBrewChange('metadata')}
							reportError={reportError}
							userThemes={userThemes}
						/>
					</>
				);
			}
		};

		const redo = ()=>codeEditor.current?.redo();
		const historySize = ()=>codeEditor.current?.historySize();
		const undo = ()=>codeEditor.current?.undo();
		const foldCode = ()=>codeEditor.current?.foldAll();
		const unfoldCode = ()=>codeEditor.current?.unfoldAll();

		//Called when there are changes to the editor's dimensions
		const update = ()=>{};

		useImperativeHandle(ref, ()=>({
			update,
			undo,
			redo,
			foldCode,
			unfoldCode,
			historySize,
		}));

		return (
			<div className={`editor${isDark ? ' darkMode' : ''}`} ref={editor}>
				<SnippetBar
					brew={brew}
					view={view}
					onViewChange={handleViewChange}
					onInject={handleInject}
					showEditButtons={showEditButtons}
					renderer={renderer}
					theme={brew.theme}
					undo={undo}
					redo={redo}
					foldCode={foldCode}
					unfoldCode={unfoldCode}
					historySize={historySize()}
					currentEditorTheme={currentEditorTheme}
					updateEditorTheme={updateEditorTheme}
					themeBundle={themeBundle}
					cursorPos={codeEditor.current?.getCursorPosition() || {}}
					updateBrew={updateBrew}
				/>

				{renderEditor()}
			</div>
		);
	}
);

export default Editor;
