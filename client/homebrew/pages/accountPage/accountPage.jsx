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
		// console.log(this.props.uiItems);
		return [
			<>
				<h1>Account Information  <i className='fas fa-user'></i></h1>
				<p><strong>Username: </strong> {this.props.uiItems.username || 'No user currently logged in'}</p>
				<p><strong>Last Login: </strong> {moment(this.props.uiItems.issued).format('dddd, MMMM Do YYYY, h:mm:ss a ZZ') || '-'}</p>
			</>,
			<>
				<h3>Homebrewery Information <NaturalCritIcon /></h3>
				<p><strong>Brews on Homebrewery: </strong> {this.props.uiItems.mongoCount || '-'}</p>
			</>,
			<>
				<h3>Google Information <i className='fab fa-google-drive'></i></h3>
				<p><strong>Linked to Google: </strong> {this.props.uiItems.googleId ? 'YES' : 'NO'}</p>
				{this.props.uiItems.googleId ? <p><strong>Brews on Google Drive: </strong> {this.props.uiItems.fileCount || '-'}</p> : '' }
			</>
		];
	},

	render : function(){
		return <UIPage brew={this.props.brew} renderUiItems={this.renderUiItems} ></UIPage>;
	}
});

module.exports = AccountPage;
