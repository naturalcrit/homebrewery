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

const Navbar = ({ account, brew, title = '', props }) => {
	const version = global.version || '0.0.0';
	const isMac = navigator.platform.toUpperCase().includes('MAC');
	const mod = isMac ? '⌘' : 'Ctrl';

	const renderTitle = () => {
		const cleanTitle = title.replace(/^\/+|\/+$/g, '');
		if (!brew.shareId) return <Nav.item className='brewTitle'>{cleanTitle || 'Home'}</Nav.item>;
		return (
			<Nav.item className='brewTitle' style={title.includes('edit') ? { cursor: 'default' } : {}}>
				{brew.title}
			</Nav.item>
		);
	};

	const renderEditLink = () => {
		if (!brew.editId) return null;

		const editLink = brew.googleId && !brew.stubbed ? brew.googleId + brew.editId : brew.editId;

		return (
			<Nav.item color='orange' icon='fas fa-pencil-alt' href={`/edit/${editLink}`}>
				edit
			</Nav.item>
		);
	};

	const renderFile = () => {
		return (
			<Dropdown groupName={'File'} customTrigger={<>File</>} icon={null} key={'file'}>
				<NewBrew />
				<Nav.item  disabled={!brew.shareId}>Save document</Nav.item>
				<div className='nav-section'>
					<PrintNavitem disabled={!brew.shareId}/>
					<Nav.item disabled={!brew.shareId}>Get txt</Nav.item>
				</div>
				<ShareNavitem />
				<div className='nav-section'>
					<Nav.item disabled={!brew.shareId}>Delete File</Nav.item>
					<Nav.item disabled={!brew.shareId}>Publish File</Nav.item>
					<Nav.item disabled={!brew.shareId}>Transfer File</Nav.item>
				</div>
			</Dropdown>
		);
	};

	const renderEdit = () => {
		return (
			<Dropdown groupName={'Edit'} customTrigger={<>Edit</>} icon={null} key={'edit'}>
				<div className='nav-section'>
					<Nav.item kbd={mod + ' + z'} disabled={!brew.shareId}>
						Undo
					</Nav.item>
					<Nav.item kbd={mod + ' + Shift + z'} disabled={!brew.shareId}>Redo</Nav.item>
					<Nav.item kbd={mod + ' + x'} disabled={!brew.shareId}>cut</Nav.item>
					<Nav.item kbd={mod + ' + c'} disabled={!brew.shareId}>copy</Nav.item>
					<Nav.item kbd={mod + ' + v'} disabled={!brew.shareId}>paste</Nav.item>
					<Nav.item kbd={mod + ' + f'} disabled={!brew.shareId}>Find / Replace</Nav.item>
				</div>
			</Dropdown>
		);
	};

	const renderGo = () => {
		return (
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
				<Dropdown className='navItem recent' groupName={'Recent Brews'} customTrigger={<>Recent Brews</>} icon={null} key={'recent'}>
					<RecentNavItem />
				</Dropdown>
			</Dropdown>
		);
	};

	return (
		<nav>
			<ul>
				<li className='menu-wrapper'>
					<a href='/'>Home</a>
				</li>
				{renderFile()}
				{renderEdit()}
				{renderGo()}
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
