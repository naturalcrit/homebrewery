import React            from 'react';
import request          from '../../utils/request-middleware.js';
import _                from 'lodash';
import EditorPage       from '../basePages/editPage/editorPage.jsx';
import { DEFAULT_BREW } from '../../../../server/brewDefaults.js';

const NewPage = (props)=>{
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
			useLocalStorage     = {true}
			sandbox             = {true}
			showFloatingButtons = {false}
			showEditorButtons   = {true}
			pageName            = {'newPage'}
			brew                = {props.brew}
			userThemes          = {props.userThemes}
			save                = {save}
			onSaveSuccess       = {onSaveSuccess}
		></EditorPage>);
};

export default NewPage;
