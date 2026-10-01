import './homePage.less';

// Common imports
import React, { useState, useEffect, useRef, useEffectEvent } from 'react';
import request                                from '../../utils/request-middleware.js';
import _                                      from 'lodash';

import { DEFAULT_BREW }                       from '../../../../server/brewDefaults.js';

import useCommonEditPageFunctions from '../../utils/commonEditPageFunctions.jsx';

// Page specific imports
const useLocalStorage     = false;
const sandbox             = true;
const showFloatingButtons = true;
const showEditorButtons   = false;
const pageName            = 'homePage';

const HomePage =(props)=>{
	props = {
		brew : DEFAULT_BREW,
		...props
	};

	const [currentBrew, setCurrentBrew]                = useState(props.brew);
	const [saveGoogle, setSaveGoogle] = useState(global.account?.googleId ? true : false);
	const [error, setError]                      = useState(undefined);

	const lastSavedBrew      = useRef(_.cloneDeep(props.brew));

	const save = async (brew, saveToGoogle)=>{
		const res = await request
			.post(`/api${saveGoogle ? '?saveToGoogle=true' : ''}`)
			.send(brew)
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
		userThemes : {}
	});

	return renderPanels();
};

export default HomePage;
