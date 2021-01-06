require('./snippetbar.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');


const SnippetsLegacy = require('./snippetsLegacy/snippets.js');
const SnippetsV3 = require('./snippets/snippets.js');

const execute = function(val, brew){
	if(_.isFunction(val)) return val(brew);
	return val;
};

const Snippetbar = createClass({
	getDefaultProps : function() {
		return {
			brew           : '',
			onInject       : ()=>{},
			onToggle       : ()=>{},
			showmeta       : false,
			showMetaButton : true,
			renderer       : ''
		};
	},

	getInitialState : function() {
		return {
			renderer : this.props.renderer
		};
	},

	handleSnippetClick : function(injectedText){
		this.props.onInject(injectedText);
	},

	renderSnippetGroups : function(){
		if(this.props.renderer == 'V3')
			Snippets = SnippetsV3;
		else
			Snippets = SnippetsLegacy;

		return _.map(Snippets, (snippetGroup)=>{
			return <SnippetGroup
				brew={this.props.brew}
				groupName={snippetGroup.groupName}
				icon={snippetGroup.icon}
				snippets={snippetGroup.snippets}
				key={snippetGroup.groupName}
				onSnippetClick={this.handleSnippetClick}
			/>;
		});
	},

	renderMetadataButton : function(){
		if(!this.props.showMetaButton) return;
		return <div className={cx('toggleMeta', { selected: this.props.showmeta })}
			onClick={this.props.onToggle}>
			<i className='fa fa-bars' />
		</div>;
	},

	render : function(){
		return <div className='snippetBar'>
			{this.renderSnippetGroups()}
			{this.renderMetadataButton()}
		</div>;
	}
});

module.exports = Snippetbar;






const SnippetGroup = createClass({
	getDefaultProps : function() {
		return {
			brew           : '',
			groupName      : '',
			icon           : 'fa-rocket',
			snippets       : [],
			onSnippetClick : function(){},
		};
	},
	handleSnippetClick : function(snippet){
		this.props.onSnippetClick(execute(snippet.gen, this.props.brew));
	},
	renderSnippets : function(){
		return _.map(this.props.snippets, (snippet)=>{
			return <div className='snippet' key={snippet.name} onClick={()=>this.handleSnippetClick(snippet)}>
				<i className={`fa-fw ${snippet.icon}`} />
				{snippet.name}
			</div>;
		});
	},

	render : function(){
		return <div className='snippetGroup'>
			<div className='text'>
				<i className={`fa-fw ${this.props.icon}`} />
				<span className='groupName'>{this.props.groupName}</span>
			</div>
			<div className='dropdown'>
				{this.renderSnippets()}
			</div>
		</div>;
	},

});
