import './homePage.less';

import React            from 'react';
import request          from '../../utils/request-middleware.js';
import _                from 'lodash';
import EditorPage       from '../basePages/editorPage/editorPage.jsx';
import { DEFAULT_BREW } from '../../../../server/brewDefaults.js';

const HomePage =(props)=>{
	props = {
		brew : DEFAULT_BREW,
		...props
	};

	const save = async (brew, saveToGoogle)=>{
		const res = await request
			.post(`/api${saveToGoogle ? '?saveToGoogle=true' : ''}`)
			.send(brew);

		return res.body;
	};

	const onSaveSuccess = (savedBrew)=>{
		window.onbeforeunload = null;
		window.location = `/edit/${savedBrew.editId}`;
	};

	return (
		<EditorPage
			useLocalStorage     = {false}
			sandbox             = {true}
			showFloatingButtons = {true}
			showEditorButtons   = {false}
			pageName            = {'homePage'}
			pageTitle           = {'The Homebrewery'}
			brew                = {props.brew}
			userThemes          = {{}}
			save                = {save}
			onSaveSuccess       = {onSaveSuccess}
		></EditorPage>);
};

export default HomePage;
