import './navbar.less';
import React from 'react';

import { Dropdown } from '@components/dropdown/dropdown.jsx';
import NewBrewNavItem from './newbrew.navitem';
import PrintNavItem from './print.navitem.jsx';
import ShareNavItem from './share.navitem.jsx';
import HelpNavItem from './help.navitem.jsx';
import RecentNavItems from './recent.navitem.jsx';
import MetadataNavItem from './metadata.navitem.jsx'
import AccountNavItem from './account.navitem.jsx';
const { both: RecentNavItem } = RecentNavItems;
import Nav from './nav.jsx';

const Navbar = ({ children, brew, pageName, editor, title, currentPage, props }) => {
	const version = global.version || '0.0.0';
	const isMac = navigator.platform.toUpperCase().includes('MAC');
	const mod = isMac ? '⌘' : 'Ctrl';
	const isBrew = !!brew &&(brew.shareId || pageName === 'homePage' || pageName === 'newPage');
	const account = global.account;
	const generalPage = pageName === 'vaultPage' || pageName === 'changelog' || pageName === 'faq' || pageName === 'migrate';

	const slots = React.Children.toArray(children).reduce((acc, child) => {
		if (React.isValidElement(child)) {
			if (child.type === Navbar.File) acc.file = child;
			if (child.type === Navbar.Edit) acc.edit = child;
			if (child.type === Navbar.Go) acc.go = child;
		}
		return acc;
	}, {});

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

	const renderEditLink = () => {
		const editLink = brew?.googleId && !brew?.stubbed ? brew?.googleId + brew?.editId : brew?.editId;
		return (
			<Nav.item href={`/edit/${editLink}`} disabled={!brew?.editId}>
				edit this brew
			</Nav.item>
		);
	};

	const renderFile = () => {
		return (
			<Dropdown groupName={'File'} customTrigger={<>File</>} icon={null} key={'file'}>
				<NewBrewNavItem />
				<div className='nav-section'>
					<PrintNavItem disabled={!isBrew} />
					{renderDownloadLink()}
				</div>
				<div className='nav-section'>
					<Nav.item href={`/new/${brew?.shareId}`} disabled={!isBrew}>
						Clone File
					</Nav.item>
					{/*
					<Nav.item className='beta' disabled={!isBrew}>
						Delete File
					</Nav.item>
					<Nav.item className='beta' disabled={!isBrew}>
						Publish File
					</Nav.item>
					<Nav.item className='beta' disabled={!isBrew}>
						Transfer File
					</Nav.item>
					*/}
				</div>
				{slots.file?.props.children}
			</Dropdown>
		);
	};

	const renderEdit = () => {
		return (
			<Dropdown groupName={'Edit'} customTrigger={<>Edit</>} icon={null} key={'edit'}>
				<div className='nav-section'>
					<Nav.item onClick={() => editor?.undo()} kbd={mod + ' + z'} disabled={!editor}>
						Undo
					</Nav.item>
					<Nav.item onClick={() => editor?.redo()} kbd={mod + ' + Shift + z'} disabled={!editor}>
						Redo
					</Nav.item>
					<Nav.item onClick={() => editor?.find()} kbd={mod + ' + f'} disabled={!editor}>
						Find / Replace
					</Nav.item>
					<Nav.item onClick={() => editor?.foldCode()} disabled={!editor}>
						Fold all lines
					</Nav.item>
					<Nav.item onClick={() => editor?.unfoldCode()} disabled={!editor}>
						Unfold all lines
					</Nav.item>
				</div>
				{slots.edit?.props.children}
				{/*
				<div className="nav-section">
					<Nav.item onClick={()=>editor?.cut()} kbd={mod + ' + x'} disabled={!editor}>
						cut
					</Nav.item>
					<Nav.item onClick={()=>editor?.copy()} kbd={mod + ' + c'} disabled={!editor}>
						copy
					</Nav.item>
					<Nav.item onClick={()=>editor?.paste()} kbd={mod + ' + v'} disabled={!editor}>
						paste
					</Nav.item>
				</div>
				*/}
			</Dropdown>
		);
	};

	const renderGo = () => {
		return (
			<Dropdown groupName={'Go'} customTrigger={<>Go</>} icon={null} key={'go'}>
				{renderEditLink()}
				<ShareNavItem brew={brew} disabled={!brew?.shareId} currentPage={'' /*how the hell do i get it here?*/} />
				<div className='nav-section'>
					<Nav.item className='patreon' newTab={true} href='https://www.patreon.com/NaturalCrit' color='green' icon='fas fa-heart'>
						Patreon
					</Nav.item>
					<Nav.item icon='fas fa-dungeon' href='/vault' newTab={false} rel='noopener noreferrer'>
						Vault
					</Nav.item>
					<Nav.item icon='far fa-file-alt' href='/changelog' newTab={false} rel='noopener noreferrer'>
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
					<HelpNavItem />
				</Dropdown>
			</ul>
			{generalPage && <Nav.item className='brewTitle'>{title}</Nav.item>}
			<MetadataNavItem brew={brew}></MetadataNavItem>
			<ul>
				<Dropdown groupName={account.username} customTrigger={<>{account.username}</>} icon={null} key={account.username}>
					<AccountNavItem />
				</Dropdown>
			</ul>
		</nav>
	);
};

export default Navbar;
