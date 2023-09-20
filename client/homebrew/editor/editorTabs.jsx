require('./editorTabs.less');
const React = require('react');
const createClass = require('create-react-class');
const cx = require('classnames');
const _ = require('lodash');
import * as Tabs from '@radix-ui/react-tabs';

const Editor = require('../editor/editor.jsx');

const Tabbed = createClass({
	displayName     : 'Tabbed',
	getDefaultProps : function(){
		return {
			onViewChange : ()=>{},
		};
	},
	getInitialState : function() {
		return {
			view : 'text',
			editorHeight : 0
		}
	},

	isText  : function() {return this.state.view == 'text';},
	isStyle : function() {return this.state.view == 'style';},
	isMeta  : function() {return this.state.view == 'meta';},
	
	componentDidMount : function() {
		this.getTabHeight();
		window.addEventListener('resize', _.throttle(this.getTabHeight, 100));

	},

	componentWillUnmount : function() {
		window.removeEventListener('resize', this.getTabHeight);
	},

	handleSplitMove : function(){
		this.refs.editor.update();
	},

	getTabHeight : function(){
		let snippetBarHeight = 0;
		if(this.state.view == 'text' || this.state.view == 'style'){
			const tabsAreaHeight = document.querySelector('.splitPane').getBoundingClientRect().height;
			const tabListHeight = this.refs.tabList.getBoundingClientRect().height;
			if(this.state.view !== 'meta'){
				// snippetBarHeight = document.querySelector('.snippetBar').getBoundingClientRect().height; // how to get snippetbar height with setting a specific height...?
				snippetBarHeight = 25;

			}
			this.setState({
				editorHeight : tabsAreaHeight - snippetBarHeight - tabListHeight
			}, ()=>{});

		}

	},

	handleViewChange : function(newView){
		console.log('test')
		this.props.setMoveArrows(newView === 'text');
		this.setState({
			view : newView
		}, ()=>{this.getTabHeight()});

	},

	renderTabList : function(){
		return <Tabs.TabsList className='tab-list' ref='tabList'>
			<Tabs.Trigger className='text tab'
				value='text'>
                Text
				<i className='fa fa-beer' />
			</Tabs.Trigger>
			<Tabs.Trigger className='style tab'
				value='style'>
                Style
				<i className='fa fa-paint-brush' />
			</Tabs.Trigger>
			<Tabs.Trigger className='meta tab'
				value='meta'>
                Properties
				<i className='fas fa-info-circle' />
			</Tabs.Trigger>
		</Tabs.TabsList>;
	},

	renderTabContent : function (){
		return <Tabs.Content value={this.state.view} ref='tabPanel' style={this.state.view == 'meta' ? {overflowY: 'auto'} : null}>
			<Editor
				ref='editor'
				editorHeight={this.state.editorHeight}
				view={this.state.view}
				{...this.props}
			/>
		</Tabs.Content>;
	},

	render : function(){
		return 	<Tabs.Root className='tabs' ref='main' defaultValue={this.state.view} onValueChange={this.handleViewChange}>
			{this.renderTabContent()}
			{this.renderTabList()}
		</Tabs.Root>;
	}
});

module.exports = Tabbed