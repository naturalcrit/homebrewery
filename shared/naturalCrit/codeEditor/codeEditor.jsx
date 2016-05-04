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
			language : 'javascript',
			text : 'yo dawg',
			onChange : function(){}
		};
	},

	componentDidMount: function() {
		this.editor = CodeMirror(this.refs.editor,{
			lineNumbers: true,
			mode : this.props.language
		});
	},

	render : function(){
		return <div className='codeEditor' ref='editor'>
			CodeEditor Ready!
		</div>
	}
});

module.exports = CodeEditor;
