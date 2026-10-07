import './navbar.less';
import React from 'react';

import { Dropdown } from '@components/dropdown/dropdown.jsx';
import NewBrew from './newbrew.navitem';
import PrintNavitem from './print.navitem.jsx';
import ShareNavitem from './share.navitem.jsx';
import HelpNavitem from './help.navitem.jsx';
import RecentNavItems from './recent.navitem.jsx';
const { both: RecentNavItem } = RecentNavItems;
import Nav from './nav.jsx';

import useCommonEditPageFunctions from '../../homebrew/utils/commonEditPageFunctions.jsx';

const Navbar = ({ children }) => {
	const version = global.version || '0.0.0';

	return (
		<nav>
			<ul>
				<li className='menu-wrapper'>
					<a href='/'>Home</a>
				</li>
				<Dropdown groupName={'File'} customTrigger={<>File</>} icon={null} key={'file'}>
					<NewBrew />
					<li className='navItem'>Save document</li>
					<div className='nav-section'>
						<PrintNavitem />
						<li className='navItem'>Get txt</li>
					</div>
					<ShareNavitem />
					<div className='nav-section'>
						<li className='navItem'>Delete File</li>
						<li className='navItem'>Publish File</li>
						<li className='navItem'>Transfer File</li>
					</div>
				</Dropdown>
				<Dropdown groupName={'Edit'} customTrigger={<>Edit</>} icon={null} key={'edit'}>
					<div className='nav-section'>
						<li className='navItem'>Undo</li>
						<li className='navItem'>Redo</li>
						<li className='navItem'>Cut</li>
						<li className='navItem'>Copy</li>
						<li className='navItem'>Paste</li>
						<li className='navItem'>Find</li>
						<li className='navItem'>Find and Replace</li>
					</div>
				</Dropdown>
				<Dropdown groupName={'Go'} customTrigger={<>Go</>} icon={null} key={'go'}>
					<div className='nav-section'>
						<Nav.item className='patreon' newTab={true} href='https://www.patreon.com/NaturalCrit' color='green' icon='fas fa-heart'>
							Patreon
						</Nav.item>
						<Nav.item color='purple' icon='fas fa-dungeon' href='/vault' newTab={false} rel='noopener noreferrer'>
							Vault
						</Nav.item>
						<Nav.item color='purple' icon='fas fa-dungeon' href='/changelog' newTab={false} rel='noopener noreferrer'>
							Changelog
						</Nav.item>
					</div>

					<HelpNavitem />

					<div className='nav-section'>
						<Nav.item href={`/user/${encodeURIComponent(global.account.username)}`} color='yellow' icon='fas fa-beer'>
							brews
						</Nav.item>
						<Nav.item className='account' color='orange' icon='fas fa-user' href='/account'>
							account
						</Nav.item>
					</div>
					<Dropdown className='navItem' groupName={'Recent Brews'} customTrigger={<>Recent Brews</>} icon={null} key={'recent'}>
						<RecentNavItem />
					</Dropdown>
				</Dropdown>
				<li>Help</li>
				<li>User</li>
			</ul>
		</nav>
	);
};

export default Navbar;
