import './editPage.less';

// Common imports
import React, { useState, useEffect, useRef, useEffectEvent } from 'react';
import request                                from '../../utils/request-middleware.js';

import _                                      from 'lodash';

import { DEFAULT_BREW_LOAD }                  from '../../../../server/brewDefaults.js';

import useCommonEditPageFunctions from '../../utils/commonEditPageFunctions.jsx';

import Nav            from '@navbar/nav.jsx';

// Page specific imports
import { md5 }                           from 'hash-wasm';
import { gzipSync, strToU8 }             from 'fflate';
import { makePatches, stringifyPatches } from '@sanity/diff-match-patch';

import { updateHistory, versionHistoryGarbageCollection } from '../../utils/versionHistory.js';
import googleDriveIcon from '../../googleDrive.svg';

const useLocalStorage     = false;
const sandbox             = false;
const showFloatingButtons = false;
const showEditorButtons   = true;
const pageName            = 'editPage';

const EditPage = (props)=>{
	props = {
		brew : DEFAULT_BREW_LOAD,
		...props
	};

	const [currentBrew, setCurrentBrew] = useState(props.brew);
	const [saveGoogle, setSaveGoogle] = useState(!!props.brew.googleId);
	const [error, setError] = useState(null);
	const [alertTrashedGoogleBrew, setAlertTrashedGoogleBrew] = useState(props.brew.trashed);
	const [alertNoGoogleToTransfer, setAlertNoGoogleToTransfer] = useState(false);
	const [alertOwnershipToTransfer, setAlertOwnershipToTransfer] = useState(false);
	const [confirmGoogleTransfer, setConfirmGoogleTransfer] = useState(false);

	const lastSavedBrew = useRef(_.cloneDeep(props.brew));

	const handleGoogleClick = ()=>{
		if(currentBrew.authors.length > 0 && global.account?.username !== currentBrew.authors[0]) {
			setAlertOwnershipToTransfer(true);
			return;
		}
		if(!global.account?.googleId) {
			setAlertNoGoogleToTransfer(true);
			return;
		}

		setConfirmGoogleTransfer((prev)=>!prev);
		setError(null);
	};

	const closeAlerts = (e)=>{
		e.stopPropagation(); //Only handle click once so alert doesn't reopen
		setAlertTrashedGoogleBrew(false);
		setAlertNoGoogleToTransfer(false);
		setConfirmGoogleTransfer(false);
		setAlertOwnershipToTransfer(false);
	};

	const toggleGoogleStorage = (e)=>{
		closeAlerts(e);
		const newSaveGoogle = !saveGoogle;
		setSaveGoogle((prev)=>!prev);
		setError(null);
		trySave(true, true, newSaveGoogle);
	};

	const save = async (brew, saveToGoogle)=>{
		await updateHistory(brew).catch(console.error);
		await versionHistoryGarbageCollection().catch(console.error);

		//Prepare content to send to server
		const brewToSave = {
			...brew,
			text      : brew.text.normalize('NFC'),
			pageCount : ((brew.renderer === 'legacy' ? brew.text.match(/\\page/g) : brew.text.match(/^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/gm)) || []).length + 1,
			patches   : stringifyPatches(makePatches(encodeURI(lastSavedBrew.current.text.normalize('NFC')), encodeURI(brew.text.normalize('NFC')))),
			hash      : await md5(lastSavedBrew.current.text.normalize('NFC')),
			textBin   : undefined,
			version   : lastSavedBrew.current.version
		};

		const compressedBrew = gzipSync(strToU8(JSON.stringify(brewToSave)));
		const transfer = saveToGoogle === _.isNil(brew.googleId);
		const params = transfer ? `?${saveToGoogle ? 'saveToGoogle' : 'removeFromGoogle'}=true` : '';

		const res = await request
			.put(`/api/update/${brewToSave.editId}${params}`)
			.set('Content-Encoding', 'gzip')
			.set('Content-Type', 'application/json')
			.send(compressedBrew)
			.catch((err)=>{
				console.error('Error Updating Local Brew');
				setError(err);
			});
		if(!res) return;

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

	const renderGoogleDriveIcon = ()=>(
		<Nav.item className='googleDriveStorage' onClick={handleGoogleClick}>
			<img src={googleDriveIcon} className={saveGoogle ? '' : 'inactive'} alt='Google Drive icon' />

			{alertOwnershipToTransfer && (
				<div className='errorContainer'>
					You must be the Owner to transfer between the Homebrewery and Google Drive!
					The owner of this file is {currentBrew.authors[0]}.
					<br></br>
					<div className='confirm' onClick={closeAlerts}> Okay </div>
				</div>
			)}

			{alertNoGoogleToTransfer && (
				<div className='errorContainer'>
					You must be signed in to a Google account to transfer between the Homebrewery and Google Drive!
					<a target='_blank' rel='noopener noreferrer' href={`https://www.naturalcrit.com/login?redirect=${window.location.href}`}>
						<div className='confirm' onClick={closeAlerts}> Sign In </div>
					</a>
					<div className='deny'  onClick={closeAlerts}>      Not Now </div>
				</div>
			)}

			{alertTrashedGoogleBrew && (
				<div className='errorContainer'>
					This brew is currently in your Trash folder on Google Drive!<br />
					If you want to keep it, make sure to move it before it is deleted permanently!<br />
					<div className='confirm' onClick={toggleGoogleStorage}> Save my brew </div>
				</div>
			)}

			{confirmGoogleTransfer && (
				<div className='errorContainer'>
					{saveGoogle
						? 'Would you like to transfer this brew from your Google Drive storage back to the Homebrewery?'
						: 'Would you like to transfer this brew from the Homebrewery to your personal Google Drive storage?'}
					<br />
					<div className='confirm' onClick={toggleGoogleStorage}> Yes </div>
					<div className='deny' onClick={closeAlerts}>                                  No  </div>
				</div>
			)}
		</Nav.item>
	);

	const {
		renderPanels,
		trySave,
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
		renderGoogleDriveIcon,
		userThemes : props.userThemes
	});

	return renderPanels();
};

export default EditPage;
