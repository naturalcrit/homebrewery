const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

const CodeEditor = require('naturalcrit/codeEditor/codeEditor.jsx');
const SnippetBar = require('./snippetbar/snippetbar.jsx');
const MetadataEditor = require('./metadataEditor/metadataEditor.jsx');

const Menubar = require('./menubar/menubar.jsx');

const splice = function(str, index, inject){
	return str.slice(0, index) + inject + str.slice(index);
};

const MENUBAR_HEIGHT = 25;

const BrewEditor = React.createClass({
	getDefaultProps: function() {
		return {
			brew : {
				text : '',
				style : '',
			},

			onCodeChange : ()=>{},
			onStyleChange : ()=>{},
			onMetaChange : ()=>{},
		};
	},
	getInitialState: function() {
		return {
			view : 'code', //'code', 'style', 'meta'
		};
	},

	componentDidMount: function() {
		this.updateEditorSize();
		//this.highlightPageLines();
		window.addEventListener("resize", this.updateEditorSize);
	},
	componentWillUnmount: function() {
		window.removeEventListener("resize", this.updateEditorSize);
	},

	updateEditorSize : function() {
		if(this.refs.codeEditor){
			let paneHeight = this.refs.main.parentNode.clientHeight;
			paneHeight -= MENUBAR_HEIGHT + 1;
			this.refs.codeEditor.codeMirror.setSize(null, paneHeight);
		}
	},



	handleInject : function(injectText){
		const lines = this.props.value.split('\n');
		lines[this.cursorPosition.line] = splice(lines[this.cursorPosition.line], this.cursorPosition.ch, injectText);

		this.handleTextChange(lines.join('\n'));
		this.refs.codeEditor.setCursorPosition(this.cursorPosition.line, this.cursorPosition.ch  + injectText.length);
	},



	handleViewChange : function(newView){
		this.setState({
			view : newView
		}, this.updateEditorSize);
	},




	brewJump : function(){
		const currentPage = this.getCurrentPage();
		window.location.hash = 'p' + currentPage;
	},

	//Called when there are changes to the editor's dimensions
	/*
	update : function(){
		if(this.refs.codeEditor) this.refs.codeEditor.updateSize();
	},
	*/

	//TODO: convert this into a generic function for columns and blocks
	//MOve this to a util.sj file
	highlightPageLines : function(){
		if(!this.refs.codeEditor) return;
		const codeMirror = this.refs.codeEditor.codeMirror;

		const lineNumbers = _.reduce(this.props.value.split('\n'), (r, line, lineNumber)=>{
			if(line.indexOf('\\page') !== -1){
				codeMirror.addLineClass(lineNumber, 'background', 'pageLine');
				r.push(lineNumber);
			}
			return r;
		}, []);
		return lineNumbers
	},

	/*
	renderMetadataEditor : function(){
		if(!this.state.showMetadataEditor) return;
		return <MetadataEditor
			metadata={this.props.metadata}
			onChange={this.props.onMetadataChange}
		/>
	},
	*/



	renderEditor : function(){
		if(this.state.view == 'meta'){
			return <MetadataEditor
				metadata={this.props.brew}
				onChange={this.props.onMetaChange} />
		}
		if(this.state.view == 'style'){
			return <CodeEditor key='style'
				ref='codeEditor'
				language='css'
				value={this.props.brew.style}
				onChange={this.props.onStyleChange} />
		}
		if(this.state.view == 'code'){
			return <CodeEditor key='code'
				ref='codeEditor'
				language='gfm'
				value={this.props.brew.text}
				onChange={this.props.onCodeChange} />
		}
	},

	render : function(){
		return <div className='brewEditor' ref='main'>
			{/*
			<SnippetBar
				brew={this.props.value}
				onInject={this.handleInject}
				onToggle={this.handgleToggle}
				showmeta={this.state.showMetadataEditor} />
			*/}
			<Menubar
				view={this.state.view}
				onViewChange={this.handleViewChange}

			/>

			{this.renderEditor()}

		</div>

			/*
			<div className='brewJump' onClick={this.brewJump}>
				<i className='fa fa-arrow-right' />
			</div>
			*/
	}
});

module.exports = BrewEditor;

