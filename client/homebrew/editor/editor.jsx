/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./editor.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');
const dedent = require('dedent-tabs').default;

const CodeEditor = require('naturalcrit/codeEditor/codeEditor.jsx');
const SnippetBar = require('./snippetbar/snippetbar.jsx');
const MetadataEditor = require('./metadataEditor/metadataEditor.jsx');

const SNIPPETBAR_HEIGHT = 25;
const DEFAULT_STYLE_TEXT = dedent`
				/*=======---  Example CSS styling  ---=======*/
				/* Any CSS here will apply to your document! */

				.myExampleClass {
					color: black;
				}`;

const splice = function(str, index, inject){
	return str.slice(0, index) + inject + str.slice(index);
};



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

			renderer : 'legacy'
		};
	},
	getInitialState : function() {
		return {
			view : 'text' //'text', 'style', 'meta'
		};
	},

	isText  : function() {return this.state.view == 'text';},
	isStyle : function() {return this.state.view == 'style';},
	isMeta  : function() {return this.state.view == 'meta';},

	componentDidMount : function() {
		this.updateEditorSize();
		this.highlightCustomMarkdown();
		window.addEventListener('resize', this.updateEditorSize);
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
		if(this.refs.codeEditor) {
			let paneHeight = this.refs.main.parentNode.clientHeight;
			paneHeight -= SNIPPETBAR_HEIGHT + 1;
			this.refs.codeEditor.codeMirror.setSize(null, paneHeight);
		}
	},

	handleInject : function(injectText){
		let text;
		if(this.isText())  text = this.props.brew.text;
		if(this.isStyle()) text = this.props.brew.style ?? DEFAULT_STYLE_TEXT;

		const lines = text.split('\n');
		const cursorPos = this.refs.codeEditor.getCursorPosition();
		lines[cursorPos.line] = splice(lines[cursorPos.line], cursorPos.ch, injectText);

		const injectLines = injectText.split('\n');
		this.refs.codeEditor.setCursorPosition(cursorPos.line + injectLines.length, cursorPos.ch  + injectLines[injectLines.length - 1].length);

		if(this.isText())  this.props.onTextChange(lines.join('\n'));
		if(this.isStyle()) this.props.onStyleChange(lines.join('\n'));
	},

	handleViewChange : function(newView){
		this.props.setMoveArrows(newView === 'text');
		this.setState({
			view : newView
		}, this.updateEditorSize);	//TODO: not sure if updateeditorsize needed
	},

	getCurrentPage : function(){
		const lines = this.props.brew.text.split('\n').slice(0, this.refs.codeEditor.getCursorPosition().line + 1);
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
		if(!this.refs.codeEditor) return;
		if(this.state.view === 'text')  {
			const codeMirror = this.refs.codeEditor.codeMirror;

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

						// Highlight inline spans {{content}}
						if(line.includes('{{') && line.includes('}}')){
							const regex = /{{(?::(?:"[\w,\-()#%. ]*"|[\w\,\-()#%.]*)|[^"'{}\s])*\s*|}}/g;
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

							const match = line.match(/^ *{{(?::(?:"[\w,\-()#%. ]*"|[\w\,\-()#%.]*)|[^"'{}\s])* *$|^ *}}$/);
							if(match)
								endCh = match.index+match[0].length;
							codeMirror.markText({ line: lineNumber, ch: 0 }, { line: lineNumber, ch: endCh }, { className: 'block' });
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

				let currentY = this.refs.codeEditor.codeMirror.getScrollInfo().top;
				let targetY  = this.refs.codeEditor.codeMirror.heightAtLine(targetLine, 'local', true);

				//Scroll 1/10 of the way every 10ms until 1px off.
				const incrementalScroll = setInterval(()=>{
					currentY += (targetY - currentY) / 10;
					this.refs.codeEditor.codeMirror.scrollTo(null, currentY);

					// Update target: target height is not accurate until within +-10 lines of the visible window
					if(Math.abs(targetY - currentY > 100))
						targetY = this.refs.codeEditor.codeMirror.heightAtLine(targetLine, 'local', true);

					// End when close enough
					if(Math.abs(targetY - currentY) < 1) {
						this.refs.codeEditor.codeMirror.scrollTo(null, targetY);  // Scroll any remaining difference
						this.refs.codeEditor.setCursorPosition({ line: targetLine + 1, ch: 0 });
						this.refs.codeEditor.codeMirror.addLineClass(targetLine + 1, 'wrap', 'sourceMoveFlash');
						clearInterval(incrementalScroll);
					}
				}, 10);
			}
		}
	},

	//Called when there are changes to the editor's dimensions
	update : function(){
		this.refs.codeEditor?.updateSize();
	},

	//Called by CodeEditor after document switch, so Snippetbar can refresh UndoHistory
	rerenderParent : function (){
		this.forceUpdate();
	},

	renderEditor : function(){
		if(this.isText()){
			return <>
				<CodeEditor key='codeEditor'
					ref='codeEditor'
					language='gfm'
					view={this.state.view}
					value={this.props.brew.text}
					onChange={this.props.onTextChange}
					rerenderParent={this.rerenderParent} />
			</>;
		}
		if(this.isStyle()){
			return <>
				<CodeEditor key='codeEditor'
					ref='codeEditor'
					language='css'
					view={this.state.view}
					value={this.props.brew.style ?? DEFAULT_STYLE_TEXT}
					onChange={this.props.onStyleChange}
					enableFolding={false}
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
					onChange={this.props.onMetaChange} />
			</>;
		}
	},

	redo : function(){
		return this.refs.codeEditor?.redo();
	},

	historySize : function(){
		return this.refs.codeEditor?.historySize();
	},

	undo : function(){
		return this.refs.codeEditor?.undo();
	},

	render : function(){
		return (
			<div className='editor' ref='main'>
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
					historySize={this.historySize()} />

				{this.renderEditor()}
			</div>
		);
	}
});

module.exports = Editor;
