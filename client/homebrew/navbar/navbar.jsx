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

const Navbar = ({ children, brew, title = '', props }) => {
	const version = global.version || '0.0.0';
	const isMac = navigator.platform.toUpperCase().includes('MAC');
	const mod = isMac ? '⌘' : 'Ctrl';
	const isBrew = !!brew && brew.shareId;
	const account = global.account;

	const slots = React.Children.toArray(children).reduce((acc, child) => {
		if (React.isValidElement(child)) {
			if (child.type === Navbar.File) acc.file = child;
			if (child.type === Navbar.Edit) acc.edit = child;
			if (child.type === Navbar.Go) acc.go = child;
		}
		return acc;
	}, {});

	const renderTitle = () => {
		const cleanTitle = title.replace(/^\/+|\/+$/g, '');
		if (!isBrew) return <Nav.item className='brewTitle'>{cleanTitle || 'Home'}</Nav.item>;
		return (
			<Nav.item className='brewTitle' style={title.includes('edit') ? { cursor: 'default' } : {}}>
				{brew.title}
			</Nav.item>
		);
	};

	const renderDownloadLink = () => {
		if (!isBrew) return <Nav.item disabled={!isBrew}>Get txt</Nav.item>;
		let shareLink = brew.shareId;
		if (brew.googleId && !brew.stubbed) {
			shareLink = brew.googleId + shareLink;
		}

		return (
			<Nav.item href={`/download/${shareLink}`} disabled={!isBrew}>
				Get txt
			</Nav.item>
		);
	};

	const renderFile = () => {
		return (
			<Dropdown groupName={'File'} customTrigger={<>File</>} icon={null} key={'file'}>
				<NewBrew />
				<Nav.item className='beta' disabled={!isBrew}>
					Save document
				</Nav.item>
				<div className='nav-section'>
					<PrintNavitem disabled={!isBrew} />
					{renderDownloadLink()}
				</div>
				<ShareNavitem brew={brew} disabled={!isBrew} currentPage={'' /*how the hell do i get it here?*/} />
				<div className='nav-section'>
					<Nav.item className='beta' disabled={!isBrew}>
						Delete File
					</Nav.item>
					<Nav.item className='beta' disabled={!isBrew}>
						Publish File
					</Nav.item>
					<Nav.item className='beta' disabled={!isBrew}>
						Transfer File
					</Nav.item>
				</div>
				{slots.file?.props.children}
			</Dropdown>
		);
	};

	const renderEdit = () => {
		return (
			<Dropdown groupName={'Edit'} customTrigger={<>Edit</>} icon={null} key={'edit'}>
				<div className='nav-section'>
					{slots.edit}
					<Nav.item className='beta' kbd={mod + ' + z'} disabled={!isBrew}>
						Undo
					</Nav.item>
					<Nav.item className='beta' kbd={mod + ' + Shift + z'} disabled={!isBrew}>
						Redo
					</Nav.item>
					<Nav.item className='beta' kbd={mod + ' + x'} disabled={!isBrew}>
						cut
					</Nav.item>
					<Nav.item className='beta' kbd={mod + ' + c'} disabled={!isBrew}>
						copy
					</Nav.item>
					<Nav.item className='beta' kbd={mod + ' + v'} disabled={!isBrew}>
						paste
					</Nav.item>
					<Nav.item className='beta' kbd={mod + ' + f'} disabled={!isBrew}>
						Find / Replace
					</Nav.item>
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


Navbar.File = () => null;
Navbar.Edit = () => null;
Navbar.Go = () => null;

export default Navbar;
