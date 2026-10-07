import './newPage.less';

// Common imports
import React, { useState } from 'react';
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
	const [error, setError]             = useState(null);

	const save = async (brew, saveToGoogle)=>{
		const res = await request
			.post(`/api${saveToGoogle ? '?saveToGoogle=true' : ''}`)
			.send(brew)
			.catch((err)=>{
				console.error('Error Updating Local Brew');
				setError(err);
			});
		if(!res) return;

		return res.body;
	};

	const onSaveSuccess = (savedBrew)=>{
		window.onbeforeunload = null;
		window.location = `/edit/${savedBrew.editId}`;
	};

	const {
		renderPanels
	} = useCommonEditPageFunctions({
		error,
		setError,
		currentBrew,
		setCurrentBrew,
		useLocalStorage,
		sandbox,
		showFloatingButtons,
		save,
		onSaveSuccess,
		pageName,
		showEditorButtons,
		userThemes : props.userThemes
	});

	return renderPanels();
};

export default NewPage;
