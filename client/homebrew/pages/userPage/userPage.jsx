import React, { useState } from 'react';
import _ from 'lodash';

import ListPage from '../basePages/listPage/listPage.jsx';

import Nav from './client/homebrew/navbar/nav.jsx';
import Navbar from './client/homebrew/navbar/navbar.jsx';
import RecentNavItems from './client/homebrew/navbar/recent.navitem.jsx';
const { both: RecentNavItem } = RecentNavItems;
import Account from './client/homebrew/navbar/account.navitem.jsx';
import NewBrew from './client/homebrew/navbar/newbrew.navitem.jsx';
import HelpNavItem from './client/homebrew/navbar/help.navitem.jsx';
import ErrorNavItem from './client/homebrew/navbar/error-navitem.jsx';
import VaultNavitem from './client/homebrew/navbar/vault.navitem.jsx';

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

export default UserPage;
