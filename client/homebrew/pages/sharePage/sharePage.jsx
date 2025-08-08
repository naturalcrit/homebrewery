require('./sharePage.less');
const React = require('react');
const { useState, useEffect, useCallback } = React;
const { Meta } = require('vitreum/headtags');

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

	return (
		<div className='sharePage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
			<MainNavigationBar alerts={null} brew={brew} />

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
