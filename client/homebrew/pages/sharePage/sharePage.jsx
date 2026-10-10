import './sharePage.less';
import React, { useState, useEffect, useCallback } from 'react';
import Headtags   from '../../../../vitreum/headtags.js';
const Meta = Headtags.Meta;

import BrewRenderer from '../../brewRenderer/brewRenderer.jsx';
import Navbar from '../../navbar/navbar.jsx';
import request from '../../utils/request-middleware.js';

import { DEFAULT_BREW_LOAD } from '../../../../server/brewDefaults.js';
import { printCurrentBrew, fetchThemeBundle } from '@shared/helpers.js';

const SharePage = (props)=>{
	const { disableMeta = false } = props;

	const [currentBrew, setCurrentBrew] = useState(props.brew || DEFAULT_BREW_LOAD);
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

	const fetchUpdatedBrew = async ()=>{
		const response = await request
			.get(`/api/fetch/${currentBrew.shareId}`)
			.catch((error)=>{
				console.log('error at fetching updated brew: ', error);
			});
		if(response.ok && !!response.body.brew) {
			setCurrentBrew(response.body.brew);
		}
	};

	useEffect(()=>{
		document.addEventListener('keydown', handleControlKeys);
		fetchThemeBundle(undefined, setThemeBundle, currentBrew.renderer, currentBrew.theme);

		// listen for changes in the brew version
		const eventSource = new EventSource('/stream');
		eventSource.addEventListener('message', (evt)=>{
			const messageData = JSON.parse(evt.data);

			if(messageData.eventType == 'brewUpdated'){
				if(messageData.shareId == currentBrew.shareId && messageData.version != currentBrew.version) {
					console.log('should fetch brew');
					fetchUpdatedBrew();
				}
			}
		});

		return ()=>{
			document.removeEventListener('keydown', handleControlKeys);
		};
	}, []);
	console.log('brew: ', currentBrew);
	return (
		<div className='sharePage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
			<Navbar brew={currentBrew} pageName={props.pageName || 'sharePage'} title={props.title || 'sharePage'} />
			<div className='content'>
				<BrewRenderer
					text={currentBrew.text}
					style={currentBrew.style}
					lang={currentBrew.lang}
					renderer={currentBrew.renderer}
					theme={currentBrew.theme}
					themeBundle={themeBundle}
					onPageChange={handleBrewRendererPageChange}
					allowPrint={true}
				/>
			</div>
		</div>
	);
};

export default SharePage;
