import './sharePage.less';
import React, { useState, useEffect, useCallback } from 'react';
import { Meta }                          from 'vitreum/headtags';

import Nav from '../../navbar/nav.jsx';
import Navbar from '../../navbar/navbar.jsx';
import MetadataNav from '../../navbar/metadata.navitem.jsx';
import PrintNavItem from '../../navbar/print.navitem.jsx';
import RecentNavItems from '../../navbar/recent.navitem.jsx';
const { both: RecentNavItem } = RecentNavItems;
import Account from '../../navbar/account.navitem.jsx';
import BrewRenderer from '../../brewRenderer/brewRenderer.jsx';

import { DEFAULT_BREW_LOAD } from '../../../../server/brewDefaults.js';
import { printCurrentBrew, fetchThemeBundle } from '../../../../shared/helpers.js';

const SharePage = (props)=>{
	const { brew = DEFAULT_BREW_LOAD, disableMeta = false } = props;

	const [themeBundle,                setThemeBundle]                = useState({});
	const [currentBrewRendererPageNum, setCurrentBrewRendererPageNum] = useState(1);

	const handleBrewRendererPageChange = useCallback((pageNumber)=>{
		setCurrentBrewRendererPageNum(pageNumber);
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
		fetchThemeBundle(undefined, setThemeBundle, brew.renderer, brew.theme);

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

	const titleEl = (
		<Nav.item className='brewTitle' style={disableMeta ? { cursor: 'default' } : {}}>
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
					themeBundle={themeBundle}
					onPageChange={handleBrewRendererPageChange}
					currentBrewRendererPageNum={currentBrewRendererPageNum}
					allowPrint={true}
				/>
			</div>
		</div>
	);
};

export default SharePage;
