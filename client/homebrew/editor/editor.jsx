var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var SnippetIcons = require('./snippets/snippets.js');


var Editor = React.createClass({
	getDefaultProps: function() {
		return {
			text : "",
			onChange : function(){}
		};
	},

	componentDidMount: function() {
		this.refs.textarea.focus();
	},

	handleTextChange : function(e){
		this.props.onChange(e.target.value);
	},

	iconClick : function(snippetFn){
		var curPos = this.refs.textarea.selectionStart;
		this.props.onChange(this.props.text.slice(0, curPos) +
			snippetFn() +
			this.props.text.slice(curPos + 1));
	},

	renderTemplateIcons : function(){
		return _.map(SnippetIcons, (t) => {
			return <div className='icon' key={t.icon}
				onClick={this.iconClick.bind(this, t.snippet)}
				data-tooltip={t.tooltip}>
				<i className={'fa ' + t.icon} />
			</div>;
		})
	},

	render : function(){
		var self = this;
		return(
			<div className='editor'>
				<div className='textIcons'>
					{this.renderTemplateIcons()}
				</div>
				<textarea
					ref='textarea'
					value={this.props.text}
					onChange={this.handleTextChange} />
			</div>
		);
	}
});

module.exports = Editor;

