require('./sharePage.less');
const React = require('react');
const { useState, useEffect, useCallback } = React;
const { Meta } = require('vitreum/headtags');

// const Nav = require('naturalcrit/nav/nav.jsx');
const { Menubar, MenuItem, MenuSection, MenuDropdown, MenuRule } = require('../../../components/menubar/Menubar.jsx');
const MetadataNav = require('../../navbar/metadata.navitem.jsx');
const NewBrewItem = require('../../navbar/newbrew.navitem.jsx');
const PrintNavItem = require('../../navbar/print.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const VaultNavItem = require('../../navbar/vault.navitem.jsx');
const Account = require('../../navbar/account.navitem.jsx');
const MainMenu = require('../../navbar/mainMenu.navitem.jsx');
import MainNavigationBar from 'client/homebrew/navbar/mainNavigationBar.jsx';

const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const { DEFAULT_BREW_LOAD } = require('../../../../server/brewDefaults.js');
const { printCurrentBrew, fetchThemeBundle } = require('../../../../shared/helpers.js');

const SharePage = (props)=>{
	const { brew = DEFAULT_BREW_LOAD, disableMeta = false } = props;

	const [state, setState] = useState({
		themeBundle                : {},
		currentBrewRendererPageNum : 1,
	});

	const handleBrewRendererPageChange = useCallback((pageNumber)=>{
		setState((prevState)=>({
			currentBrewRendererPageNum : pageNumber,
			...prevState }));
	}, []);

	const handleControlKeys = (e)=>{
		if(!(e.ctrlKey || e.metaKey)) return;
		const P_KEY = 80;
		if(e.keyCode === P_KEY) {
			printCurrentBrew();
			e.stopPropagation();
			e.preventDefault();
		}
	};

	useEffect(()=>{
		document.addEventListener('keydown', handleControlKeys);
		fetchThemeBundle(
			{ setState },
			brew.renderer,
			brew.theme
		);

		return ()=>{
			document.removeEventListener('keydown', handleControlKeys);
		};
	}, []);

	const processShareId = ()=>{
		return brew.googleId && !brew.stubbed ? brew.googleId + brew.shareId : brew.shareId;
	};

	const renderEditLink = ()=>{
		if(!brew.editId) return null;

		const editLink = brew.googleId && ! brew.stubbed ? brew.googleId + brew.editId : brew.editId;

		return (
			<Nav.item color='orange' icon='fas fa-pencil-alt' href={`/edit/${editLink}`}>
				edit
			</Nav.item>
		);
	};


	const renderNavbar = ()=>{
		 // todo: bring back in the metadata viewer (MetadataNav.jsx)
		return (
			<MainNavigationBar>
				<Menubar>
					<MenuSection>
						<MainMenu />
						<MenuDropdown id='brewMenu' className='brew-menu' groupName='Brew' icon='fas fa-pen-fancy' dir='down'>
							<NewBrewItem />
							<MenuItem color='blue' href={`/new/${processShareId()}`}>
								clone to new
							</MenuItem>
							<MenuRule />
							{global.account && <MenuItem href={`/user/${encodeURI(global.account.username)}`} color='purple' icon='fas fa-beer'>
								brews
							</MenuItem> }
							<RecentNavItem brew={brew} storageKey='view' />
							<MenuRule />
							<MenuItem color='blue' icon='fas fa-eye' href={`/source/${processShareId()}`}>
								source
							</MenuItem>
							<MenuItem color='blue' href={`/download/${processShareId()}`}>
								download .txt
							</MenuItem>
							<MenuRule />
							<PrintNavItem />
						</MenuDropdown>
						<VaultNavItem />
					</MenuSection>

					<MenuSection>
						<MenuItem className='brewTitle'>{brew.title}</MenuItem>
					</MenuSection>

					<MenuSection>
						<Account />
					</MenuSection>

				</Menubar>
			</MainNavigationBar>
		);
	};

	return (
		<div className='sharePage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
			<nav>{renderNavbar()}</nav>

			<div className='content'>
				<BrewRenderer
					text={brew.text}
					style={brew.style}
					lang={brew.lang}
					renderer={brew.renderer}
					theme={brew.theme}
					themeBundle={state.themeBundle}
					onPageChange={handleBrewRendererPageChange}
					currentBrewRendererPageNum={state.currentBrewRendererPageNum}
					allowPrint={true}
				/>
			</div>
		</div>
	);
};

module.exports = SharePage;
