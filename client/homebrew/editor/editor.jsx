/*eslint max-lines: ["warn", {"max": 500, "skipBlankLines": true, "skipComments": true}]*/
import './editor.less';
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import dedent from 'dedent';
import { EditorView, lineNumbers } from '@codemirror/view';

import CodeEditor from '@components/codeEditor/codeEditor.jsx';
import SnippetBar from './snippetbar/snippetbar.jsx';
import MetadataEditor from './metadataEditor/metadataEditor.jsx';
import SettingsEditor from './settingsEditor/settingsEditor.jsx';

const EDITOR_THEME_KEY = 'HB_editor_theme';
const EDITOR_SETTINGS_KEY = 'HB_edit_settings';

import defaultCM5Theme from '@themes/codeMirror/default.js';
import darkbrewery from '@themes/codeMirror/darkbrewery.js';
import cm5Themes from 'codemirror-5-themes';

const themes = { default: defaultCM5Theme, ...cm5Themes, darkbrewery };

const EditorThemes = Object.entries(themes)
	.filter(([name, value])=>Array.isArray(value) && !name.endsWith('Init') && !name.endsWith('Style'))
	.map(([name])=>name);

const themeNames = Object.entries(themes)
  .filter(([name, value])=>Array.isArray(value) &&
    !name.endsWith('Init') &&
    !name.endsWith('Style')
  )
  .map(([name])=>name);

const EditorThemeNameList = [
	'default',
	...themeNames
    .filter((name)=>name !== 'default')
    .sort((a, b)=>a.localeCompare(b))
];

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
let softPageCalc = false;

// Fake enums
const OUTBOUNDSNOTABSOLUTE = 1;
const INBOUNDSNOTABSOLUTE = 2;
const ISABSOLUTE = 3;

const Editor = forwardRef(
	(
		{
			brew = {},

			onBrewChange = ()=>{},
			reportError = ()=>{},

			onCursorPageChange = ()=>{},
			onViewPageChange = ()=>{},

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
		const [view, setView] = useState('text'); // 'text', 'style', 'meta', 'snippet'
		const [snippetBarHeight, setSnippetBarHeight] = useState(26);
		const [isDark, setIsDark] = useState(false);
		const [editorSettings, setEditorSettings] = useState({
			autoCloseBrackets : true,
			showImagePreviews : true,
			activeLineShading : true,
			lineNumbers       : true,
			fontSize          : 1,
			editorTheme       : 'default',
		});

		const editor = useRef(null);
		const codeEditor = useRef(null);
		const throttleBrewMove = useRef(null);

		const isText = ()=>isView('text');
		const isStyle = ()=>isView('style');
		const isMeta = ()=>isView('meta');
		const isSnip = ()=>isView('snippet');
		const isSettings = ()=>isView('settings');

		const isView = (name)=>view === name;

		useEffect(()=>{
			const brewRenderer = document.getElementById('BrewRenderer');
			brewRenderer.onload = ()=>brewRenderer.contentDocument?.addEventListener('keydown', handleControlKeys);
			document.addEventListener('keydown', handleControlKeys);

			const localEditorTheme = window.localStorage.getItem(EDITOR_THEME_KEY);
			if(localEditorTheme && EditorThemes.includes(localEditorTheme)) {
				setEditorSettings({ ...editorSettings, editorTheme: localEditorTheme });
			} else setEditorSettings({ ...editorSettings, editorTheme: 'default' });
			const localEditorSettings = window.localStorage.getItem(EDITOR_SETTINGS_KEY);
			if(localEditorSettings) setEditorSettings(JSON.parse(localEditorSettings));
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
		useEffect(()=>{ if(!softPageCalc) handleSoftPages(); }, [brew.text]);

		const handleFormatCode = ()=>{
			codeEditor.current?.formatCode();
		};

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

		const checkInBounds = (element, parentLeft, parentRight, parentTop, parentBottom)=>{
			if(!element) return 0;
			const childX = element.getBoundingClientRect().left;				// Get Child elements bounding box.
			const childX2 = childX + element.getBoundingClientRect().width;
			const childY = element.getBoundingClientRect().top;
			const childY2 = childY + element.getBoundingClientRect().height;

			const inX = ((childX >= parentLeft) && (childX2 <= parentRight));					// Test if Child X coords are inside page's X coords
			const inY = ((childY >= parentTop) && (childY2 <= parentBottom));					// Test if Child Y coords are inside page's Y coords

			if(((!inX) || (!inY)) && (getComputedStyle(element)?.position != 'absolute')) return OUTBOUNDSNOTABSOLUTE;
			else if((inX) && (inY) && (getComputedStyle(element)?.position != 'absolute')) return INBOUNDSNOTABSOLUTE;
			else if(getComputedStyle(element)?.position == 'absolute') return ISABSOLUTE;

			return 0;
		};

		const handleSoftPages = (targetPage=(parseInt(currentEditorCursorPageNum, 10)))=>{
			if(softPageCalc) return; 						// This can trigger mid-run. Skip out if still calculating softpage handling.
			if(brew.renderer == 'Legacy') return; 	// Skip the legacy renderer, it doesn't understand \softpage

			const testPage = window.frames['BrewRenderer'].contentDocument.getElementById(`p${targetPage}`);
			if(!testPage) return;							// Make sure we have an actual page with content.

			const columnWrapper = testPage.getElementsByClassName('columnWrapper')[0];  // Grab the page's columnWrapper
			const preserveStyles = columnWrapper.style;									// Save the page's columnWrapper style

			let child = Math.floor(columnWrapper.children.length / 2);	  // Set the starting position for testing the bounds checking in the children to the midpoint.
			let lastChild = 0;																				// Initialize array movement variables
			let shift;

			let softInsert = false;

			const parentLeft      = testPage.getBoundingClientRect().left;					// Determine page boundaries
			const parentRight    = testPage.getBoundingClientRect().right;
			const parentTop     = testPage.getBoundingClientRect().top;
			const parentBottom    = testPage.getBoundingClientRect().bottom;

			// If the last element is in bounds, exit.
			// if(checkInBounds(columnWrapper[columnWrapper.children.length-1], parentX, parentX2, parentY, parentY2) == INBOUNDSNOTABSOLUTE) return false;
			while ((child != lastChild) && (child < columnWrapper.children.length)){

				// Walk the array of children, going up or down by increments of shift. Go up if current child is in bounds, down if not.
				// Continue until no movement occurs. References to position indicate the child element's position in the columnWrapper.children list
				shift = Math.floor(Math.abs(lastChild - child) / 2);	// Set shift to half the distance of the difference
				// of the previous last child position and the current child position

				const inBounds = checkInBounds(columnWrapper.children[child], parentLeft, parentRight, parentTop, parentBottom);

				if(inBounds == OUTBOUNDSNOTABSOLUTE) {
					// If child element has any one dimension outside of the page and it is NOT absolutely placed
					// Shift towards the front of the children ( earlier in the document )
					lastChild = child;
					child -= shift;
					softInsert = true;
				} else if(inBounds == INBOUNDSNOTABSOLUTE) {
					// Else If child element has all dimensions inside of the page and it is NOT absolutely placed
					// Shift towards the back of the children ( later in the document )
					lastChild = child;
					child += shift;
				} else if(inBounds == ISABSOLUTE) {
					// Else If child absolutely placed, step one element earlier
					child -= 1;
					softInsert = false;
				}
			}

			// Test to see if we're in the extraneous <div class="columnSplit"> required to fix some browsers.
			// If so, exit
			if(columnWrapper.children[child-1]?.className == 'columnSplit') {
				return;
			}

			// Exit if the last element is in bounds and is not absolutely positioned and that is where we stopped walking the loop.
			if((child==columnWrapper.children.length -1) && (getComputedStyle(columnWrapper.children[child])?.position !== 'absolute')) return;

			// Walk back to the last inBounds Not Absolute with a data-linenumber - work around elements without lineNumbers for now.
			while ((checkInBounds(columnWrapper.children[child], parentLeft, parentRight, parentTop, parentBottom) == OUTBOUNDSNOTABSOLUTE) ||
			  (!columnWrapper.children[child]?.getAttribute('data-linenumber'))) child--;

			// columnWrapper.style.overflow = 'hidden'; // Unsure if this is needed still.
			if(softInsert && columnWrapper.children[child]) {
				const targetLine = parseInt(columnWrapper.children[child].getAttribute('data-linenumber'), 10);
				const whereWasI = codeEditor.current.getCursorPosition();
				codeEditor.current.setCursorToLine(targetPage, targetLine);
				softPageCalc = true;
				setTimeout(async ()=>{
					await handleInject(`\n\\page {softPageClass}\n`);
					codeEditor.current.setCursorPosition(whereWasI);
					softPageCalc = false;
				}, 150);
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
			setEditorSettings({ ...editorSettings, editorTheme: newTheme });
		};

		const updateEditorSettings = (newEditorSettings)=>{
			window.localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(newEditorSettings));
			setEditorSettings(newEditorSettings);
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
							editorTheme={editorSettings.editorTheme}
							onThemeChange={setIsDark}
							renderer={brew.renderer}
							style={{ height: `calc(100% - ${snippetBarHeight}px)` }}
							settings={editorSettings}
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
							editorTheme={editorSettings.editorTheme}
							onThemeChange={setIsDark}
							renderer={brew.renderer}
							style={{ height: `calc(100% - ${snippetBarHeight}px)` }}
							settings={editorSettings}
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
							editorTheme={editorSettings.editorTheme}
							onThemeChange={setIsDark}
							renderer={brew.renderer}
							style={{ height: `calc(100% - 25px)` }}
							settings={editorSettings}
						/>
					</>
				);
			}
			if(isMeta()) {
				return (
					<>
						<CodeEditor key='codeEditor' tab='brewMetadata' editorTheme={editorSettings.editorTheme} onThemeChange={setIsDark} view={view} style={{ display: 'none' }} settings={editorSettings} />
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
			if(isSettings()){
				return (
					<>
						<CodeEditor
							key='codeEditor'
							tab='brewSettings' //necessary or the brew object loses its contents, culprit possibly on the tab dependent useEffect in codeEditor.jsx
							view={view}
							style={{ display: 'none' }}
							editorTheme={editorSettings.editorTheme}
							onThemeChange={setIsDark}
							settings={editorSettings}
						/>
						<SettingsEditor
							settings={editorSettings}
							EditorThemeNameList={EditorThemeNameList}
							updateSettings={updateEditorSettings}
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
					formatCode={isStyle() ? handleFormatCode : null}
					historySize={historySize()}
					currentEditorTheme={editorSettings.editorTheme}
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
