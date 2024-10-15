require('./admin.less');
const React = require('react');
const createClass = require('create-react-class');

const BrewUtils = require('./brewUtils/brewUtils.jsx');
const NotificationUtils = require('./notificationUtils/notificationUtils.jsx');
const Stats = require('./stats/stats.jsx');

const tabGroups = ['brew', 'notifications', 'stats'];

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
			<main className='container'>
				<nav className='tabs'>
					{tabGroups.map((tab, idx)=>{ return <button className={tab===this.state.currentTab ? 'active' : ''} key={idx} onClick={()=>{ return this.handleClick(tab); }}>{tab.toUpperCase()}</button>; })}
				</nav>
				{this.state.currentTab==='brew' && <BrewUtils />}
				{this.state.currentTab==='notifications' && <NotificationUtils />}
				{this.state.currentTab==='stats' && <Stats />}
			</main>
			<footer>
				<div className="container">
					
				</div>
			</footer>
		</div>;
	}
});

module.exports = Admin;
