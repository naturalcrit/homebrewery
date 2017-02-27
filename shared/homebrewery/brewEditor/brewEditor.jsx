const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

const CodeEditor = require('naturalcrit/codeEditor/codeEditor.jsx');
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
	isCode : function(){ return this.state.view == 'code' },
	isStyle : function(){ return this.state.view == 'style' },
	isMeta : function(){ return this.state.view == 'meta' },


	componentDidMount: function() {
		this.updateEditorSize();
		this.highlightPageLines();
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
		const text = (this.isCode() ? this.props.brew.text : this.props.brew.style);

		const lines = text.split('\n');
		const cursorPos = this.refs.codeEditor.getCursorPosition();
		lines[cursorPos.line] = splice(lines[cursorPos.line], cursorPos.ch, injectText);

		this.refs.codeEditor.setCursorPosition(cursorPos.line, cursorPos.ch  + injectText.length);

		if(this.state.view == 'code') this.props.onCodeChange(lines.join('\n'));
		if(this.state.view == 'style') this.props.onStyleChange(lines.join('\n'));
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
		if(!this.isCode()) return;


		const codeMirror = this.refs.codeEditor.codeMirror;

		const lineNumbers = _.reduce(this.props.brew.text.split('\n'), (r, line, lineNumber)=>{
			if(line.indexOf('\\page') !== -1){
				codeMirror.addLineClass(lineNumber, 'background', 'pageLine');
				r.push(lineNumber);
			}

			if(line.indexOf('\\column') === 0){
				codeMirror.addLineClass(lineNumber, 'text', 'columnSplit');
				r.push(lineNumber);
			}

			if(_.startsWith(line, '{{') || _.startsWith(line, '}}')){
				codeMirror.addLineClass(lineNumber, 'text', 'block');
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
		if(this.isMeta()){
			return <MetadataEditor
				metadata={this.props.brew}
				onChange={this.props.onMetaChange} />
		}
		if(this.isStyle()){
			return <CodeEditor key='style'
				ref='codeEditor'
				language='css'
				value={this.props.brew.style}
				onChange={this.props.onStyleChange} />
		}
		if(this.isCode()){
			return <CodeEditor key='code'
				ref='codeEditor'
				language='gfm'
				value={this.props.brew.text}
				onChange={this.props.onCodeChange} />
		}
	},

	render : function(){
		this.highlightPageLines();
		return <div className='brewEditor' ref='main'>
			<Menubar
				view={this.state.view}
				onViewChange={this.handleViewChange}
				onSnippetInject={this.handleInject}

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

