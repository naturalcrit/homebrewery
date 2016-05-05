var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var CodeEditor = require('naturalcrit/codeEditor/codeEditor.jsx');

var Snippets = require('./snippets/snippets.js');

var Editor = React.createClass({
	getDefaultProps: function() {
		return {
			value : "",
			onChange : function(){}
		};
	},


	handleTextChange : function(text){
		this.props.onChange(text);
	},

	iconClick : function(snippetFn){
		var curPos = this.refs.textarea.selectionStart;
		this.props.onChange(this.props.text.slice(0, curPos) +
			snippetFn() +
			this.props.text.slice(curPos + 1));
	},

	renderTemplateIcons : function(){
		return _.map(Snippets, (t) => {
			return <div className='icon' key={t.icon}
				onClick={this.iconClick.bind(this, t.snippet)}
				data-tooltip={t.tooltip}>
				<i className={'fa ' + t.icon} />
			</div>;
		})
	},
	renderSnippetBar : function(){
		return <div className='snippetBar'>
			Snippet bar yo

		</div>
	},

	render : function(){
		return(
			<div className='editor'>
				{this.renderTemplateIcons()}
				{this.renderSnippetBar()}
				<CodeEditor wrap={true} language='gfm' value={this.props.value} onChange={this.handleTextChange} />

			</div>
		);
	}
});

module.exports = Editor;

