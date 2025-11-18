/*eslint max-lines: ["warn", {"max": 500, "skipBlankLines": true, "skipComments": true}]*/
require('./editor.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const dedent = require('dedent-tabs').default;
import Markdown from '../../../shared/markdown.js';

const CodeEditor = require('client/components/codeEditor/codeEditor.jsx');
const SnippetBar = require('./snippetbar/snippetbar.jsx');
const MetadataEditor = require('./metadataEditor/metadataEditor.jsx');

const EDITOR_THEME_KEY = 'HB_editor_theme';

const PAGEBREAK_REGEX_V3 = /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m;
const SNIPPETBREAK_REGEX_V3 = /^\\snippet\ .*$/;
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

const Editor = createClass({
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

		this.highlightCustomMarkdown();
		document.getElementById('BrewRenderer').addEventListener('keydown', this.handleControlKeys);
		document.addEventListener('keydown', this.handleControlKeys);

		this.codeEditor.current.codeMirror.on('cursorActivity', (cm)=>{this.updateCurrentCursorPage(cm.getCursor());});
		this.codeEditor.current.codeMirror.on('scroll', _.throttle(()=>{this.updateCurrentViewPage(this.codeEditor.current.getTopVisibleLine());}, 200));

		const editorTheme = window.localStorage.getItem(EDITOR_THEME_KEY);
		if(editorTheme) {
			this.setState({
				editorTheme : editorTheme
			});
		}
		const snippetBar = document.querySelector('.editor > .snippetBar');
		if (!snippetBar) return;

		this.resizeObserver = new ResizeObserver(entries => {
			const height = document.querySelector('.editor > .snippetBar').offsetHeight;
			this.setState({ snippetBarHeight: height });
		});

		this.resizeObserver.observe(snippetBar);
	},

	componentDidUpdate : function(prevProps, prevState, snapshot) {

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
		if (this.resizeObserver) this.resizeObserver.disconnect();
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

	updateCurrentCursorPage : function(cursor) {
		const lines = this.props.brew.text.split('\n').slice(1, cursor.line + 1);
		const pageRegex = this.props.brew.renderer == 'V3' ? PAGEBREAK_REGEX_V3 : /\\page/;
		const currentPage = lines.reduce((count, line)=>count + (pageRegex.test(line) ? 1 : 0), 1);
		this.props.onCursorPageChange(currentPage);
	},

	updateCurrentViewPage : function(topScrollLine) {
		const lines = this.props.brew.text.split('\n').slice(1, topScrollLine + 1);
		const pageRegex = this.props.brew.renderer == 'V3' ? PAGEBREAK_REGEX_V3 : /\\page/;
		const currentPage = lines.reduce((count, line)=>count + (pageRegex.test(line) ? 1 : 0), 1);
		this.props.onViewPageChange(currentPage);
	},

	handleInject : function(injectText){
		this.codeEditor.current?.injectText(injectText, false);
	},

	handleViewChange : function(newView){
		this.props.setMoveArrows(newView === 'text');

		this.setState({
			view : newView
		}, ()=>{
			this.codeEditor.current?.codeMirror.focus();
		});
	},

	highlightCustomMarkdown : function(){
		if(!this.codeEditor.current) return;
		if((this.state.view === 'text') ||(this.state.view === 'snippet')) {
			const codeMirror = this.codeEditor.current.codeMirror;

			codeMirror.operation(()=>{ // Batch CodeMirror styling

				const foldLines = [];

				//reset custom text styles
				const customHighlights = codeMirror.getAllMarks().filter((mark)=>{
					// Record details of folded sections
					if(mark.__isFold) {
						const fold = mark.find();
						foldLines.push({ from: fold.from?.line, to: fold.to?.line });
					}
					return !mark.__isFold;
				}); //Don't undo code folding

				for (let i=customHighlights.length - 1;i>=0;i--) customHighlights[i].clear();

				let userSnippetCount = 1; // start snippet count from snippet 1
				let editorPageCount = 1; // start page count from page 1

				const whichSource = this.state.view === 'text' ? this.props.brew.text : this.props.brew.snippets;
				_.forEach(whichSource?.split('\n'), (line, lineNumber)=>{

					const tabHighlight = this.state.view === 'text' ? 'pageLine' : 'snippetLine';
					const textOrSnip = this.state.view === 'text';

					//reset custom line styles
					codeMirror.removeLineClass(lineNumber, 'background', 'pageLine');
					codeMirror.removeLineClass(lineNumber, 'background', 'snippetLine');
					codeMirror.removeLineClass(lineNumber, 'text');
					codeMirror.removeLineClass(lineNumber, 'wrap', 'sourceMoveFlash');

					// Don't process lines inside folded text
					// If the current lineNumber is inside any folded marks, skip line styling
					if(foldLines.some((fold)=>lineNumber >= fold.from && lineNumber <= fold.to))
						return;

					// Styling for \page breaks
					if((this.props.renderer == 'legacy' && line.includes('\\page')) ||
				     (this.props.renderer == 'V3'     && line.match(textOrSnip ? PAGEBREAK_REGEX_V3 : SNIPPETBREAK_REGEX_V3))) {

						if((lineNumber > 0) && (textOrSnip))      // Since \page is optional on first line of document,
							editorPageCount += 1; // don't use it to increment page count; stay at 1
						else if(this.state.view !== 'text')	userSnippetCount += 1;

						// add back the original class 'background' but also add the new class '.pageline'
						codeMirror.addLineClass(lineNumber, 'background', tabHighlight);
						const pageCountElement = Object.assign(document.createElement('span'), {
							className   : 'editor-page-count',
							textContent : textOrSnip ? editorPageCount : userSnippetCount
						});
						codeMirror.setBookmark({ line: lineNumber, ch: line.length }, pageCountElement);
					};


					// New Codemirror styling for V3 renderer
					if(this.props.renderer === 'V3') {
						if(line.match(/^\\column(?:break)?$/)){
							codeMirror.addLineClass(lineNumber, 'text', 'columnSplit');
						}

						// definition lists
						if(line.includes('::')){
							if(/^:*$/.test(line) == true){ return; };
							const regex = /^([^\n]*?:?\s?)(::[^\n]*)(?:\n|$)/ymd;  // the `d` flag, for match indices, throws an ESLint error.
							let match;
							while ((match = regex.exec(line)) != null){
								codeMirror.markText({ line: lineNumber, ch: match.indices[0][0] }, { line: lineNumber, ch: match.indices[0][1] }, { className: 'dl-highlight' });
								codeMirror.markText({ line: lineNumber, ch: match.indices[1][0] }, { line: lineNumber, ch: match.indices[1][1] }, { className: 'dt-highlight' });
								codeMirror.markText({ line: lineNumber, ch: match.indices[2][0] }, { line: lineNumber, ch: match.indices[2][1] }, { className: 'dd-highlight' });
								const ddIndex = match.indices[2][0];
								const colons = /::/g;
								const colonMatches = colons.exec(match[2]);
								if(colonMatches !== null){
									codeMirror.markText({ line: lineNumber, ch: colonMatches.index + ddIndex }, { line: lineNumber, ch: colonMatches.index + colonMatches[0].length + ddIndex }, { className: 'dl-colon-highlight' });
								}
							}
						}

						// Subscript & Superscript
						if(line.includes('^')) {
							let startIndex = line.indexOf('^');
							const superRegex = /\^(?!\s)(?=([^\n\^]*[^\s\^]))\1\^/gy;
							const subRegex   = /\^\^(?!\s)(?=([^\n\^]*[^\s\^]))\1\^\^/gy;

							while (startIndex >= 0) {
								superRegex.lastIndex = subRegex.lastIndex = startIndex;
								let isSuper = false;
								const match = subRegex.exec(line) || superRegex.exec(line);
								if(match) {
									isSuper = !subRegex.lastIndex;
									codeMirror.markText({ line: lineNumber, ch: match.index }, { line: lineNumber, ch: match.index + match[0].length }, { className: isSuper ? 'superscript' : 'subscript' });
								}
								startIndex = line.indexOf('^', Math.max(startIndex + 1, subRegex.lastIndex, superRegex.lastIndex));
							}
						}

						// Highlight injectors {style}
						if(line.includes('{') && line.includes('}')){
							const regex = /(?:^|[^{\n])({(?=((?:[:=](?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':={}\s]*)*))\2})/gm;
							let match;
							while ((match = regex.exec(line)) != null) {
								codeMirror.markText({ line: lineNumber, ch: line.indexOf(match[1]) }, { line: lineNumber, ch: line.indexOf(match[1]) + match[1].length }, { className: 'injection' });
							}
						}
						// Highlight inline spans {{content}}
						if(line.includes('{{') && line.includes('}}')){
							const regex = /{{(?=((?:[:=](?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':={}\s]*)*))\1 *|}}/g;
							let match;
							let blockCount = 0;
							while ((match = regex.exec(line)) != null) {
								if(match[0].startsWith('{')) {
									blockCount += 1;
								} else {
									blockCount -= 1;
								}
								if(blockCount < 0) {
									blockCount = 0;
									continue;
								}
								codeMirror.markText({ line: lineNumber, ch: match.index }, { line: lineNumber, ch: match.index + match[0].length }, { className: 'inline-block' });
							}
						} else if(line.trimLeft().startsWith('{{') || line.trimLeft().startsWith('}}')){
							// Highlight block divs {{\n Content \n}}
							let endCh = line.length+1;

							const match = line.match(/^ *{{(?=((?:[:=](?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':={}\s]*)*))\1 *$|^ *}}$/);
							if(match)
								endCh = match.index+match[0].length;
							codeMirror.markText({ line: lineNumber, ch: 0 }, { line: lineNumber, ch: endCh }, { className: 'block' });
						}

						// Emojis
						if(line.match(/:[^\s:]+:/g)) {
							let startIndex = line.indexOf(':');
							const emojiRegex = /:[^\s:]+:/gy;

							while (startIndex >= 0) {
								emojiRegex.lastIndex = startIndex;
								const match = emojiRegex.exec(line);
								if(match) {
									let tokens = Markdown.marked.lexer(match[0]);
									tokens = tokens[0].tokens.filter((t)=>t.type == 'emoji');
									if(!tokens.length)
										return;

									const startPos = { line: lineNumber, ch: match.index };
									const endPos   = { line: lineNumber, ch: match.index + match[0].length };

									// Iterate over conflicting marks and clear them
									const marks = codeMirror.findMarks(startPos, endPos);
									marks.forEach(function(marker) {
										if(!marker.__isFold) marker.clear();
									});
									codeMirror.markText(startPos, endPos, { className: 'emoji' });
								}
								startIndex = line.indexOf(':', Math.max(startIndex + 1, emojiRegex.lastIndex));
							}
						}
					}
				});
			});
		}
	},

	brewJump : function(targetPage=this.props.currentEditorCursorPageNum, smooth=true){
		if(!window || !this.isText() || isJumping)
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
				brewRenderer.removeEventListener('scroll', checkIfScrollComplete);
			}, 150);	// If 150 ms pass without a brewRenderer scroll event, assume scrolling is done
		};

		isJumping = true;
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
		if(!this.isText() || isJumping)
			return;

		const textSplit  = this.props.renderer == 'V3' ? PAGEBREAK_REGEX_V3 : /\\page/;
		const textString = this.props.brew.text.split(textSplit).slice(0, targetPage-1).join(textSplit);
		const targetLine = textString.match('\n') ? textString.split('\n').length - 1 : -1;

		let currentY = this.codeEditor.current.codeMirror.getScrollInfo().top;
		let targetY  = this.codeEditor.current.codeMirror.heightAtLine(targetLine, 'local', true);

		let scrollingTimeout;
		const checkIfScrollComplete = ()=>{ // Prevent interrupting a scroll in progress if user clicks multiple times
			clearTimeout(scrollingTimeout); // Reset the timer every time a scroll event occurs
			scrollingTimeout = setTimeout(()=>{
				isJumping = false;
				this.codeEditor.current.codeMirror.off('scroll', checkIfScrollComplete);
			}, 150); // If 150 ms pass without a scroll event, assume scrolling is done
		};

		isJumping = true;
		checkIfScrollComplete();
		this.codeEditor.current.codeMirror.on('scroll', checkIfScrollComplete);

		if(smooth) {
			//Scroll 1/10 of the way every 10ms until 1px off.
			const incrementalScroll = setInterval(()=>{
				currentY += (targetY - currentY) / 10;
				this.codeEditor.current.codeMirror.scrollTo(null, currentY);

				// Update target: target height is not accurate until within +-10 lines of the visible window
				if(Math.abs(targetY - currentY > 100))
					targetY = this.codeEditor.current.codeMirror.heightAtLine(targetLine, 'local', true);

				// End when close enough
				if(Math.abs(targetY - currentY) < 1) {
					this.codeEditor.current.codeMirror.scrollTo(null, targetY);  // Scroll any remaining difference
					this.codeEditor.current.setCursorPosition({ line: targetLine + 1, ch: 0 });
					this.codeEditor.current.codeMirror.addLineClass(targetLine + 1, 'wrap', 'sourceMoveFlash');
					clearInterval(incrementalScroll);
				}
			}, 10);
		} else {
			this.codeEditor.current.codeMirror.scrollTo(null, targetY);  // Scroll any remaining difference
			this.codeEditor.current.setCursorPosition({ line: targetLine + 1, ch: 0 });
			this.codeEditor.current.codeMirror.addLineClass(targetLine + 1, 'wrap', 'sourceMoveFlash');
		}
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
					view={this.state.view}
					value={this.props.brew.text}
					onChange={this.props.onBrewChange('text')}
					editorTheme={this.state.editorTheme}
					rerenderParent={this.rerenderParent}
					style={{  height: `calc(100% - ${this.state.snippetBarHeight}px)` }} />
			</>;
		}
		if(this.isStyle()){
			return <>
				<CodeEditor key='codeEditor'
					ref={this.codeEditor}
					language='css'
					view={this.state.view}
					value={this.props.brew.style ?? DEFAULT_STYLE_TEXT}
					onChange={this.props.onBrewChange('style')}
					enableFolding={true}
					editorTheme={this.state.editorTheme}
					rerenderParent={this.rerenderParent}
					style={{  height: `calc(100% - ${this.state.snippetBarHeight}px)` }} />
			</>;
		}
		if(this.isMeta()){
			return <>
				<CodeEditor key='codeEditor'
					view={this.state.view}
					style={{ display: 'none' }}
					rerenderParent={this.rerenderParent} />
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
					view={this.state.view}
					value={this.props.brew.snippets}
					onChange={this.props.onBrewChange('snippets')}
					enableFolding={true}
					editorTheme={this.state.editorTheme}
					rerenderParent={this.rerenderParent}
					style={{  height: `calc(100% -${this.state.snippetBarHeight}px)` }} />
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

	foldCode : function(){
		return this.codeEditor.current?.foldAllCode();
	},

	unfoldCode : function(){
		return this.codeEditor.current?.unfoldAllCode();
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

module.exports = Editor;
