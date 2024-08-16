/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./editor.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');
const dedent = require('dedent-tabs').default;
const Markdown = require('../../../shared/naturalcrit/markdown.js');

const CodeEditor = require('naturalcrit/codeEditor/codeEditor.jsx');
const SnippetBar = require('./snippetbar/snippetbar.jsx');
const MetadataEditor = require('./metadataEditor/metadataEditor.jsx');

const EDITOR_THEME_KEY = 'HOMEBREWERY-EDITOR-THEME';

const SNIPPETBAR_HEIGHT = 25;
const DEFAULT_STYLE_TEXT = dedent`
				/*=======---  Example CSS styling  ---=======*/
				/* Any CSS here will apply to your document! */

				.myExampleClass {
					color: black;
				}`;


const Editor = createClass({
	displayName     : 'Editor',
	getDefaultProps : function() {
		return {
			brew : {
				text  : '',
				style : ''
			},

			onTextChange  : ()=>{},
			onStyleChange : ()=>{},
			onMetaChange  : ()=>{},
			reportError   : ()=>{},

			editorTheme : 'default',
			renderer    : 'legacy'
		};
	},
	getInitialState : function() {
		return {
			editorTheme : this.props.editorTheme,
			view        : 'text' //'text', 'style', 'meta'
		};
	},

	editor     : React.createRef(null),
	codeEditor : React.createRef(null),

	isText  : function() {return this.state.view == 'text';},
	isStyle : function() {return this.state.view == 'style';},
	isMeta  : function() {return this.state.view == 'meta';},

	componentDidMount : function() {
		this.updateEditorSize();
		this.highlightCustomMarkdown();
		window.addEventListener('resize', this.updateEditorSize);

		const editorTheme = window.localStorage.getItem(EDITOR_THEME_KEY);
		if(editorTheme) {
			this.setState({
				editorTheme : editorTheme
			});
		}
	},

	componentWillUnmount : function() {
		window.removeEventListener('resize', this.updateEditorSize);
	},

	componentDidUpdate : function(prevProps, prevState, snapshot) {
		this.highlightCustomMarkdown();
		if(prevProps.moveBrew !== this.props.moveBrew) {
			this.brewJump();
		};
		if(prevProps.moveSource !== this.props.moveSource) {
			this.sourceJump();
		};
	},

	updateEditorSize : function() {
		if(this.codeEditor.current) {
			let paneHeight = this.editor.current.parentNode.clientHeight;
			paneHeight -= SNIPPETBAR_HEIGHT;
			this.codeEditor.current.codeMirror.setSize(null, paneHeight);
		}
	},

	handleInject : function(injectText){
		this.codeEditor.current?.injectText(injectText, false);
	},

	handleViewChange : function(newView){
		this.props.setMoveArrows(newView === 'text');
		this.setState({
			view : newView
		}, this.updateEditorSize);	//TODO: not sure if updateeditorsize needed
	},

	getCurrentPage : function(){
		const lines = this.props.brew.text.split('\n').slice(0, this.codeEditor.current.getCursorPosition().line + 1);
		return _.reduce(lines, (r, line)=>{
			if(
				(this.props.renderer == 'legacy' && line.indexOf('\\page') !== -1)
				||
				(this.props.renderer == 'V3' && line.match(/^\\page$/))
			) r++;
			return r;
		}, 1);
	},

	highlightCustomMarkdown : function(){
		if(!this.codeEditor.current) return;
		if(this.state.view === 'text')  {
			const codeMirror = this.codeEditor.current.codeMirror;

			codeMirror.operation(()=>{ // Batch CodeMirror styling
				//reset custom text styles
				const customHighlights = codeMirror.getAllMarks().filter((mark)=>!mark.__isFold); //Don't undo code folding
				for (let i=customHighlights.length - 1;i>=0;i--) customHighlights[i].clear();

				let editorPageCount = 2; // start page count from page 2

				_.forEach(this.props.brew.text.split('\n'), (line, lineNumber)=>{

					//reset custom line styles
					codeMirror.removeLineClass(lineNumber, 'background', 'pageLine');
					codeMirror.removeLineClass(lineNumber, 'text');
					codeMirror.removeLineClass(lineNumber, 'wrap', 'sourceMoveFlash');

					// Styling for \page breaks
					if((this.props.renderer == 'legacy' && line.includes('\\page')) ||
				     (this.props.renderer == 'V3'     && line.match(/^\\page$/))) {

						// add back the original class 'background' but also add the new class '.pageline'
						codeMirror.addLineClass(lineNumber, 'background', 'pageLine');
						const pageCountElement = Object.assign(document.createElement('span'), {
							className   : 'editor-page-count',
							textContent : editorPageCount
						});
						codeMirror.setBookmark({ line: lineNumber, ch: line.length }, pageCountElement);

						editorPageCount += 1;
					};

					// New Codemirror styling for V3 renderer
					if(this.props.renderer == 'V3') {
						if(line.match(/^\\column$/)){
							codeMirror.addLineClass(lineNumber, 'text', 'columnSplit');
						}

						// definition lists
						if(line.includes('::')){
							if(/^:*$/.test(line) == true){ return };
							const regex = /^([^\n]*?:?\s?)(::[^\n]*)(?:\n|$)/ymd;  // the `d` flag, for match indices, throws an ESLint error.
							let match;
							while ((match = regex.exec(line)) != null){
								codeMirror.markText({ line: lineNumber, ch: match.indices[0][0] }, { line: lineNumber, ch: match.indices[0][1] }, { className: 'dl-highlight' });
								codeMirror.markText({ line: lineNumber, ch: match.indices[1][0] }, { line: lineNumber, ch: match.indices[1][1] }, { className: 'dt-highlight' });
								codeMirror.markText({ line: lineNumber, ch: match.indices[2][0] }, { line: lineNumber, ch: match.indices[2][1] }, { className: 'dd-highlight' });
								const ddIndex = match.indices[2][0];
								let colons = /::/g;
								let colonMatches = colons.exec(match[2]);
								if(colonMatches !== null){
									codeMirror.markText({ line: lineNumber, ch: colonMatches.index + ddIndex }, { line: lineNumber, ch: colonMatches.index + colonMatches[0].length + ddIndex }, { className: 'dl-colon-highlight'} )
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
								let match = subRegex.exec(line) || superRegex.exec(line);
								if (match) {
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
								let match = emojiRegex.exec(line);
								if (match) {
									let tokens = Markdown.marked.lexer(match[0]);
									tokens = tokens[0].tokens.filter(t => t.type == 'emoji')
									if (!tokens.length)
										return;

									let startPos = { line: lineNumber, ch: match.index };
									let endPos   = { line: lineNumber, ch: match.index + match[0].length };

									// Iterate over conflicting marks and clear them
									var marks = codeMirror.findMarks(startPos, endPos);
									marks.forEach(function(marker) {
										marker.clear();
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

	brewJump : function(targetPage=this.getCurrentPage()){
		if(!window) return;
		// console.log(`Scroll to: p${targetPage}`);
		const brewRenderer = window.frames['BrewRenderer'].contentDocument.getElementsByClassName('brewRenderer')[0];
		const currentPos = brewRenderer.scrollTop;
		const targetPos = window.frames['BrewRenderer'].contentDocument.getElementById(`p${targetPage}`).getBoundingClientRect().top;
		const interimPos = targetPos >= 0 ? -30 : 30;

		const bounceDelay = 100;
		const scrollDelay = 500;

		if(!this.throttleBrewMove) {
			this.throttleBrewMove = _.throttle((currentPos, interimPos, targetPos)=>{
				brewRenderer.scrollTo({ top: currentPos + interimPos, behavior: 'smooth' });
				setTimeout(()=>{
					brewRenderer.scrollTo({ top: currentPos + targetPos, behavior: 'smooth', block: 'start' });
				}, bounceDelay);
			}, scrollDelay, { leading: true, trailing: false });
		};
		this.throttleBrewMove(currentPos, interimPos, targetPos);

		// const hashPage = (page != 1) ? `p${page}` : '';
		// window.location.hash = hashPage;
	},

	sourceJump : function(targetLine=null){
		if(this.isText()) {
			if(targetLine == null) {
				targetLine = 0;

				const pageCollection = window.frames['BrewRenderer'].contentDocument.getElementsByClassName('page');
				const brewRendererHeight = window.frames['BrewRenderer'].contentDocument.getElementsByClassName('brewRenderer').item(0).getBoundingClientRect().height;

				let currentPage = 1;
				for (const page of pageCollection) {
					if(page.getBoundingClientRect().bottom > (brewRendererHeight / 2)) {
						currentPage = parseInt(page.id.slice(1)) || 1;
						break;
					}
				}

				const textSplit = this.props.renderer == 'V3' ? /^\\page$/gm : /\\page/;
				const textString = this.props.brew.text.split(textSplit).slice(0, currentPage-1).join(textSplit);
				const textPosition = textString.length;
				const lineCount = textString.match('\n') ? textString.slice(0, textPosition).split('\n').length : 0;

				targetLine = lineCount - 1; //Scroll to `\page`, which is one line back.

				let currentY = this.codeEditor.current.codeMirror.getScrollInfo().top;
				let targetY  = this.codeEditor.current.codeMirror.heightAtLine(targetLine, 'local', true);

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
			}
		}
	},

	//Called when there are changes to the editor's dimensions
	update : function(){
		this.codeEditor.current?.updateSize();
	},

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
					onChange={this.props.onTextChange}
					editorTheme={this.state.editorTheme}
					rerenderParent={this.rerenderParent} />
			</>;
		}
		if(this.isStyle()){
			return <>
				<CodeEditor key='codeEditor'
					ref={this.codeEditor}
					language='css'
					view={this.state.view}
					value={this.props.brew.style ?? DEFAULT_STYLE_TEXT}
					onChange={this.props.onStyleChange}
					enableFolding={true}
					editorTheme={this.state.editorTheme}
					rerenderParent={this.rerenderParent} />
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
					onChange={this.props.onMetaChange}
					reportError={this.props.reportError}
					userThemes={this.props.userThemes}/>
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
					snippetBundle={this.props.snippetBundle}
					cursorPos={this.codeEditor.current?.getCursorPosition() || {}} />

				{this.renderEditor()}
			</div>
		);
	}
});

module.exports = Editor;
