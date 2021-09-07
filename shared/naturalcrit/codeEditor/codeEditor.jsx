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
	require('codemirror/mode/css/css.js');
	require('codemirror/mode/javascript/javascript.js');
}

const CodeEditor = createClass({
	getDefaultProps : function() {
		return {
			language : '',
			value    : '',
			wrap     : true,
			onChange : ()=>{}
		};
	},

	componentDidMount : function() {
		this.buildEditor();
	},

	componentDidUpdate : function(prevProps) {
		if(prevProps.language !== this.props.language){ //rebuild editor when switching tabs
			this.buildEditor();
		}
		if(this.codeMirror && this.codeMirror.getValue() != this.props.value) { //update editor contents if brew.text is changed from outside
			this.codeMirror.setValue(this.props.value);
		}
	},

	buildEditor : function() {
		this.codeMirror = CodeMirror(this.refs.editor, {
			value          : this.props.value,
			lineNumbers    : true,
			lineWrapping   : this.props.wrap,
			mode           : this.props.language, //TODO: CSS MODE DOESN'T SEEM TO LOAD PROPERLY
			indentWithTabs : true,
			tabSize        : 2,
			extraKeys      : {
				'Ctrl-B'       : this.makeBold,
				'Cmd-B'        : this.makeBold,
				'Ctrl-I'       : this.makeItalic,
				'Cmd-I'        : this.makeItalic,
				'Ctrl-U'       : this.makeUnderline,
				'Cmd-U'        : this.makeUnderline,
				'Ctrl-M'       : this.makeSpan,
				'Cmd-M'        : this.makeSpan,
				'Shift-Ctrl-M' : this.makeDiv,
				'Shift-Cmd-M'  : this.makeDiv,
				'Ctrl-/'       : this.makeComment,
				'Cmd-/'        : this.makeComment
			}
		});

		// Note: codeMirror passes a copy of itself in this callback. cm === this.codeMirror. Either one works.
		this.codeMirror.on('change', (cm)=>{this.props.onChange(cm.getValue());});
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
		const selection = this.codeMirror.getSelection(), t = selection.slice(0, 1) === '*' && selection.slice(-1) === '*';
		this.codeMirror.replaceSelection(t ? selection.slice(1, -1) : `*${selection}*`, 'around');
		if(selection.length === 0){
			const cursor = this.codeMirror.getCursor();
			this.codeMirror.setCursor({ line: cursor.line, ch: cursor.ch - 1 });
		}
	},

	makeUnderline : function() {
		const selection = this.codeMirror.getSelection(), t = selection.slice(0, 3) === '<u>' && selection.slice(-4) === '</u>';
		this.codeMirror.replaceSelection(t ? selection.slice(3, -4) : `<u>${selection}</u>`, 'around');
		if(selection.length === 0){
			const cursor = this.codeMirror.getCursor();
			this.codeMirror.setCursor({ line: cursor.line, ch: cursor.ch - 4 });
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

	makeDiv : function() {
		const selection = this.codeMirror.getSelection(), t = selection.slice(0, 2) === '{{' && selection.slice(-2) === '}}';
		this.codeMirror.replaceSelection(t ? selection.slice(2, -2) : `{{\n${selection}\n}}`, 'around');
		if(selection.length === 0){
			const cursor = this.codeMirror.getCursor();
			this.codeMirror.setCursor({ line: cursor.line - 1, ch: cursor.ch });  // set to -2? if wanting to enter classes etc.  if so, get rid of first \n when replacing selection
		}
	},

	makeComment : function() {
		const selection = this.codeMirror.getSelection(), t = selection.slice(0, 4) === '<!--' && selection.slice(-3) === '-->';
		this.codeMirror.replaceSelection(t ? selection.slice(4, -3) : `<!-- ${selection} -->`, 'around');
		if(selection.length === 0){
			const cursor = this.codeMirror.getCursor();
			this.codeMirror.setCursor({ line: cursor.line, ch: cursor.ch - 4 });
		}
	},

	//=-- Externally used -==//
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
	//----------------------//

	render : function(){
		return <div className='codeEditor' ref='editor' />;
	}
});

module.exports = CodeEditor;
