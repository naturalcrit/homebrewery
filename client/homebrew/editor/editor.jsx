/*eslint max-lines: ["warn", {"max": 500, "skipBlankLines": true, "skipComments": true}]*/
import './editor.less';
import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import dedent from 'dedent';

import CodeEditor from '../../components/codeEditor/codeEditor.jsx';
import SnippetBar from './snippetbar/snippetbar.jsx';
import MetadataEditor from './metadataEditor/metadataEditor.jsx';

const EDITOR_THEME_KEY = 'HB_editor_theme';

import defaultCM5Theme from '@themes/codeMirror/default.js';
import darkbrewery from '@themes/codeMirror/darkbrewery.js';
import cm5Themes from 'codemirror-5-themes';

const themes = { default: defaultCM5Theme, ...cm5Themes, darkbrewery };

const EditorThemes = Object.entries(themes)
  .filter(([name, value])=>Array.isArray(value) &&
	!name.endsWith('Init') &&
	!name.endsWith('Style')
  )
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
let softPageCalc  = false;

const stripTrailingTags = (str)=>{
	if(!str) return str;
	let newStr = str;
	while (newStr.lastIndexOf('</') > 0) {
		newStr = newStr.slice(0, newStr.lastIndexOf('</'));
	}

	return newStr;
};
let jumpSource = null;

const Editor = createReactClass({
	displayName     : 'Editor',
	getDefaultProps : function() {
		return {
			brew : {
				text  : '',
				style : ''
			},

			onBrewChange : ()=>{},
			reportError  : ()=>{},

			onCursorPageChange : ()=>{},
			onViewPageChange   : ()=>{},

			editorTheme : 'default',
			renderer    : 'legacy',

			currentEditorCursorPageNum : 1,
			currentEditorViewPageNum   : 1,
			currentBrewRendererPageNum : 1,
		};
	},
	getInitialState : function() {
		return {
			editorTheme      : this.props.editorTheme,
			view             : 'text', //'text', 'style', 'meta', 'snippet'
			snippetBarHeight : 26,
		};
	},

	editor     : React.createRef(null),
	codeEditor : React.createRef(null),

	isText  : function() {return this.state.view == 'text';},
	isStyle : function() {return this.state.view == 'style';},
	isMeta  : function() {return this.state.view == 'meta';},
	isSnip  : function() {return this.state.view == 'snippet';},

	componentDidMount : function() {

		const brewRenderer = document.getElementById('BrewRenderer');
		brewRenderer.onload = ()=>brewRenderer.contentDocument?.addEventListener('keydown', this.handleControlKeys);
		document.addEventListener('keydown', this.handleControlKeys);

		const editorTheme = window.localStorage.getItem(EDITOR_THEME_KEY);
		if(editorTheme && EditorThemes.includes(editorTheme)) {
  			this.setState({ editorTheme });
		} else {
  			this.setState({ editorTheme: 'default' });
		}
		const snippetBar = document.querySelector('.editor > .snippetBar');
		if(!snippetBar) return;

		this.resizeObserver = new ResizeObserver((entries)=>{
			const height = document.querySelector('.editor > .snippetBar').offsetHeight;
			this.setState({ snippetBarHeight: height });
		});

		this.resizeObserver.observe(snippetBar);
	},

	componentDidUpdate : function(prevProps, prevState, snapshot) {

		if(prevProps.brew.text !== this.props.brew.text)
			this.handleSoftPages();

		this.highlightCustomMarkdown();
		if(prevProps.moveBrew !== this.props.moveBrew)
			this.brewJump();

		if(prevProps.moveSource !== this.props.moveSource)
			this.sourceJump();

		if(this.props.liveScroll) {
			if(prevProps.currentBrewRendererPageNum !== this.props.currentBrewRendererPageNum) {
				this.sourceJump(this.props.currentBrewRendererPageNum, false);
			} else if(prevProps.currentEditorViewPageNum !== this.props.currentEditorViewPageNum) {
				this.brewJump(this.props.currentEditorViewPageNum, false);
			} else if(prevProps.currentEditorCursorPageNum !== this.props.currentEditorCursorPageNum) {
				this.brewJump(this.props.currentEditorCursorPageNum, false);
			}
		}
	},

	componentWillUnmount() {
		if(this.resizeObserver) this.resizeObserver.disconnect();
	},

	handleControlKeys : function(e){
		if(!(e.ctrlKey && e.metaKey && e.shiftKey)) return;
		const LEFTARROW_KEY = 37;
		const RIGHTARROW_KEY = 39;
		if(e.keyCode == RIGHTARROW_KEY) this.brewJump();
		if(e.keyCode == LEFTARROW_KEY) this.sourceJump();
		if(e.keyCode == LEFTARROW_KEY || e.keyCode == RIGHTARROW_KEY) {
			e.stopPropagation();
			e.preventDefault();
		}
	},

	updateCurrentCursorPage : function(pageNumber) {
		this.props.onCursorPageChange(pageNumber);
	},

	updateCurrentViewPage : function(pageNumber) {
		this.props.onViewPageChange(pageNumber);
	},

	handleInject : function(injectText){
		this.codeEditor.current?.injectText(injectText);
	},

	handleViewChange : function(newView){
		this.props.setMoveArrows(newView === 'text');

		this.setState({
			view : newView
		}, ()=>{
			this.codeEditor.current?.focus();
		});
	},

	handleSoftPages : function(targetPage=(parseInt(this.props.currentEditorCursorPageNum, 10))) {
		if(softPageCalc) return; 						// This can trigger mid-run. Skip out if still calculating softpage handling.
		if(this.props.renderer == 'Legacy') return; 	// Skip the legacy renderer, it doesn't understand \softpage

		const testPage = window.frames['BrewRenderer'].contentDocument.getElementById(`p${targetPage}`);
		if(!testPage) return;							// Make sure we have an actual page with content.

		const columnWrapper = testPage.getElementsByClassName('columnWrapper')[0];  // Grab the page's columnWrapper
		const preserveStyles = columnWrapper.style;									// Save the page's columnWrapper style

		let child = Math.floor(columnWrapper.children.length / 2);					// Set the starting position for testing the bounds checking in the children to the midpoint.
		let lastChild = 0;															// Initialize array movement variables
		let shift;

		let softInsert = false;

		const parentX      = testPage.getBoundingClientRect().left;					// Determine page boundaries
		const parentX2      = testPage.getBoundingClientRect().right;
		const parentY      = testPage.getBoundingClientRect().top;
		const parentY2      = testPage.getBoundingClientRect().bottom;

		while ((child != lastChild) && (child < columnWrapper.children.length)){
			// Walk the array of children, going up or down by increments of shift. Go up if current child is in bounds, down if not.
			// Continue until no movement occurs. References to position indicate the child element's position in the columnWrapper.children list
			shift = Math.floor(Math.abs(lastChild - child) / 2);						// Set shift to half the distance of the difference
																						// of the previous last child position and the current child 
																						// position

			const childX = columnWrapper.children[child].getBoundingClientRect().left;				// Get Child elements bounding box.
			const childX2 = childX + columnWrapper.children[child].getBoundingClientRect().width;
			const childY = columnWrapper.children[child].getBoundingClientRect().top;
			const childY2 = childY + columnWrapper.children[child].getBoundingClientRect().height;

			const inX = ((childX >= parentX) && (childX2 <= parentX2));					// Test if Child X coords are inside page's X coords
			const inY = ((childY >= parentY) && (childY2 <= parentY2));					// Test if Child Y coords are inside page's Y coords

			if(((!inX) || (!inY)) && (getComputedStyle(columnWrapper.children[child])?.position != 'absolute')) {
				// If child element has any one dimension outside of the page and it is NOT absolutely placed
				// Shift towards the front of the children ( earlier in the document )
				lastChild = child;
				child -= shift;
				softInsert = true;
			} else if((inX) && (inY) && (getComputedStyle(columnWrapper.children[child])?.position != 'absolute')) {
				// Else If child element has all dimensions inside of the page and it is NOT absolutely placed
				// Shift towards the back of the children ( later in the document )
				lastChild = child;
				child += shift;
			} else if(getComputedStyle(columnWrapper.children[child])?.position == 'absolute') {
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

		columnWrapper.style.overflow = 'hidden'; // Unsure if this is needed still.
		if(softInsert && columnWrapper.children[child]) {

			// Concatenate all of the softpages from the target page on.
			const allPages = this.props.brew.text.split(PAGEBREAK_REGEX_V3);
			let lastPage = targetPage; // Init at targetPage
			for (; (!allPages[lastPage]?.startsWith('\\page') && (lastPage<=allPages.length)); lastPage++) {}

			const strippedString = lastPage != targetPage ?            // Join the softpages together
				allPages.slice(targetPage, lastPage - 1).join('\n') :
				allPages[targetPage - 1];

			const lines = strippedString.split('\n');				  // Split the softpages into an array of lines.
																	  // Clone the \page formatter as \softpage or initialize if one was not set on page 1.
			const softPageFormatter = (allPages[targetPage - 1].split('\n')[0].startsWith('\\page') ? lines[0].replace('\\page', '\\softpage') : '\\softpage').trim();

			const textString = this.props.brew.text.split(PAGEBREAK_REGEX_V3).slice(0, targetPage-1).join(PAGEBREAK_REGEX_V3);
			const targetPageLine = textString.match('\n') ? textString.split('\n').length - 1 : -1;

			// Walk line section and strip \softpage lines.

			const walkedLines = [];
			for (let line in lines) {
				if(!lines[line].startsWith('\\softpage')) walkedLines.push(lines[line]);
			}

			if(lines.length != walkedLines.length) {
				softPageCalc = true;
				// Run the replaceRange in a timeout so that the update blocks looping into handleSoftPages()
				setTimeout(async ()=>{
					await this.codeEditor.current?.replaceRange(walkedLines.join('\n'), { line: targetPageLine, ch: 0 },
						{ line: targetPageLine + lines.length + 1, ch: 0 });
					lines = walkedLines;
					softPageCalc = false;
				}, 250);
			}

			let inBlock = -1;
			for (let line in lines) {
				// Look at a four line range to try and find starting text.
				const render = stripTrailingTags(Markdown.render(`${lines[line-1]}\n${lines[line]}\n${lines[line + 1]}\n${lines[line + 2]}`));
				// Look to see if the current line starts a div {{ }}, or ends one. Save the start if found.
				if(lines[line].startsWith('{{')) inBlock = line;
				if(lines[line].endsWith('}}')) inBlock = -1;
				if((render?.length>0) && (columnWrapper.children[child]?.outerHTML?.toString()?.indexOf(render)>-1)) {
					// Attempt to match the child element determined to be last inbounds to the rendered text
					// If found, set the targetLine to either inBlock ( if set ) or line + targetPageLine - 1
					// Pop the cursor to that line and insert the softPage.
					softPageCalc = true;
					const targetLine = (inBlock -1 ? inBlock : line) + targetPageLine - 1;
					const whereWasI = this.codeEditor.current.getCursorPosition();
					this.codeEditor.current.setCursorPosition({ line: targetLine, ch: 0 });
					setTimeout(async ()=>{
						await this.handleInject(`\n${softPageFormatter}\n`);
						this.codeEditor.current.setCursorPosition(whereWasI);
						columnWrapper.style=preserveStyles;
						softPageCalc = false;
					}, 250);
					break;
				}
			}
		}
		columnWrapper.style=preserveStyles;

	},

	brewJump : function(targetPage=this.props.currentEditorCursorPageNum, smooth=true){
		if(!window || !this.isText() || isJumping || jumpSource === 'source')
			return;

		// Get current brewRenderer scroll position and calculate target position
		const brewRenderer = window.frames['BrewRenderer'].contentDocument.getElementsByClassName('brewRenderer')[0];
		const currentPos = brewRenderer.scrollTop;
		const targetPos = window.frames['BrewRenderer'].contentDocument.getElementById(`p${targetPage}`).getBoundingClientRect().top;

		let scrollingTimeout;
		const checkIfScrollComplete = ()=>{	// Prevent interrupting a scroll in progress if user clicks multiple times
			clearTimeout(scrollingTimeout);   // Reset the timer every time a scroll event occurs
			scrollingTimeout = setTimeout(()=>{
				isJumping = false;
				jumpSource = null;
				brewRenderer.removeEventListener('scroll', checkIfScrollComplete);
			}, 150);	// If 150 ms pass without a brewRenderer scroll event, assume scrolling is done
		};

		isJumping = true;
		jumpSource = 'brew';
		checkIfScrollComplete();
		brewRenderer.addEventListener('scroll', checkIfScrollComplete);

		if(smooth) {
			const bouncePos   = targetPos >= 0 ? -30 : 30; //Do a little bounce before scrolling
			const bounceDelay = 100;
			const scrollDelay = 500;

			if(!this.throttleBrewMove) {
				this.throttleBrewMove = _.throttle((currentPos, bouncePos, targetPos)=>{
					brewRenderer.scrollTo({ top: currentPos + bouncePos, behavior: 'smooth' });
					setTimeout(()=>{
						brewRenderer.scrollTo({ top: currentPos + targetPos, behavior: 'smooth', block: 'start' });
					}, bounceDelay);
				}, scrollDelay, { leading: true, trailing: false });
			};
			this.throttleBrewMove(currentPos, bouncePos, targetPos);
		} else {
			brewRenderer.scrollTo({ top: currentPos + targetPos, behavior: 'instant', block: 'start' });
		}
	},

	sourceJump : function(targetPage=this.props.currentBrewRendererPageNum, smooth=true){
		if(!this.isText() || isJumping || jumpSource === 'brew')
			return;

		const editor = this.codeEditor.current;
		if(!editor) return;
		jumpSource = 'source';

		editor.scrollToPage(targetPage);
		setTimeout(()=>{
			jumpSource = null;
		}, 200);
	},

	//Called when there are changes to the editor's dimensions
	update : function(){},

	updateEditorTheme : function(newTheme){
		window.localStorage.setItem(EDITOR_THEME_KEY, newTheme);
		this.setState({
			editorTheme : newTheme
		});
	},

	//Called by CodeEditor after document switch, so Snippetbar can refresh UndoHistory
	rerenderParent : function (){
		this.forceUpdate();
	},

	renderEditor : function(){
		if(this.isText()){
			return <>
				<CodeEditor key='codeEditor'
					ref={this.codeEditor}
					language='gfm'
					tab='brewText'
					view={this.state.view}
					value={this.props.brew.text}
					onChange={this.props.onBrewChange('text')}
					onCursorChange={(page)=>this.updateCurrentCursorPage(page)}
					onViewChange={(page)=>this.updateCurrentViewPage(page)}
					editorTheme={this.state.editorTheme}
					renderer={this.props.brew.renderer}
					style={{  height: `calc(100% - ${this.state.snippetBarHeight}px)` }}/>
			</>;
		}
		if(this.isStyle()){
			return <>
				<CodeEditor key='codeEditor'
					ref={this.codeEditor}
					language='css'
					tab='brewStyles'
					view={this.state.view}
					value={this.props.brew.style ?? DEFAULT_STYLE_TEXT}
					onChange={this.props.onBrewChange('style')}
					editorTheme={this.state.editorTheme}
					renderer={this.props.brew.renderer}
					style={{  height: `calc(100% - ${this.state.snippetBarHeight}px)` }}/>
			</>;
		}
		if(this.isMeta()){
			return <>
				<CodeEditor key='codeEditor'
					view={this.state.view}
					style={{ display: 'none' }}/>
				<MetadataEditor
					metadata={this.props.brew}
					themeBundle={this.props.themeBundle}
					onChange={this.props.onBrewChange('metadata')}
					reportError={this.props.reportError}
					userThemes={this.props.userThemes}/>
			</>;
		}
		if(this.isSnip()){
			if(!this.props.brew.snippets) { this.props.brew.snippets = DEFAULT_SNIPPET_TEXT; }
			return <>
				<CodeEditor key='codeEditor'
					ref={this.codeEditor}
					language='gfm'
					tab='brewSnippets'
					view={this.state.view}
					value={this.props.brew.snippets}
					onChange={this.props.onBrewChange('snippets')}
					enableFolding={true}
					editorTheme={this.state.editorTheme}
					renderer={this.props.brew.renderer}
					rerenderParent={this.rerenderParent}
					style={{  height: `calc(100% - 25px)` }}/>
			</>;
		}
	},

	redo : function(){
		return this.codeEditor.current?.redo();
	},

	historySize : function(){
		return this.codeEditor.current?.historySize();
	},

	undo : function(){
		return this.codeEditor.current?.undo();
	},

	foldCode : function() {
    	return this.codeEditor.current?.foldAll();
	},

	unfoldCode : function() {
		return this.codeEditor.current?.unfoldAll();
	},
	render : function(){
		return (
			<div className='editor' ref={this.editor}>
				<SnippetBar
					brew={this.props.brew}
					view={this.state.view}
					onViewChange={this.handleViewChange}
					onInject={this.handleInject}
					showEditButtons={this.props.showEditButtons}
					renderer={this.props.renderer}
					theme={this.props.brew.theme}
					undo={this.undo}
					redo={this.redo}
					foldCode={this.foldCode}
					unfoldCode={this.unfoldCode}
					historySize={this.historySize()}
					currentEditorTheme={this.state.editorTheme}
					updateEditorTheme={this.updateEditorTheme}
					themeBundle={this.props.themeBundle}
					cursorPos={this.codeEditor.current?.getCursorPosition() || {}}
					updateBrew={this.props.updateBrew}
				/>

				{this.renderEditor()}
			</div>
		);
	}
});

export default Editor;