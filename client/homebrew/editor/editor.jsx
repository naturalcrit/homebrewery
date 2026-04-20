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

import * as themesImport from '@uiw/codemirror-themes-all';
import defaultCM5Theme from '@themes/codeMirror/default.js';
import darkbrewery from '@themes/codeMirror/darkbrewery.js';

const themes = { default: defaultCM5Theme, darkbrewery, ...themesImport };

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