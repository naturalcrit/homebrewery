require('./uiPage.less');
const React = require('react');
const createClass = require('create-react-class');


const { Menubar, MenuItem, MenuSection, MenuDropdown, MenuRule } = require('client/components/menubar/Menubar.jsx');
const NewBrewItem = require('client/homebrew/navbar/newbrew.navitem.jsx');
const PrintNavItem = require('client/homebrew/navbar/print.navitem.jsx');
const RecentNavItem = require('client/homebrew/navbar/recent.navitem.jsx').both;
const VaultNavItem = require('client/homebrew/navbar/vault.navitem.jsx');
const Account = require('client/homebrew/navbar/account.navitem.jsx');
const MainMenu = require('client/homebrew/navbar/mainMenu.navitem.jsx');

const renderNavbar = ()=>{
	return (
		<Menubar id='navbar'>
			<MenuSection className='navSection'>
				<MainMenu />
				<MenuDropdown id='brewMenu' className='brew-menu' groupName='Brew' icon='fas fa-pen-fancy' dir='down'>
					<NewBrewItem />
					<MenuItem disabled color='blue' href={`#`}>
							clone to new
					</MenuItem>
					<MenuRule />
					{global.account && <MenuItem href={`/user/${encodeURI(global.account.username)}`} color='purple' icon='fas fa-beer'>
							brews
					</MenuItem> }
					<RecentNavItem brew={null} storageKey='view' />
					<MenuRule />
					<MenuItem disabled color='blue' icon='fas fa-eye' href={null}>
							source
					</MenuItem>
					<MenuItem disabled color='blue' href={null}>
							download .txt
					</MenuItem>
					<MenuRule />
					<PrintNavItem />
				</MenuDropdown>
				<VaultNavItem />
			</MenuSection>

			<MenuSection className='navSection'>
				<MenuItem className='brewTitle'>Oh no!</MenuItem>
			</MenuSection>

			<MenuSection className='navSection'>
				<Account />
			</MenuSection>

		</Menubar>
	);
};

const UIPage = ({className, ...props})=>{

	return <div className={`uiPage sitePage ${className}`}>
		{renderNavbar()}

		<div className='content'>
			{props.children}
		</div>
	</div>;

};

UIPage.displayName = 'UIPage';

module.exports = UIPage;
