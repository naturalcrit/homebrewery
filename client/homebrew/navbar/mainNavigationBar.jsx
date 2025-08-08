require('./navbar.less');
import React from 'react';
import { useLocation } from 'react-router';

// todo: add back in autosave toggle and save location buttons as components
// todo: set Share and Copy Url items to trigger popover with option to "save", if on /new or /home

import { Menubar, MenuItem, MenuSection, MenuDropdown, MenuRule } from 'client/components/menubar/menubar.jsx';

import './save.navitem.jsx'; 
import './autoSaveToggle.navitem.jsx';

import Alerts from './alerts.navitem.jsx';
import NewBrewItem from './newbrew.navitem.jsx';
import PrintNavItem from './print.navitem.jsx';
import Account from './account.navitem.jsx';
const RecentNavItem = require('./recent.navitem.jsx').both;
import VaultNavItem from './vault.navitem.jsx';
import MainMenu from './mainMenu.navitem.jsx';

const MainNavigationBar = ({ brew, alerts, setAutoSaveWarning, trySave, unsavedTime, autoSave, toggleAutoSave })=>{

	const page = useLocation().pathname;

	const processShareId = ()=>{
		if(brew?.googleId && !brew?.stubbed) {
			return brew.googleId + brew.shareId;
		}
		return brew?.shareId || '';
	};

	const getRedditLink = ()=>{
		const shareLink = processShareId();
		const systems = brew.systems.length > 0 ? ` [${brew.systems.join(' - ')}]` : '';
		const title = `${brew.title} ${systems}`;
		const text = `Hey guys! I've been working on this homebrew. I'd love your feedback. Check it out.

**[Homebrewery Link](${global.config.baseUrl}/share/${shareLink})**`;

		return `https://www.reddit.com/r/UnearthedArcana/submit?title=${encodeURIComponent(title.toWellFormed())}&text=${encodeURIComponent(text)}`;
	};


	const shareLink = processShareId();

	return (<nav id='navbar' aria-label='Main Menubar'>
		<Menubar>
			<MenuSection>
				<MainMenu />
				<MenuDropdown id='brewMenu' className='brew-menu' groupName='Brew' icon='fas fa-pen-fancy' dir='down' color='orange'>
					<NewBrewItem />
					{brew && <>
						{/* <MenuRule />
							{this.renderAutoSaveButton()}
							{this.renderStoragePicker()} */}
						{(page.startsWith('/edit/') || page.startsWith('/new')) &&
								<>
									<MenuItem.Save alerts={alerts}
										setAutoSaveWarning={setAutoSaveWarning}
										unsavedTime={unsavedTime}
										trySave={trySave}
										autoSave={autoSave} />
									<MenuItem.Autosave autoSaveActive={autoSave} toggleAutoSave={toggleAutoSave} disabled={page.startsWith('/new') ? true : null} />
								</>}
						<MenuRule />
						{global.account && <MenuItem href={`/user/${encodeURI(global.account.username)}`} color='purple' icon='fas fa-beer'>
								brews
						</MenuItem> }
						<RecentNavItem brew={brew} storageKey='edit' />
						<MenuRule />
						<MenuItem color='blue' href={`/share/${shareLink}`} icon='fas fa-share-from-square'>
								share
						</MenuItem>
						<MenuItem color='blue' onClick={()=>{navigator.clipboard.writeText(`${global.config.baseUrl}/share/${shareLink}`);}}>
								copy url
						</MenuItem>
						{(page.startsWith('/edit/')) &&
							<MenuItem color='blue' href={getRedditLink()} newTab={true} rel='noopener noreferrer'>
									post to reddit
							</MenuItem>
						}
						<MenuRule />
						<PrintNavItem />
					</>}
				</MenuDropdown>
				<VaultNavItem />
			</MenuSection>

			<MenuSection>
				<MenuItem className='brewTitle'>{brew?.title}<Alerts alerts={alerts} trySave={trySave}/></MenuItem>
			</MenuSection>

			<MenuSection>
				<Account />
			</MenuSection>

		</Menubar>
	</nav>
	);
};

export default MainNavigationBar;