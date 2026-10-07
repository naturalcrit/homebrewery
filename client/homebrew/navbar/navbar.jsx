import './navbar.less';
import React from 'react';

import { Dropdown } from '@components/dropdown/dropdown.jsx';
import NewBrew from './newbrew.navitem';
import PrintNavitem from './print.navitem.jsx';
import ShareNavitem from './share.navitem.jsx';
import HelpNavitem from './help.navitem.jsx';
import RecentNavItems from './recent.navitem.jsx';
import Account from './account.navitem.jsx';
const { both: RecentNavItem } = RecentNavItems;
import Nav from './nav.jsx';

const Navbar = ({ account, brew, title, props }) => {
	const version = global.version || '0.0.0';

	const isMac = navigator.platform.toUpperCase().includes("MAC");
	const mod = isMac ? "⌘" : "Ctrl";

	const renderTitle = () => {
		//if vault
		const cleanTitle = title.replace(/^\/+|\/+$/g, '');
		if (!brew.shareId) return <Nav.item className='brewTitle'>{cleanTitle || 'Home'}</Nav.item>;
		return (
			<Nav.item className='brewTitle' style={disableMeta ? { cursor: 'default' } : {}}>
				{brew.title}
			</Nav.item>
		);
	};

	const renderEdit = () => {
		if (!brew.editId) return null;

		const editLink = brew.googleId && !brew.stubbed ? brew.googleId + brew.editId : brew.editId;

		return (
			<Nav.item color='orange' icon='fas fa-pencil-alt' href={`/edit/${editLink}`}>
				edit
			</Nav.item>
		);
	};

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
						<Nav.item kbd={mod + ' + z'} disabled>Undo</Nav.item>
						<Nav.item kbd={mod + ' + Shift + z'}>Redo</Nav.item>
						<Nav.item kbd={mod + ' + x'}>cut</Nav.item>
						<Nav.item kbd={mod + ' + c'}>copy</Nav.item>
						<Nav.item kbd={mod + ' + v'}>paste</Nav.item>
						<Nav.item kbd={mod + ' + f'}>Find / Replace</Nav.item>
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
					<div className='nav-section'>
						<Nav.item href={`/user/${encodeURIComponent(global.account.username)}`} color='yellow' icon='fas fa-beer'>
							brews
						</Nav.item>
						<Nav.item className='account' color='orange' icon='fas fa-user' href='/account'>
							account
						</Nav.item>
					</div>
					<Dropdown className='navItem recent' groupName={'Recent Brews'} customTrigger={<>Recent Brews</>} icon={null} key={'recent'}>
						<RecentNavItem />
					</Dropdown>
				</Dropdown>
				<Dropdown groupName={'Help'} customTrigger={<>Help</>} icon={null} key={'help'}>
					<HelpNavitem />
				</Dropdown>
			</ul>
			{renderTitle()}
			<ul>
				<Dropdown groupName={account.username} customTrigger={<>{account.username}</>} icon={null} key={account.username}>
					<Account />
				</Dropdown>
			</ul>
		</nav>
	);
};

export default Navbar;
