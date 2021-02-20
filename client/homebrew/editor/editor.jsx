require('./editor.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

const CodeEditor = require('naturalcrit/codeEditor/codeEditor.jsx');
const SnippetBar = require('./snippetbar/snippetbar.jsx');
const MetadataEditor = require('./metadataEditor/metadataEditor.jsx');


const splice = function(str, index, inject){
	return str.slice(0, index) + inject + str.slice(index);
};

const SNIPPETBAR_HEIGHT = 25;

const Editor = createClass({
	getDefaultProps : function() {
		return {
			brew     : {},
			onChange : ()=>{},

			onMetadataChange : ()=>{},
			showMetaButton   : true,
			renderer         : 'legacy'
		};
	},
	getInitialState : function() {
		return {
			showMetadataEditor : false
		};
	},
	cursorPosition : {
		line : 0,
		ch   : 0
	},

	componentDidMount : function() {
		this.updateEditorSize();
		this.highlightCustomMarkdown();
		window.addEventListener('resize', this.updateEditorSize);
	},
	componentWillUnmount : function() {
		window.removeEventListener('resize', this.updateEditorSize);
	},

	updateEditorSize : function() {
		let paneHeight = this.refs.main.parentNode.clientHeight;
		paneHeight -= SNIPPETBAR_HEIGHT + 1;
		this.refs.codeEditor.codeMirror.setSize(null, paneHeight);
	},

	handleTextChange : function(text){
		this.props.onChange(text);
	},
	handleCursorActivty : function(curpos){
		this.cursorPosition = curpos;
	},
	handleInject : function(injectText){
		const lines = this.props.brew.text.split('\n');
		lines[this.cursorPosition.line] = splice(lines[this.cursorPosition.line], this.cursorPosition.ch, injectText);

		this.handleTextChange(lines.join('\n'));
		this.refs.codeEditor.setCursorPosition(this.cursorPosition.line, this.cursorPosition.ch  + injectText.length);
	},
	handgleToggle : function(){
		this.setState({
			showMetadataEditor : !this.state.showMetadataEditor
		});
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

				if(line.startsWith('\\column')){
					codeMirror.addLineClass(lineNumber, 'text', 'columnSplit');
					r.push(lineNumber);
				}

				if(line.startsWith('{{') || line.startsWith('}}')){
					let endCh = line.length+1;
					const match = line.match(/{{(?:[\w,#-]|="[\w, ]*")*\s*|}}/);
					if(match)
						endCh = match.index+match[0].length;
					codeMirror.markText({ line: lineNumber, ch: 0 }, { line: lineNumber, ch: endCh }, { className: 'block' });
				}

				if(line.includes('{{') && line.includes('}}')){
					const regex = /{{(?:[\w,#-]|="[\w, ]*")*\s*|}}/g;
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
				}
			}

			return r;
		}, []);
		return lineNumbers;
	},


	brewJump : function(){
		const currentPage = this.getCurrentPage();
		window.location.hash = `p${currentPage}`;
	},

	//Called when there are changes to the editor's dimensions
	update : function(){
		this.refs.codeEditor.updateSize();
	},

	renderMetadataEditor : function(){
		if(!this.state.showMetadataEditor) return;
		return <MetadataEditor
			metadata={this.props.brew}
			onChange={this.props.onMetadataChange}
		/>;
	},

	render : function(){
		this.highlightCustomMarkdown();
		return (
			<div className='editor' ref='main'>
				<SnippetBar
					brew={this.props.brew}
					onInject={this.handleInject}
					onToggle={this.handgleToggle}
					showmeta={this.state.showMetadataEditor}
					showMetaButton={this.props.showMetaButton}
					renderer={this.props.renderer} />
				{this.renderMetadataEditor()}
				<CodeEditor
					ref='codeEditor'
					wrap={true}
					language='gfm'
					value={this.props.brew.text}
					onChange={this.handleTextChange}
					onCursorActivity={this.handleCursorActivty} />

				{/*
				<div className='brewJump' onClick={this.brewJump}>
					<i className='fas fa-arrow-right' />
				</div>
				*/}
			</div>
		);
	}
});

module.exports = Editor;
