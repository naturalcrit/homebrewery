const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const moment = require('moment');

const UIPage = require('../basePages/uiPage/uiPage.jsx');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
const NewBrew = require('../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../navbar/help.navitem.jsx');

const NaturalCritIcon = require('naturalcrit/svg/naturalcrit.svg.jsx');

const saveLocationKey = 'HOMEBREWERY-DEFAULT-SAVE-LOCATION';

const AccountPage = createClass({
	displayName     : 'AccountPage',
	getDefaultProps : function() {
		return {
			brew    : {},
			uiItems : {}
		};
	},
	getInitialState : function() {
		return {
			uiItems : this.props.uiItems
		};
	},
	componentDidMount : function(){
		if(!this.state.saveLocation) {
			const saveLocation =  window.localStorage.getItem(saveLocationKey) || '';
			if(saveLocation == '') {
				// TO DO: Implement logic to determine the appropriate location given current state
				console.log(this.state.uiItems);
			};
			this.setState({
				saveLocation : saveLocation
			});
		}
	},

	makeActive : function(newSelection){
		if(this.state.saveLocation == newSelection) return;
		window.localStorage.setItem(saveLocationKey, newSelection);
		this.setState({
			saveLocation : newSelection
		});
	},

	renderButton : function(name, key, condition=true){
		if(!condition) return;
		return <button className={this.state.saveLocation==key ? 'active' :	''}	onClick={()=>{this.makeActive(key);}}>{name}</button>;
	},

	renderNavItems : function() {
		return <Navbar>
			<Nav.section>
				<NewBrew />
				<HelpNavItem />
				<RecentNavItem />
				<Account />
			</Nav.section>
		</Navbar>;
	},

	renderUiItems : function() {
		return 	<>
			<div className='dataGroup'>
				<h1>Account Information  <i className='fas fa-user'></i></h1>
				<p><strong>Username: </strong> {this.props.uiItems.username || 'No user currently logged in'}</p>
				<p><strong>Last Login: </strong> {moment(this.props.uiItems.issued).format('dddd, MMMM Do YYYY, h:mm:ss a ZZ') || '-'}</p>
			</div>
			<div className='dataGroup'>
				<h4>Default Save Location</h4>
				{/* <button className={this.state.saveLocation=='HOMEBREWERY' ? 'active' : ''} onClick={()=>{this.makeActive('HOMEBREWERY');}}>Homebrewery</button> */}
				{this.renderButton('Homebrewery', 'HOMEBREWERY')}
				{/* {this.state.uiItems.googleId ? <button className={this.state.saveLocation=='GOOGLE-DRIVE' ? 'active' : ''} onClick={()=>{this.makeActive('GOOGLE-DRIVE');}}>Google Drive</button> : <></>} */}
				{this.renderButton('Google Drive', 'GOOGLE-DRIVE', this.state.uiItems.username)}
			</div>
			<div className='dataGroup'>
				<h3>Homebrewery Information <NaturalCritIcon /></h3>
				<p><strong>Brews on Homebrewery: </strong> {this.props.uiItems.mongoCount}</p>
			</div>
			<div className='dataGroup'>
				<h3>Google Information <i className='fab fa-google-drive'></i></h3>
				<p><strong>Linked to Google: </strong> {this.props.uiItems.googleId ? 'YES' : 'NO'}</p>
				{this.props.uiItems.googleId &&
					<p>
						<strong>Brews on Google Drive: </strong> {this.props.uiItems.googleCount ?? <>Unable to retrieve files - <a href='https://github.com/naturalcrit/homebrewery/discussions/1580'>follow these steps to renew your Google credentials.</a></>}
					</p>
				}
			</div>
		</>;
	},

	render : function(){
		return <UIPage brew={this.props.brew}>
			{this.renderUiItems()}
		</UIPage>;
	}
});

module.exports = AccountPage;
