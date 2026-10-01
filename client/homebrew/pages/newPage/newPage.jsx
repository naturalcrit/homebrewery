import './newPage.less';

// Common imports
import React, { useState, useEffect, useRef, useEffectEvent } from 'react';
import request                                from '../../utils/request-middleware.js';
import _                                      from 'lodash';

import { DEFAULT_BREW }                       from '../../../../server/brewDefaults.js';

import useCommonEditPageFunctions from '../../utils/commonEditPageFunctions.jsx';

// Page specific imports
const useLocalStorage     = true;
const sandbox             = true;
const showFloatingButtons = false;
const showEditorButtons   = true;
const pageName            = 'newPage';

const NewPage = (props)=>{
	props = {
		brew : DEFAULT_BREW,
		...props
	};

	const [currentBrew, setCurrentBrew] = useState(props.brew);
	const [saveGoogle, setSaveGoogle] = useState(global.account?.googleId ? true : false);
	const [error, setError] = useState(null);

	const lastSavedBrew      = useRef(_.cloneDeep(props.brew));

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

		setCurrentBrew((prevBrew)=>({
			...prevBrew,
			...res.body
		}));

		return res.body;
	};

	const onSaveSuccess = (savedBrew)=>{
		window.onbeforeunload = null;
		window.location = `/edit/${savedBrew.editId}`;
	};

	const {
		renderPanels
	} = useCommonEditPageFunctions({
		saveGoogle,
		setSaveGoogle,
		error,
		setError,
		currentBrew,
		setCurrentBrew,
		useLocalStorage,
		sandbox,
		showFloatingButtons,
		lastSavedBrew,
		save,
		onSaveSuccess,
		pageName,
		showEditorButtons,
		userThemes : props.userThemes
	});

	return renderPanels();
};

export default NewPage;
