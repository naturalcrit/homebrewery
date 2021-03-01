require('./codeEditor.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');


let CodeMirror;
if(typeof navigator !== 'undefined'){
	CodeMirror = require('codemirror');

	//Language Modes
	require('codemirror/mode/gfm/gfm.js'); //Github flavoured markdown
	require('codemirror/mode/javascript/javascript.js');
}


const CodeEditor = createClass({
	getDefaultProps : function() {
		return {
			language         : '',
			value            : '',
			wrap             : false,
			onChange         : function(){},
			onCursorActivity : function(){},
		};
	},

	componentDidMount : function() {
		this.codeMirror = CodeMirror(this.refs.editor, {
			value        : this.props.value,
			lineNumbers  : true,
			lineWrapping : this.props.wrap,
			mode         : this.props.language,
			extraKeys    : {
				'Ctrl-B' : this.makeBold,
				'Cmd-B'  : this.makeBold,
				'Ctrl-I' : this.makeItalic,
				'Cmd-I'  : this.makeItalic,
				'Ctrl-M' : this.makeSpan,
				'Cmd-M'  : this.makeSpan,
			}
		});

		this.codeMirror.on('change', this.handleChange);
		this.codeMirror.on('cursorActivity', this.handleCursorActivity);
		this.updateSize();
	},

	makeBold : function() {
		const selection = this.codeMirror.getSelection(), t = selection.slice(0, 2) === '**' && selection.slice(-2) === '**';
		this.codeMirror.replaceSelection(t ? selection.slice(2, -2) : `**${selection}**`, 'around');
		if(selection.length === 0){
			const cursor = this.codeMirror.getCursor();
			this.codeMirror.setCursor({ line: cursor.line, ch: cursor.ch - 2 });
		}
	},

	makeItalic : function() {
		const selection = this.codeMirror.getSelection(), t = selection.slice(0, 1) === '_' && selection.slice(-1) === '_';
		this.codeMirror.replaceSelection(t ? selection.slice(1, -1) : `_${selection}_`, 'around');
		if(selection.length === 0){
			const cursor = this.codeMirror.getCursor();
			this.codeMirror.setCursor({ line: cursor.line, ch: cursor.ch - 1 });
		}
	},

	makeSpan : function() {
		const selection = this.codeMirror.getSelection(), t = selection.slice(0, 2) === '{{' && selection.slice(-2) === '}}';
		this.codeMirror.replaceSelection(t ? selection.slice(2, -2) : `{{ ${selection}}}`, 'around');
		if(selection.length === 0){
			const cursor = this.codeMirror.getCursor();
			this.codeMirror.setCursor({ line: cursor.line, ch: cursor.ch - 2 });
		}
	},

	componentWillReceiveProps : function(nextProps){
		if(this.codeMirror && nextProps.value !== undefined && this.codeMirror.getValue() != nextProps.value) {
			this.codeMirror.setValue(nextProps.value);
		}
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
		return <div className='codeEditor' ref='editor' />;
	}
});

module.exports = CodeEditor;
