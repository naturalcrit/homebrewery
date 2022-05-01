const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

const UIPage = require('../basePages/uiPage/uiPage.jsx');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
const NewBrew = require('../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../navbar/help.navitem.jsx');

const AccountPage = createClass({
	displayName     : 'AccountPage',
	getDefaultProps : function() {
		return {
			brew    : {},
			uiItems : []
		};
	},
	getInitialState : function() {
		return {
			uiItems : this.props.uiItems
		};
	},

	navItems : function() {
		return <Navbar>
			<Nav.section>
				<NewBrew />
				<HelpNavItem />
				<RecentNavItem />
				<Account />
			</Nav.section>
		</Navbar>;
	},

	uiItems : function() {
		const result = <>
			<h1>Account Information</h1>
			<p><strong>Username: </strong> {this.props.uiItems.username}</p>
			<p><strong>Issued: </strong> {this.props.uiItems.issued}</p>
		</>;

		return result;
	},

	render : function(){
		return <UIPage brew={this.props.brew} uiItems={this.uiItems()} ></UIPage>;
	}
});

module.exports = AccountPage;
