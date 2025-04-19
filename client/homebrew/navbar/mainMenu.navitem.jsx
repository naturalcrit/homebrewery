require('./navbar.less');
const React = require('react');


const { Dropdown, NavSection, NavItem } = require('./navbar.jsx');
const HelpNavItems = require('./help.navitem.jsx');
const PatreonNavItem = require('./patreon.navitem.jsx');





const NaturalCritIcon = require('naturalcrit/svg/naturalcrit.svg.jsx');

const MainMenu = () => {
	return (
		<NavSection className='mainMenu'>
			<Dropdown id='mainMenu' trigger='click' className='mainMenu'>
				<NavItem className='homebrewLogo'>
					<NaturalCritIcon />The Homebrewery
				</NavItem>
				<NavItem id='naturalCritItem' newTab={true} href='https://www.naturalcrit.com' color='blue'>
					<span className='natural'>Natural<span className='crit'>Crit</span></span>
				</NavItem>
				<NavItem newTab={true} href='/changelog' color='purple' icon='far fa-file-alt'>
					{`v${global.version}`}
				</NavItem>
				<HelpNavItems />
				<PatreonNavItem />
			</Dropdown>
		</NavSection>
	)
};

module.exports = MainMenu;