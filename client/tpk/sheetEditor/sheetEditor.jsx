var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var CodeEditor = require('naturalcrit/codeEditor/codeEditor.jsx');

var SheetEditor = React.createClass({
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

	//Called when there are changes to the editor's dimensions
	update : function(){
		this.refs.codeEditor.updateSize();
	},

	render : function(){
		return <div className='sheetEditor'>
			<CodeEditor
				ref='codeEditor'
				wrap={true}
				language='jsx'
				value={this.props.value}
				onChange={this.handleTextChange}
				onCursorActivity={this.handleCursorActivty} />
		</div>
	}
});

module.exports = SheetEditor;
