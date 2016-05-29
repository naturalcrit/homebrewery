var React = require('react');
var _ = require('lodash');
var cx = require('classnames');


var CodeMirror;
if(typeof navigator !== 'undefined'){
	var CodeMirror = require('codemirror');

	//Language Modes
	require('codemirror/mode/gfm/gfm.js'); //Github flavoured markdown
	require('codemirror/mode/javascript/javascript.js');
}


var CodeEditor = React.createClass({
	getDefaultProps: function() {
		return {
			language : '',
			value : '',
			wrap : false,
			onChange : function(){},
			onCursorActivity : function(){},
		};
	},

	componentDidMount: function() {
		this.codeMirror = CodeMirror(this.refs.editor,{
			value : this.props.value,
			lineNumbers: true,
			lineWrapping : this.props.wrap,
			mode : this.props.language
		});

		this.codeMirror.on('change', this.handleChange);
		this.codeMirror.on('cursorActivity', this.handleCursorActivity);
		this.updateSize();
	},

	componentWillReceiveProps: function(nextProps){
		if(this.codeMirror && nextProps.value !== undefined && this.codeMirror.getValue() != nextProps.value) {
			this.codeMirror.setValue(nextProps.value);
		}
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		return false;
	},

	setCursorPosition : function(line, char){
		setTimeout(()=>{
			this.codeMirror.focus();
			this.codeMirror.doc.setCursor(line, char);
		}, 10);
	},

	updateSize : function(){
		this.codeMirror.refresh();
	},

	handleChange : function(editor){
		this.props.onChange(editor.getValue());
	},
	handleCursorActivity : function(){
		this.props.onCursorActivity(this.codeMirror.doc.getCursor());
	},

	render : function(){
		return <div className='codeEditor' ref='editor' />
	}
});

module.exports = CodeEditor;
