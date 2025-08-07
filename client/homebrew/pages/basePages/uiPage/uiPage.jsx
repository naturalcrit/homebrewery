require('./uiPage.less');
const React = require('react');
const createClass = require('create-react-class');


const { Menubar, MenuItem, MenuSection, MenuDropdown, MenuRule } = require('client/components/menubar/Menubar.jsx');
const NewBrewItem = require('client/homebrew/mainNavigationBar/newbrew.navitem.jsx');
const PrintNavItem = require('client/homebrew/mainNavigationBar/print.navitem.jsx');
const RecentNavItem = require('client/homebrew/mainNavigationBar/recent.navitem.jsx').both;
const VaultNavItem = require('client/homebrew/mainNavigationBar/vault.navitem.jsx');
const Account = require('client/homebrew/mainNavigationBar/account.navitem.jsx');
const MainMenu = require('client/homebrew/mainNavigationBar/mainMenu.navitem.jsx');


const renderNavbar = ()=>{
	return (
		<MainNavigationBar />
	);
};
import MainNavigationBar from 'client/homebrew/navbar/mainNavigationBar.jsx';

const UIPage = ({className, ...props})=>{

	return <div className={`uiPage sitePage ${className}`}>
		<MainNavigationBar />

		<div className='content'>
			{props.children}
		</div>
	</div>;

};

UIPage.displayName = 'UIPage';

module.exports = UIPage;
