require('./navbar.less');
const React = require('react');


const { MenuDropdown, MenuItem } = require('../../components/menubar/Menubar.jsx');
const HelpNavItems = require('./help.navitem.jsx');
const PatreonNavItem = require('./patreon.navitem.jsx');





const NaturalCritIcon = require('naturalcrit/svg/naturalcrit.svg.jsx');

const MainMenu = () => {

	const customTrigger = <><NaturalCritIcon />The Homebrewery</>;

	return (
		<MenuDropdown id='mainMenu' className='mainMenu' groupName='The Homebrewery' customTrigger={customTrigger}>
			<MenuItem id='naturalCritItem' newTab={true} href='https://www.naturalcrit.com' color='blue'>
				<span className='natural'>Natural<span className='crit'>Crit</span></span>
			</MenuItem>
			<MenuItem newTab={true} href='/changelog' color='purple' icon='far fa-file-alt'>
				{`v${global.version}`}
			</MenuItem>
			<HelpNavItems />
			<PatreonNavItem />
		</MenuDropdown>
	)
};

module.exports = MainMenu;