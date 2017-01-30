const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

let CodeMirror;
if(typeof navigator !== 'undefined'){
	CodeMirror = require('codemirror');
	//Language Modes
	require('codemirror/mode/gfm/gfm.js'); //Github flavoured markdown
	require('codemirror/mode/javascript/javascript.js');
	require('codemirror/mode/css/css.js');
}


const CodeEditor = React.createClass({
	getDefaultProps: function() {
		return {
			value    : '',

			language : '',
			wrap     : true,
			onChange : ()=>{},
		};
	},
	componentWillReceiveProps: function(nextProps){
		if(this.props.language !== nextProps.language){
			this.buildEditor();
		}
		if(this.codeMirror && nextProps.value !== undefined && this.codeMirror.getValue() != nextProps.value) {
			this.codeMirror.setValue(nextProps.value);
		}
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		return false;
	},
	componentDidMount: function() {
		this.buildEditor();
	},
	buildEditor : function(){
		this.codeMirror = CodeMirror(this.refs.editor,{
			value        : this.props.value,
			lineNumbers  : true,
			lineWrapping : this.props.wrap,
			mode         : this.props.language,
			indentWithTabs : true,
			tabSize : 2
		});
		this.codeMirror.on('change', ()=>{
			this.props.onChange(this.codeMirror.getValue());
		});
		this.updateSize();
	},

	//Externally Used
	setCursorPosition : function(line, char){
		setTimeout(()=>{
			this.codeMirror.focus();
			this.codeMirror.doc.setCursor(line, char);
		}, 10);
	},
	getCursorPosition : function(){
		return this.codeMirror.getCursor();
	},
	updateSize : function(){
		this.codeMirror.refresh();
	},

	render : function(){
		return <div className='codeEditor' ref='editor' />
	}
});

module.exports = CodeEditor;
