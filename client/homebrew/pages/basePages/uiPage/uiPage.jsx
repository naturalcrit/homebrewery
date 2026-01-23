import './uiPage.less';
import React from 'react';
import createReactClass from 'create-react-class';

import Nav from './client/homebrew/navbar/nav.jsx';
import Navbar from './client/homebrew/navbar/navbar.jsx';
import NewBrewItem from './client/homebrew/navbar/newbrew.navitem.jsx';
import HelpNavItem from './client/homebrew/navbar/help.navitem.jsx';
import RecentNavItems from './client/homebrew/navbar/recent.navitem.jsx';
const { both: RecentNavItem } = RecentNavItems;
import Account from './client/homebrew/navbar/account.navitem.jsx';


const UIPage = createReactClass({
	displayName : 'UIPage',

	render : function(){
		return <div className='uiPage sitePage'>
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{this.props.brew.title}</Nav.item>
				</Nav.section>

				<Nav.section>
					<NewBrewItem />
					<HelpNavItem />
					<RecentNavItem />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content'>
				{this.props.children}
			</div>
		</div>;
	}
});

export default UIPage;
