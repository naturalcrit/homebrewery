require('./admin.less');
const React = require('react');
const createClass = require('create-react-class');

const BrewUtils = require('./brewUtils/brewUtils.jsx');
const NotificationUtils = require('./notificationUtils/notificationUtils.jsx');

const tabGroups = ['brew', 'notifications'];

const Admin = createClass({
	getDefaultProps : function() {
		return {};
	},

	getInitialState : function(){
		return ({
			currentTab : 'brew'
		});
	},

	handleClick : function(newTab){
		if(this.state.currentTab === newTab) return;
		this.setState({
			currentTab : newTab
		});
	},

	render : function(){
		return <div className='admin'>
			<header>
				<div className='container'>
					<i className='fas fa-rocket' />
					homebrewery admin
				</div>
			</header>
			<div className='container'>
				<div className='tabs'>
					{tabGroups.map((tab, idx)=>{ return <button className={tab===this.state.currentTab ? 'active' : ''} key={idx} onClick={()=>{ return this.handleClick(tab); }}>{tab.toUpperCase()}</button>; })}
				</div>
				{this.state.currentTab==='brew' && <BrewUtils />}
				{this.state.currentTab==='notifications' && <NotificationUtils />}
			</div>
		</div>;
	}
});

module.exports = Admin;
