const React = require('react');
const { useState } = React;
const _ = require('lodash');

const ListPage = require('../basePages/listPage/listPage.jsx');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
const NewBrew = require('../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../navbar/help.navitem.jsx');
const ErrorNavItem = require('../../navbar/error-navitem.jsx');
const VaultNavitem = require('../../navbar/vault.navitem.jsx');

const UserPage = (props)=>{
	props = {
		username : '',
		brews    : [],
		query    : '',
		error    : null,
		...props
	};

	const [currentError, setCurrentError] = useState(error || null);

	const usernameWithS = username + (username.endsWith('s') ? `’` : `’s`);
	const groupedBrews = _.groupBy(brews, (brew)=>brew.published ? 'published' : 'private');

	const brewCollection = [
		{
			title : `${usernameWithS} published brews`,
			class : 'published',
			brews : groupedBrews.published || []
		},
		...(username === global.account?.username ? [{
			title : `${usernameWithS} unpublished brews`,
			class : 'unpublished',
			brews : groupedBrews.private || []
		}] : [])
	];

	const navItems = (
		<Navbar>
			<Nav.section>
				{currentError && (<ErrorNavItem error={currentError} parent={null}></ErrorNavItem>)}
				<NewBrew />
				<HelpNavItem />
				<VaultNavitem />
				<RecentNavItem />
				<Account />
			</Nav.section>
		</Navbar>
	);

	return (
		<ListPage brewCollection={brewCollection}  navItems={navItems} query={query} reportError={(error)=>setCurrentError(error)} />
	);
};

module.exports = UserPage;
