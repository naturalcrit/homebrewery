require('./editPage.less');
const React = require('react');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../../navbar/navbar.jsx');
const NewBrewItem = require('../../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../../navbar/help.navitem.jsx');
const PrintNavItem = require('../../../navbar/print.navitem.jsx');
const ErrorNavItem = require('../../../navbar/error-navitem.jsx');
const AccountNavItem = require('../../../navbar/account.navitem.jsx');
const RecentNavItem = require('../../../navbar/recent.navitem.jsx').both;
const VaultNavItem = require('../../../navbar/vault.navitem.jsx');

const BaseEditPage = (props)=>{
	return (
		<div className={`sitePage ${props.className || ''}`}>
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{props.brew.title}</Nav.item>
				</Nav.section>
				<Nav.section>
					{props.navButtons}
					<PrintNavItem />
					<NewBrewItem />
					<HelpNavItem />
					<VaultNavItem />
					<RecentNavItem brew={props.brew} storageKey={props.recentStorageKey} />
					<AccountNavItem />
				</Nav.section>
			</Navbar>

			{props.children}
		</div>
	);	
};

module.exports = BaseEditPage;
