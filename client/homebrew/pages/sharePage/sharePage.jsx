require('./sharePage.less');
const React = require('react');
const { useState, useEffect, useCallback } = React;
const { Meta } = require('vitreum/headtags');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const MetadataNav = require('../../navbar/metadata.navitem.jsx');
const PrintNavItem = require('../../navbar/print.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
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
		updateState({ currentBrewRendererPageNum: pageNumber });
	}, []);

	const handleControlKeys = useCallback((e)=>{
		if(!(e.ctrlKey || e.metaKey)) return;
		const P_KEY = 80;
		if(e.keyCode === P_KEY) {
			printCurrentBrew();
			e.stopPropagation();
			e.preventDefault();
		}
	}, []);

	useEffect(()=>{
		document.addEventListener('keydown', handleControlKeys);
		fetchThemeBundle(
			{
				setState,
			},
			brew.renderer,
			brew.theme
		);

		return ()=>{
			document.removeEventListener('keydown', handleControlKeys);
		};
	}, [brew.renderer, brew.theme, handleControlKeys]);

	const processShareId = useCallback(()=>{
		return brew.googleId && !brew.stubbed ? brew.googleId + brew.shareId : brew.shareId;
	}, [brew]);

	const renderEditLink = ()=>{
		if(!brew.editId) return null;

		let editLink = brew.editId;
		if(brew.googleId && !brew.stubbed) {
			editLink = brew.googleId + editLink;
		}

		return (
			<Nav.item color='orange' icon='fas fa-pencil-alt' href={`/edit/${editLink}`}>
				edit
			</Nav.item>
		);
	};

	const titleStyle = disableMeta ? { cursor: 'default' } : {};
	const titleEl = (
		<Nav.item className='brewTitle' style={titleStyle}>
			{brew.title}
		</Nav.item>
	);

	return (
		<div className='sharePage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
			<Navbar>
				<Nav.section className='titleSection'>
					{disableMeta ? titleEl : <MetadataNav brew={brew}>{titleEl}</MetadataNav>}
				</Nav.section>

				<Nav.section>
					{brew.shareId && (
						<>
							<PrintNavItem />
							<Nav.dropdown>
								<Nav.item color='red' icon='fas fa-code'>
									source
								</Nav.item>
								<Nav.item color='blue' icon='fas fa-eye' href={`/source/${processShareId()}`}>
									view
								</Nav.item>
								{renderEditLink()}
								<Nav.item color='blue' icon='fas fa-download' href={`/download/${processShareId()}`}>
									download
								</Nav.item>
								<Nav.item color='blue' icon='fas fa-clone' href={`/new/${processShareId()}`}>
									clone to new
								</Nav.item>
							</Nav.dropdown>
						</>
					)}
					<RecentNavItem brew={brew} storageKey='view' />
					<Account />
				</Nav.section>
			</Navbar>

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
