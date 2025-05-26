require('./navbar.less');
const React = require('react');
const dedent = require('dedent-tabs').default;

const { MenuDropdown, MenuItem } = require('../../components/menubar/Menubar.jsx');
const NaturalCritIcon = require('naturalcrit/svg/naturalcrit.svg.jsx');

const MainMenu = ()=>{

	const customTrigger = <><NaturalCritIcon /><span className='name'>The Homebrewery</span></>;

	return (
		<MenuDropdown id='mainMenu' className='mainMenu' groupName='The Homebrewery' customTrigger={customTrigger} color='blue'>
			<MenuItem id='naturalCritItem' newTab={true} href='https://www.naturalcrit.com' color='blue'>
				<span className='natural'>Natural<span className='crit'>Crit</span></span>
			</MenuItem>
			<MenuItem newTab={true} href='/changelog' color='purple' icon='far fa-file-alt'>
				{`v${global.version}`}
			</MenuItem>
			<MenuItem color='red' icon='fas fa-fw fa-bug'
				href={`https://www.reddit.com/r/homebrewery/submit?selftext=true&text=${encodeURIComponent(dedent`
				- **Browser(s)** :
				- **Operating System** :  
				- **Legacy or v3 Renderer** :
				- **Issue** :  `)}`}
				newTab={true}
				rel='noopener noreferrer'>
				report to reddit
			</MenuItem>
			<MenuItem color='green'
				href='/faq'
				newTab={true}
				rel='noopener noreferrer'>
				FAQ
			</MenuItem>
			<MenuItem color='blue'
				href='/migrate'
				newTab={true}
				rel='noopener noreferrer'>
				migrate
			</MenuItem>
			<MenuItem
				className='patreon'
				newTab={true}
				href='https://www.patreon.com/NaturalCrit'
				color='green'
				icon='fas fa-heart'>
				Patreon
			</MenuItem>
		</MenuDropdown>
	)
};

module.exports = MainMenu;