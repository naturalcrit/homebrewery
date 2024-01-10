require('./admin.less');
const React = require('react');
const createClass = require('create-react-class');

const BrewTab = require('./tabs/brewTab/brewTab.jsx');
const UserTab = require('./tabs/userTab/userTab.jsx');

const Admin = createClass({
	getDefaultProps : function() {
		return {
			tab : 'brew',

			tabObject : {
				brew : <BrewTab></BrewTab>,
				user : <UserTab></UserTab>
			}
		};
	},

	getInitialState : function() {
		return {
			tab : this.props.tab
		};
	},

	handleTabChange : function(newTab){
		if(this.state.tab === newTab) return;
		this.setState({
			tab : newTab
		});
	},

	renderButton : function(label){
		if(!label) return;
		return <button className={`tab ${this.state.tab===label ? 'active' : ''}`} onClick={()=>this.handleTabChange(label)}>{label.toUpperCase()}</button>;
	},

	renderTabs : function(){
		return <div className='container tabContainer'>
			{this.renderButton('brew')}
			{this.renderButton('user')}
		</div>;
	},

	render : function(){
		return <div className='admin'>

			<header>
				<div className='container'>
					<i className='fas fa-rocket' />
					homebrewery admin
				</div>
			</header>
			{this.renderTabs()}
			{this.props.tabObject[this.state.tab]}
		</div>;
	}
});

module.exports = Admin;
