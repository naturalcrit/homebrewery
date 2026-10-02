import './newPage.less';

// Common imports
import React, { useState, useEffect, useRef, useEffectEvent } from 'react';
import request                                from '../../utils/request-middleware.js';
import { hbfm } from 'marked-hbfm';
import _                                      from 'lodash';

import { DEFAULT_BREW }                       from '../../../../server/brewDefaults.js';

import useCommonEditPageFunctions from '../../utils/commonEditPageFunctions.jsx';

// Page specific imports
const BREWKEY  = 'HB_newPage_content';
const STYLEKEY = 'HB_newPage_style';
const SNIPKEY  = 'HB_newPage_snippets';
const METAKEY  = 'HB_newPage_meta';

const SAVEKEYPREFIX  = 'HB_editor_defaultSave_';

const useLocalStorage     = true;
const sandbox             = true;
const showFloatingButtons = false;
const showEditorButtons   = true;
const pageName            = "newPage";

const NewPage = (props)=>{
	props = {
		brew : DEFAULT_BREW,
		...props
	};

	const [currentBrew, setCurrentBrew] = useState(props.brew);
	const [saveGoogle, setSaveGoogle] = useState(global.account?.googleId ? true : false);
	const [error, setError] = useState(null);

	const lastSavedBrew      = useRef(_.cloneDeep(props.brew));

	useEffect(()=>{
		loadBrew();
	}, []);

	const loadBrew = ()=>{
		const brew = { ...currentBrew };
		if(!brew.shareId && typeof window !== 'undefined') { //Load from localStorage if in client browser
			const brewStorage  = localStorage.getItem(BREWKEY);
			const styleStorage = localStorage.getItem(STYLEKEY);
			const metaStorage  = JSON.parse(localStorage.getItem(METAKEY));

			brew.text     = brewStorage           ?? brew.text;
			brew.style    = styleStorage          ?? brew.style;
			brew.renderer = metaStorage?.renderer ?? brew.renderer;
			brew.theme    = metaStorage?.theme    ?? brew.theme;
			brew.lang     = metaStorage?.lang     ?? brew.lang;
		}

		const SAVEKEY = `${SAVEKEYPREFIX}${global.account?.username}`;
		const saveStorage = localStorage.getItem(SAVEKEY) || 'HOMEBREWERY';

		setCurrentBrew(brew);
		lastSavedBrew.current = brew;
		setSaveGoogle(saveStorage == 'GOOGLE-DRIVE' && saveGoogle);

		localStorage.setItem(BREWKEY, brew.text);
		if(brew.style)
			localStorage.setItem(STYLEKEY, brew.style);
		localStorage.setItem(METAKEY, JSON.stringify({ renderer: brew.renderer, theme: brew.theme, lang: brew.lang }));
		if(window.location.pathname !== '/new')
			window.history.replaceState({}, window.location.title, '/new/');
	};

	const save = async (brew, saveToGoogle)=>{
		//Prepare content to send to server
		const brewToSave = {
			...brew,
			text      : brew.text.normalize('NFC'),
			pageCount : ((brew.renderer === 'legacy' ? brew.text.match(/\\page/g) : brew.text.match(/^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/gm)) || []).length + 1,
			textBin   : undefined
		};

		const res = await request
			.post(`/api${saveGoogle ? '?saveToGoogle=true' : ''}`)
			.send(brewToSave)
			.catch((err)=>{
				console.error('Error Updating Local Brew');
				setError(err);
			});
		if(!res) return;

		const savedBrew = res.body;

		localStorage.removeItem(BREWKEY);
		localStorage.removeItem(STYLEKEY);
		localStorage.removeItem(METAKEY);
		window.onbeforeunload = null;
		window.location = `/edit/${savedBrew.editId}`;
	};

	const {
		renderPanels
	} = useCommonEditPageFunctions({
		saveGoogle,
		error,
		setError,
		currentBrew,
		setCurrentBrew,
		useLocalStorage,
		BREWKEY,
		STYLEKEY,
		SNIPKEY,
		METAKEY,
		hbfm,
		sandbox,
		showFloatingButtons,
		lastSavedBrew,
		save,
		pageName,
		showEditorButtons,
		userThemes: props.userThemes
	});

	return renderPanels();
};

export default NewPage;
