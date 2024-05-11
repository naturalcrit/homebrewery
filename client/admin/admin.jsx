require('./admin.less');
const React = require('react');
const createClass = require('create-react-class');


const BrewCleanup = require('./brewCleanup/brewCleanup.jsx');
const BrewLookup = require('./brewLookup/brewLookup.jsx');
const BrewCompress = require ('./brewCompress/brewCompress.jsx');
const Stats = require('./stats/stats.jsx');

const LockTools = require('./lockTools/lockTools.jsx');

const tabGroups = ['brews', 'locks'];

const Admin = createClass({
	getDefaultProps : function() {
		return {};
	},

	getInitialState : function() {
		return {
			currentTab : 'brews'
		};
	},

	handleClick : function(newTab) {
		if(this.state.currentTab === newTab) return;
		this.setState({
			currentTab : newTab
		});
	},

	renderBrewTools : function(){
		return <>
			<Stats />
			<hr />
			<BrewLookup />
			<hr />
			<BrewCleanup />
			<hr />
			<BrewCompress />
		</>;
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
					{tabGroups.map((name, idx)=>{
						return <button className={`tab ${this.state.currentTab === name ? 'active' : ''}`} key={idx} onClick={()=>{return this.handleClick(name);}}>{name.toUpperCase()}</button>;
					})}
				</div>
				{this.state.currentTab == 'brews' && this.renderBrewTools()}
				{this.state.currentTab == 'locks' && <LockTools />}
			</div>
		</div>;
	}
});

module.exports = Admin;
