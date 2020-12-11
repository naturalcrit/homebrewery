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
			value    : '',
			onChange : ()=>{},

			metadata         : {},
			onMetadataChange : ()=>{},
			showMetaButton   : true,
			version          : ''
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
		this.highlightPageLines();
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
		const lines = this.props.value.split('\n');
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
		const lines = this.props.value.split('\n').slice(0, this.cursorPosition.line + 1);
		return _.reduce(lines, (r, line)=>{
			if(line.indexOf('\\page') !== -1) r++;
			return r;
		}, 1);
	},

	highlightPageLines : function(){
		if(!this.refs.codeEditor) return;
		const codeMirror = this.refs.codeEditor.codeMirror;

		const lineNumbers = _.reduce(this.props.value.split('\n'), (r, line, lineNumber)=>{
			if(line.indexOf('\\page') !== -1){
				codeMirror.addLineClass(lineNumber, 'background', 'pageLine');
				r.push(lineNumber);
			}

			if(line.indexOf('\\column') === 0){
				codeMirror.addLineClass(lineNumber, 'text', 'columnSplit');
				r.push(lineNumber);
			}

			if(_.startsWith(line, '{{') || _.startsWith(line, '}}')){
				let endCh = line.length+1;
				if(line.indexOf(' ') !== -1)
					endCh = line.indexOf(' ');
				codeMirror.markText({ line: lineNumber, ch: 0 }, { line: lineNumber, ch: endCh }, { className: 'block' });
			}

			if(line.indexOf('{{') !== -1 && line.indexOf('}}') !== -1){
				const regex = /{{.*?}}/g;
				let match;
				let endCh;
				while ((match = regex.exec(line)) != null) {
					endCh = match[0].length;
					if(match[0].indexOf(' ') !== -1)
						endCh = match[0].indexOf(' ');
					codeMirror.markText({ line: lineNumber, ch: match.index }, { line: lineNumber, ch: match.index + endCh }, { className: 'inline-block' });
					codeMirror.markText({ line: lineNumber, ch: regex.lastIndex-2 }, { line: lineNumber, ch: regex.lastIndex }, { className: 'inline-block' });
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
			metadata={this.props.metadata}
			onChange={this.props.onMetadataChange}
		/>;
	},

	render : function(){
		this.highlightPageLines();
		return (
			<div className='editor' ref='main'>
				<SnippetBar
					brew={this.props.value}
					onInject={this.handleInject}
					onToggle={this.handgleToggle}
					showmeta={this.state.showMetadataEditor}
					showMetaButton={this.props.showMetaButton}
					version={this.props.version} />
				{this.renderMetadataEditor()}
				<CodeEditor
					ref='codeEditor'
					wrap={true}
					language='gfm'
					value={this.props.value}
					onChange={this.handleTextChange}
					onCursorActivity={this.handleCursorActivty} />

				{/*
				<div className='brewJump' onClick={this.brewJump}>
					<i className='fa fa-arrow-right' />
				</div>
				*/}
			</div>
		);
	}
});

module.exports = Editor;
