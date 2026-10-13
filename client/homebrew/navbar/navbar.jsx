import './navbar.less';
import React from 'react';

import { Dropdown } from '@components/dropdown/dropdown.jsx';
import NewBrewNavItem from './newbrew.navitem';
import PrintNavItem from './print.navitem.jsx';
import ShareNavItem from './share.navitem.jsx';
import HelpNavItem from './help.navitem.jsx';
import RecentNavItems from './recent.navitem.jsx';
import MetadataNavItem from './metadata.navitem.jsx';
import AccountNavItem from './account.navitem.jsx';
const { both: RecentNavItem } = RecentNavItems;
import Nav from './nav.jsx';

const Navbar = ({ children, brew, pageName, editor, title, currentPage, props })=>{
	const isMac = navigator.platform.toUpperCase().includes('MAC');
	const mod = isMac ? '⌘' : 'Ctrl';

	const navSlots = React.Children.toArray(children).reduce((slots, child)=>{
		if(!React.isValidElement(child)) return slots;
		const content = child.props.children;

		//To create new items inside the dropdowns call them with Navbar.[DropdownName]
		if(child.type === Navbar.File) slots.file = content;
		else if(child.type === Navbar.Edit) slots.edit = content;
		else if(child.type === Navbar.Go) slots.go = content;
		else if(child.type === Navbar.Help) slots.help = content;
		//create a new dropdown with Navbar.Menu
		else if(child.type === Navbar.Menu) slots.menu = content;

		return slots;
	}, {});

	const renderFile = ()=>{
		let shareLink = brew?.shareId;
		if(brew?.googleId && !brew?.stubbed) {
			shareLink = brew?.googleId + shareLink;
		}

		return (
			<Dropdown groupName={'File'} customTrigger={<>File</>} icon={null} key={'file'}>
				<NewBrewNavItem />
				<Dropdown className='navItem recent' groupName={'Recent Brews'} icon={'fas fa-history'} key={'recent'}>
					<RecentNavItem brew={brew} pageName={pageName} />
				</Dropdown>
				<div className='nav-section'>
					<Nav.item icon={'fas fa-clone'} href={`/new/${brew?.shareId}`} disabled={!brew?.shareId}>
						Clone Brew
					</Nav.item>
				</div>
				<div className='nav-section'>
					<Nav.item icon='fas fa-download' href={`/download/${shareLink}`} disabled={!brew?.shareId}>
						Download raw text
					</Nav.item>
					<PrintNavItem disabled={pageName !== 'newPage' && pageName !== 'editPage' && pageName !== 'editPage'} />
				</div>
				{navSlots.file}
			</Dropdown>
		);
	};

	const renderEdit = ()=>{
		return (
			<Dropdown groupName={'Edit'} customTrigger={<>Edit</>} icon={null} key={'edit'}>
				<div className='nav-section'>
					<Nav.item icon={'fas fa-undo'} onClick={()=>editor?.undo()} kbd={`${mod} + z`} disabled={!editor}>
						Undo
					</Nav.item>
					<Nav.item icon={'fas fa-redo'} onClick={()=>editor?.redo()} kbd={`${mod} + Shift + z`} disabled={!editor}>
						Redo
					</Nav.item>
					<Nav.item icon={'fas fa-search'} onClick={()=>editor?.find()} kbd={`${mod} + f`} disabled={!editor}>
						Find / Replace
					</Nav.item>
					<Nav.item icon={'fas fa-compress-alt'} onClick={()=>editor?.foldCode()} disabled={!editor}>
						Fold all lines
					</Nav.item>
					<Nav.item icon={'fas fa-expand-alt'} onClick={()=>editor?.unfoldCode()} disabled={!editor}>
						Unfold all lines
					</Nav.item>
				</div>
				{navSlots.edit}
			</Dropdown>
		);
	};

	const renderGo = ()=>{
		return (
			<Dropdown groupName={'Go'} customTrigger={<>Go</>} icon={null} key={'go'}>
				<div className='nav-section'>
					<Nav.item className='patreon' newTab={true} href='https://www.patreon.com/NaturalCrit' icon='fas fa-heart'>
						Patreon
					</Nav.item>
				</div>
				<ShareNavItem brew={brew} disabled={!brew?.shareId} currentPage={currentPage} />
				{navSlots.go}
			</Dropdown>
		);
	};

	const renderHelp = ()=>{
		return <Dropdown groupName={'Help'} customTrigger={<>Help</>} icon={null} key={'help'}>
			<HelpNavItem />
			<div className="nav-section">
				<Nav.item icon='far fa-file-alt' href='/changelog' newTab={false} rel='noopener noreferrer'>
					Changelog
				</Nav.item>
				<Nav.item icon='fab fa-github' href='https://github.com/naturalcrit/homebrewery' newTab={true} rel='noopener noreferrer'>
					Github
				</Nav.item>
			</div>
			{navSlots.help}
		</Dropdown>;
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
				{renderHelp()}
				<Nav.item href='/vault' newTab={false} rel='noopener noreferrer'>
					Vault
				</Nav.item>
				{navSlots.menu}
			</ul>
			{pageName !== 'sharePage' && <Nav.header className='brewTitle'>{title}</Nav.header>}
			<MetadataNavItem brew={brew} pageName={pageName}></MetadataNavItem>
			<ul>
				<AccountNavItem />
			</ul>
		</nav>
	);
};

Navbar.File = ({ children })=>children;
Navbar.Edit = ({ children })=>children;
Navbar.Go = ({ children })=>children;
Navbar.Help = ({ children })=>children;
Navbar.Menu = ({ children })=>children;

export default Navbar;
