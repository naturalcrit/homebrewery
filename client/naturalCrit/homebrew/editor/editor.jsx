var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Snippets = require('./snippets.js');


var Icons = [
	{
		icon : 'fa-book',
		snippet : Snippets.intro,
		tooltip : 'Intro'
	},
	{
		icon : 'fa-magic',
		snippet : Snippets.spell,
		tooltip : 'Spell'
	},
	{
		icon : 'fa-bookmark',
		snippet : Snippets.classFeatures,
		tooltip : 'Class Intro'
	},
	{
		icon : 'fa-trophy',
		snippet : Snippets.destroyUndead,
		tooltip : 'Class Feature'
	},
	{
		icon : 'fa-sticky-note',
		snippet : Snippets.note,
		tooltip : 'Note'
	},
	{
		icon : 'fa-bug',
		snippet : Snippets.statBlock,
		tooltip : 'Monster Stat Block'
	},
	{
		icon : 'fa-table',
		snippet : "",
		tooltip : "Class Table"
	},
	{
		icon : 'fa-columns',
		snippet : "```\n```\n\n",
		tooltip : "Column Break"
	},
	{
		icon : 'fa-file-text',
		snippet : "\\pagen\n\n",
		tooltip : "New Page"
	},


]

var Editor = React.createClass({
	getDefaultProps: function() {
		return {
			text : "",
			onChange : function(){}
		};
	},

	handleTextChange : function(e){
		this.props.onChange(e.target.value);
	},

	iconClick : function(snippet){
		var curPos = this.refs.textarea.selectionStart;
		this.props.onChange(this.props.text.slice(0, curPos) +
			snippet +
			this.props.text.slice(curPos + 1));
	},

	renderTemplateIcons : function(){
		return _.map(Icons, (t) => {
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

