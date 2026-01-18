require('./sharePage.less');
const  React = require('react');
const { useState, useEffect, useCallback } = React;
const { Meta } = require('vitreum/headtags');

const Nav = require('client/homebrew/navbar/nav.jsx');
const Navbar = require('client/homebrew/navbar/navbar.jsx');
const MetadataNav = require('client/homebrew/navbar/metadata.navitem.jsx');
const PrintNavItem = require('client/homebrew/navbar/print.navitem.jsx');
const RecentNavItem = require('client/homebrew/navbar/recent.navitem.jsx').both;
const Account = require('client/homebrew/navbar/account.navitem.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const ErrorPage = require('../errorPage/errorPage.jsx');

const { DEFAULT_BREW, DEFAULT_BREW_LOAD } = require('../../../../server/brewDefaults.js');
const { printCurrentBrew, fetchThemeBundle, splitTextStyleAndMetadata } = require('../../../../shared/helpers.js');

import request from '../../utils/request-middleware.js';

const SharePage = (props)=>{
	const { disableMeta = false, id, fixedText, fixedTitle = '' } = props;

	const [brew, setBrew] = useState(DEFAULT_BREW_LOAD);
	const [error, setError] = useState();

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
		const fetchData = async ()=>{

			let brewData;

			if(fixedText){
				const data = await request
					.get(`/api/text/${fixedText}`)
					.catch((err)=>{
						return err.response;
					});

				brewData = Object.assign(DEFAULT_BREW, { text: data.text, title: fixedTitle });

				if(!data.ok) {
					setError(brewData);
					return;
				}
			}

			if(id){
				const data = await request
					.get(`/api/share/${id}`)
					.catch((err)=>{
						return err.response;
					});
				brewData = data.body;
				if(!data.ok) {
					setError(brewData);
					return;
				}
			}

			splitTextStyleAndMetadata(brewData);

			await fetchThemeBundle(
				setError,
				setThemeBundle,
				brewData.renderer,
				brewData.theme
			);

			setBrew(brewData);
		};
		fetchData();

		document.addEventListener('keydown', handleControlKeys);
		fetchThemeBundle(setError, setThemeBundle, brew.renderer, brew.theme);

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

	if(error) return <ErrorPage brew={error} />;

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

module.exports = SharePage;
