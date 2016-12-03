const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');


const Snippets = require('./snippets/snippets.js');

const execute = function(val){
	if(_.isFunction(val)) return val();
	return val;
}



const Snippetbar = React.createClass({
	getDefaultProps: function() {
		return {
			onInject : ()=>{},
			onToggle : ()=>{},
			showmeta : false
		};
	},

	handleSnippetClick : function(injectedText){
		this.props.onInject(injectedText)
	},

	renderSnippetGroups : function(){
		return _.map(Snippets, (snippetGroup)=>{
			return <SnippetGroup
				groupName={snippetGroup.groupName}
				icon={snippetGroup.icon}
				snippets={snippetGroup.snippets}
				key={snippetGroup.groupName}
				onSnippetClick={this.handleSnippetClick}
			/>
		})
	},

	render : function(){
		return <div className='snippetBar'>
			{this.renderSnippetGroups()}
			<div className={cx('toggleMeta', {selected: this.props.showmeta})}
				onClick={this.props.onToggle}>
				<i className='fa fa-info-circle' />
			</div>
		</div>
	}
});

module.exports = Snippetbar;






const SnippetGroup = React.createClass({
	getDefaultProps: function() {
		return {
			groupName : '',
			icon : 'fa-rocket',
			snippets : [],
			onSnippetClick : function(){},
		};
	},
	handleSnippetClick : function(snippet){
		this.props.onSnippetClick(execute(snippet.gen));
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
				<span className='groupName'>{this.props.groupName}</span>
			</div>
			<div className='dropdown'>
				{this.renderSnippets()}
			</div>
		</div>
	},

});