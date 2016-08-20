var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var CodeEditor = require('naturalcrit/codeEditor/codeEditor.jsx');
var Snippets = require('./snippets/snippets.js');


var splice = function(str, index, inject){
	return str.slice(0, index) + inject + str.slice(index);
};
var execute = function(val){
	if(_.isFunction(val)) return val();
	return val;
}


var Editor = React.createClass({
	getDefaultProps: function() {
		return {
			value : "",
			onChange : function(){}
		};
	},
	cursorPosition : {
		line : 0,
		ch : 0
	},


	componentDidMount: function() {
		this.updateEditorSize();
		window.addEventListener("resize", this.updateEditorSize);
	},
	componentWillUnmount: function() {
		window.removeEventListener("resize", this.updateEditorSize);
	},

	updateEditorSize : function() {
		var paneHeight = this.refs.main.parentNode.clientHeight;
		paneHeight -= this.refs.snippetBar.clientHeight + 1;
		this.refs.codeEditor.codeMirror.setSize(null, paneHeight);
	},

	handleTextChange : function(text){
		this.props.onChange(text);
	},
	handleCursorActivty : function(curpos){
		this.cursorPosition = curpos;
	},

	handleSnippetClick : function(injectText){
		var lines = this.props.value.split('\n');
		lines[this.cursorPosition.line] = splice(lines[this.cursorPosition.line], this.cursorPosition.ch, injectText);

		this.handleTextChange(lines.join('\n'));
		this.refs.codeEditor.setCursorPosition(this.cursorPosition.line, this.cursorPosition.ch  + injectText.length);
	},

	//Called when there are changes to the editor's dimensions
	update : function(){
		this.refs.codeEditor.updateSize();
	},

	renderSnippetGroups : function(){
		return _.map(Snippets, (snippetGroup)=>{
			return <SnippetGroup
				groupName={snippetGroup.groupName}
				icon={snippetGroup.icon}
				snippets={snippetGroup.snippets}
				key={snippetGroup.groupName}
				onSnippetClick={this.handleSnippetClick}
			/>
		})
	},

	render : function(){
		return(
			<div className='editor' ref='main'>
				<div className='snippetBar' ref='snippetBar'>
					{this.renderSnippetGroups()}
				</div>
				<CodeEditor
					ref='codeEditor'
					wrap={true}
					language='gfm'
					value={this.props.value}
					onChange={this.handleTextChange}
					onCursorActivity={this.handleCursorActivty} />
			</div>
		);
	}
});

module.exports = Editor;









var SnippetGroup = React.createClass({
	getDefaultProps: function() {
		return {
			groupName : '',
			icon : 'fa-rocket',
			snippets : [],
			onSnippetClick : function(){},
		};
	},
	handleSnippetClick : function(snippet){
		this.props.onSnippetClick(execute(snippet.gen));
	},
	renderSnippets : function(){
		return _.map(this.props.snippets, (snippet)=>{
			return <div className='snippet' key={snippet.name} onClick={this.handleSnippetClick.bind(this, snippet)}>
				<i className={'fa fa-fw ' + snippet.icon} />
				{snippet.name}
			</div>
		})
	},

	render : function(){
		return <div className='snippetGroup'>
			<div className='text'>
				<i className={'fa fa-fw ' + this.props.icon} />
				<span className='groupName'>{this.props.groupName}</span>
			</div>
			<div className='dropdown'>
				{this.renderSnippets()}
			</div>
		</div>
	},

});