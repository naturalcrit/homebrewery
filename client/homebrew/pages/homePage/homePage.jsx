import './homePage.less';

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

const useLocalStorage     = false;
const sandbox             = true;
const showFloatingButtons = true;
const showEditorButtons   = false;
const pageName            = "homePage";

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

		const saved = res.body;
		window.onbeforeunload = null;
		window.location = `/edit/${saved.editId}`;
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
		userThemes: {}
	});

	return renderPanels();
};

export default HomePage;
