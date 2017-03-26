const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const SnippetMap = require('./snippet.map.js');
const SnippetGroup = require('./snippetGroup/snippetGroup.jsx');

const Menubar = React.createClass({
	getDefaultProps: function() {
		return {
			view : 'code',
			onViewChange : ()=>{},
			onSnippetInject : ()=>{},
		};
	},

	//TODO: remove
	renderDevGroup : function(){
		const Snippets = require('homebrewery/snippets/brew');

		const snippets = _.map(Snippets, (gen, name)=>{
			return {
				name,
				gen,
				icon : 'fa-question'
			}
		})

		return <SnippetGroup
			name='All'
			icon='fa-rocket'
			snippets={snippets}
			onClick={this.props.onSnippetInject}
			key='dev'
		/>
	},

	renderSnippets : function(){
		if(this.props.view == 'meta') return ;

		let mapping;
		if(this.props.view == 'code') mapping = SnippetMap.brew;
		if(this.props.view == 'style') mapping = SnippetMap.style;

		let groups = _.map(mapping, (group)=>{
			return <SnippetGroup {...group} onClick={this.props.onSnippetInject} key={group.name} />
		});

		groups = groups.concat(this.renderDevGroup());

		return <div className='snippets'>{groups} </div>
	},
	render: function(){
		return <div className='menubar'>

			{this.renderSnippets()}

			<div className='editors'>
				<div className={cx('code', {selected : this.props.view == 'code'})}
					 onClick={this.props.onViewChange.bind(null, 'code')}>
					<i className='fa fa-beer' />
				</div>
				<div className={cx('style', {selected : this.props.view == 'style'})}
					 onClick={this.props.onViewChange.bind(null, 'style')}>
					<i className='fa fa-paint-brush' />
				</div>
				<div className={cx('meta', {selected : this.props.view == 'meta'})}
					 onClick={this.props.onViewChange.bind(null, 'meta')}>
					<i className='fa fa-bars' />
				</div>
			</div>
		</div>
	}
});

module.exports = Menubar;
