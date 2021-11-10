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

	// this should add the foldcode helpers and such to the CodeMirror object, but seemingly is adding them to a new instance of CodeMirror
	require('codemirror/addon/fold/foldcode.js');
	require('codemirror/addon/fold/foldgutter.js');

	const foldCode = require('./fold-code');
	foldCode.registerHomebreweryHelper(CodeMirror);
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

	getInitialState : function() {
		return {
			docs : {}
		};
	},

	componentDidMount : function() {
		this.buildEditor();
		const newDoc = CodeMirror.Doc(this.props.value, this.props.language);
		this.codeMirror.swapDoc(newDoc);
	},

	componentDidUpdate : function(prevProps) {
		if(prevProps.view !== this.props.view){ //view changed; swap documents
			let newDoc;

			if(!this.state.docs[this.props.view]) {
				newDoc = CodeMirror.Doc(this.props.value, this.props.language);
			} else {
				newDoc = this.state.docs[this.props.view];
			}

			const oldDoc = { [prevProps.view]: this.codeMirror.swapDoc(newDoc) };

			this.setState((prevState)=>({
				docs : _.merge({}, prevState.docs, oldDoc)
			}));

			this.props.rerenderParent();
		} else if(this.codeMirror?.getValue() != this.props.value) { //update editor contents if brew.text is changed from outside
			this.codeMirror.setValue(this.props.value);
		}
	},

	buildEditor : function() {
		this.codeMirror = CodeMirror(this.refs.editor, {
			lineNumbers       : true,
			lineWrapping      : this.props.wrap,
			indentWithTabs    : true,
			tabSize           : 2,
			historyEventDelay : 250,
			extraKeys         : {
				'Ctrl-B'  : this.makeBold,
				'Cmd-B'   : this.makeBold,
				'Ctrl-I'  : this.makeItalic,
				'Cmd-I'   : this.makeItalic,
				'Ctrl-M'  : this.makeSpan,
				'Cmd-M'   : this.makeSpan,
				'Ctrl-/'  : this.makeComment,
				'Cmd-/'   : this.makeComment,
				'Ctrl-\\' : this.toggleCodeFolded,
				'Cmd-\\'  : this.toggleCodeFolded,
				'Ctrl-['  : this.foldAllCode,
				'Cmd-['   : this.foldAllCode,
				'Ctrl-]'  : this.unfoldAllCode,
				'Cmd-]'   : this.unfoldAllCode
			},
			foldGutter  : true,
			foldOptions : {
				rangeFinder : CodeMirror.fold.homebrewery,
				widget      : (from, to)=>{
					let text = '';
					let currentLine = from.line;
					const maxLength = 50;
					while (currentLine <= to.line && text.length <= maxLength) {
						text += this.codeMirror.getLine(currentLine);
						if(currentLine < to.line) {
							text += ' ';
						}
						currentLine += 1;
					}

					return `\u21A4${text.substr(0, maxLength)}\u21A6`;
				}
			},
			gutters : ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
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

	makeComment : function() {
		const selection = this.codeMirror.getSelection(), t = selection.slice(0, 4) === '<!--' && selection.slice(-3) === '-->';
		this.codeMirror.replaceSelection(t ? selection.slice(4, -3) : `<!-- ${selection} -->`, 'around');
		if(selection.length === 0){
			const cursor = this.codeMirror.getCursor();
			this.codeMirror.setCursor({ line: cursor.line, ch: cursor.ch - 4 });
		}
	},

	toggleCodeFolded : function() {
		this.codeMirror.foldCode(this.codeMirror.getCursor());
	},

	foldAllCode : function() {
		this.codeMirror.execCommand('foldAll');
	},

	unfoldAllCode : function() {
		this.codeMirror.execCommand('unfoldAll');
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
	redo : function(){
		return this.codeMirror.redo();
	},
	undo : function(){
		return this.codeMirror.undo();
	},
	historySize : function(){
		return this.codeMirror.doc.historySize();
	},
	//----------------------//

	render : function(){
		return <div className='codeEditor' ref='editor' style={this.props.style}/>;
	}
});

module.exports = CodeEditor;
