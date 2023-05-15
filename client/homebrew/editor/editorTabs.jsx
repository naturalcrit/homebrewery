require('./editorTabs.less');
const React = require('react');
const createClass = require('create-react-class');
const cx = require('classnames');
import * as Tabs from '@radix-ui/react-tabs';

const Tabbed = createClass({
	displayName     : 'Tabbed',
	getDefaultProps : function(){
		return {
			view         : 'text',
			onViewChange : ()=>{},
		};
	},

	renderTabList : function(){
		return <Tabs.TabsList className='editors'>
			<Tabs.Trigger className='text'
				onClick={()=>this.props.onViewChange('text')}
				value='tab1'>
                Text
				<i className='fa fa-beer' />
			</Tabs.Trigger>
			<Tabs.Trigger className='style'
				onClick={()=>this.props.onViewChange('style')}
				value='tab1'>
                Style
				<i className='fa fa-paint-brush' />
			</Tabs.Trigger>
			<Tabs.Trigger className='meta'
				onClick={()=>this.props.onViewChange('meta')}
				value='tab1'>
                Properties
				<i className='fas fa-info-circle' />
			</Tabs.Trigger>
		</Tabs.TabsList>;
	},

	render : function(){
		return <Tabs.Root defaultValue='tab1'>
			<Tabs.Content value='tab1'>
				{this.props.children}
			</Tabs.Content>
			{this.renderTabList()}
		</Tabs.Root>;
	}
});

module.exports = { Tabbed };