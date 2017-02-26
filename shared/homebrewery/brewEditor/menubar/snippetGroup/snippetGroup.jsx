
const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const SnippetGroup = React.createClass({
	getDefaultProps: function() {
		return {
			brew : '',
			name : '',
			icon : 'fa-rocket',
			snippets : [],
			onClick : function(){},
		};
	},
	handleSnippetClick : function(snippet){
		this.props.onClick(snippet.gen());
	},
	renderSnippets : function(){
		return _.map(this.props.snippets, (snippet)=>{
			return <div className='snippet' key={snippet.name} onClick={this.handleSnippetClick.bind(this, snippet)}>
				<i className={'fa fa-fw ' + snippet.icon} />
				{snippet.name}
			</div>
		})
	},

	render : function(){
		return <div className='snippetGroup'>
			<div className='text'>
				<i className={'fa fa-fw ' + this.props.icon} />
				<span className='groupName'>{this.props.name}</span>
			</div>
			<div className='dropdown'>
				{this.renderSnippets()}
			</div>
		</div>
	},

});

module.exports = SnippetGroup;
