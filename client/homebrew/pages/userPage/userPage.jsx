const React = require('react');
const { useState } = React;
const _ = require('lodash');

const ListPage = require('../basePages/listPage/listPage.jsx');

const Nav = require('client/homebrew/navbar/nav.jsx');
const Navbar = require('client/homebrew/navbar/navbar.jsx');
const RecentNavItem = require('client/homebrew/navbar/recent.navitem.jsx').both;
const Account = require('client/homebrew/navbar/account.navitem.jsx');
const NewBrew = require('client/homebrew/navbar/newbrew.navitem.jsx');
const HelpNavItem = require('client/homebrew/navbar/help.navitem.jsx');
const ErrorNavItem = require('client/homebrew/navbar/error-navitem.jsx');
const VaultNavitem = require('client/homebrew/navbar/vault.navitem.jsx');

const UserPage = (props)=>{
	props = {
		username : '',
		brews    : [],
		query    : '',
		...props
	};

	const [error, setError] = useState(null);

	const usernameWithS = props.username + (props.username.endsWith('s') ? `’` : `’s`);
	const groupedBrews = _.groupBy(props.brews, (brew)=>brew.published ? 'published' : 'private');

	const brewCollection = [
		{
			title : `${usernameWithS} published brews`,
			class : 'published',
			brews : groupedBrews.published || []
		},
		...(props.username === global.account?.username ? [{
			title : `${usernameWithS} unpublished brews`,
			class : 'unpublished',
			brews : groupedBrews.private || []
		}] : [])
	];

	const clearError = ()=>{
		setError(null);
	};

	const navItems = (
		<Navbar>
			<Nav.section>
				{error && (<ErrorNavItem error={error} clearError={clearError}></ErrorNavItem>)}
				<NewBrew />
				<HelpNavItem />
				<VaultNavitem />
				<RecentNavItem />
				<Account />
			</Nav.section>
		</Navbar>
	);

	return (
		<ListPage brewCollection={brewCollection}  navItems={navItems} query={props.query} reportError={(err)=>setError(err)} />
	);
};

module.exports = UserPage;
