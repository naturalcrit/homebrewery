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

	updateEditorSize : function() {
		if(this.refs.codeEditor) {
			let paneHeight = this.refs.main.parentNode.clientHeight;
			paneHeight -= SNIPPETBAR_HEIGHT + 1;
			this.refs.codeEditor.codeMirror.setSize(null, paneHeight);
		}
	},

	handleInject : function(injectText){
		const text = (this.isText() ? this.props.brew.text : this.props.brew.style);

		const lines = text.split('\n');
		const cursorPos = this.refs.codeEditor.getCursorPosition();
		lines[cursorPos.line] = splice(lines[cursorPos.line], cursorPos.ch, injectText);

		this.refs.codeEditor.setCursorPosition(cursorPos.line + injectText.split('\n').length, cursorPos.ch  + injectText.length);

		if(this.isText()) this.props.onTextChange(lines.join('\n'));
		if(this.isStyle()) this.props.onStyleChange(lines.join('\n'));
	},

	handleViewChange : function(newView){
		this.setState({
			view : newView
		}, this.updateEditorSize);	//TODO: not sure if updateeditorsize needed
	},

	getCurrentPage : function(){
		const lines = this.props.brew.text.split('\n').slice(0, this.cursorPosition.line + 1);
		return _.reduce(lines, (r, line)=>{
			if(line.indexOf('\\page') !== -1) r++;
			return r;
		}, 1);
	},

	highlightCustomMarkdown : function(){
		if(!this.refs.codeEditor) return;
		if(this.state.view === 'text')  {
			const codeMirror = this.refs.codeEditor.codeMirror;

			//reset custom text styles
			const customHighlights = codeMirror.getAllMarks();
			for (let i=0;i<customHighlights.length;i++) customHighlights[i].clear();

			const lineNumbers = _.reduce(this.props.brew.text.split('\n'), (r, line, lineNumber)=>{

				//reset custom line styles
				codeMirror.removeLineClass(lineNumber, 'background');
				codeMirror.removeLineClass(lineNumber, 'text');

				// Legacy Codemirror styling
				if(this.props.renderer == 'legacy') {
					if(line.includes('\\page')){
						codeMirror.addLineClass(lineNumber, 'background', 'pageLine');
						r.push(lineNumber);
					}
				}

				// New Codemirror styling for V3 renderer
				if(this.props.renderer == 'V3') {
					if(line.startsWith('\\page')){
						codeMirror.addLineClass(lineNumber, 'background', 'pageLine');
						r.push(lineNumber);
					}

					if(line.match(/^\\column$/)){
						codeMirror.addLineClass(lineNumber, 'text', 'columnSplit');
						r.push(lineNumber);
					}

					// Highlight inline spans {{content}}
					if(line.includes('{{') && line.includes('}}')){
						const regex = /{{(?:="[\w,\-. ]*"|[^"'\s])*\s*|}}/g;
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

						const match = line.match(/^ *{{(?:="[\w,\-. ]*"|[^"'\s])*$|^ *}}$/);
						if(match)
							endCh = match.index+match[0].length;
						codeMirror.markText({ line: lineNumber, ch: 0 }, { line: lineNumber, ch: endCh }, { className: 'block' });
					}
				}

				return r;
			}, []);
			return lineNumbers;
		}
	},

	brewJump : function(){
		const currentPage = this.getCurrentPage();
		window.location.hash = `p${currentPage}`;
	},

	//Called when there are changes to the editor's dimensions
	update : function(){
		this.refs.codeEditor.updateSize();
	},

	renderEditor : function(){
		if(this.isText()){
			return <CodeEditor key='text'
				ref='codeEditor'
				language='gfm'
				value={this.props.brew.text}
				onChange={this.props.onTextChange} />;
		}
		if(this.isStyle()){
			return <CodeEditor key='style'
				ref='codeEditor'
				language='css'
				value={this.props.brew.style ?? DEFAULT_STYLE_TEXT}
				onChange={this.props.onStyleChange} />;
		}
		if(this.isMeta()){
			return <MetadataEditor
				metadata={this.props.brew}
				onChange={this.props.onMetaChange} />;
		}
	},

	render : function(){
		this.highlightCustomMarkdown();
		return (
			<div className='editor' ref='main'>
				<SnippetBar
					brew={this.props.brew}
					view={this.state.view}
					onViewChange={this.handleViewChange}
					onInject={this.handleInject}
					showEditButtons={this.props.showEditButtons}
					renderer={this.props.renderer} />

				{this.renderEditor()}
			</div>
		);
	}
});

module.exports = Editor;
