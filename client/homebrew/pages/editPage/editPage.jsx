import React                 from 'react';
import request               from '../../utils/request-middleware.js';
import _                     from 'lodash';
import EditorPage            from '../basePages/editPage/editorPage.jsx';
import { DEFAULT_BREW_LOAD } from '../../../../server/brewDefaults.js';

// Page specific imports
import { gzipSync, strToU8 }             from 'fflate';
import { updateHistory, versionHistoryGarbageCollection } from '../../utils/versionHistory.js';

const EditPage = (props)=>{
	props = {
		brew : DEFAULT_BREW_LOAD,
		...props
	};

	const save = async (brew, saveToGoogle)=>{
		await updateHistory(brew).catch(console.error);
		await versionHistoryGarbageCollection().catch(console.error);

		const compressedBrew = gzipSync(strToU8(JSON.stringify(brew)));
		const transfer = saveToGoogle === _.isNil(brew.googleId);
		const params = transfer ? `?${saveToGoogle ? 'saveToGoogle' : 'removeFromGoogle'}=true` : '';

		const res = await request
			.put(`/api/update/${brew.editId}${params}`)
			.set('Content-Encoding', 'gzip')
			.set('Content-Type', 'application/json')
			.send(compressedBrew);

		const updatedFields = {
			googleId : res.body.googleId ?? null, //TODO: investigate if we can set googleId:null in server/update instead of undefined
			editId   : res.body.editId,           //then, editPage can just apply res.body instead of breaking out these fields.
			shareId  : res.body.shareId,
			version  : res.body.version
		};

		return updatedFields;
	};

	const onSaveSuccess = (savedBrew)=>{
		history.replaceState(null, null, `/edit/${savedBrew.editId}`);;
	};

	return (
		<EditorPage
			useLocalStorage     = {false}
			sandbox             = {false}
			showFloatingButtons = {false}
			showEditorButtons   = {true}
			pageName            = {'editPage'}
			brew                = {props.brew}
			userThemes          = {props.userThemes}
			save                = {save}
			onSaveSuccess       = {onSaveSuccess}
		></EditorPage>);
};

export default EditPage;
