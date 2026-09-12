import React, { useState, useEffect, useRef } from 'react';
import { printCurrentBrew, fetchThemeBundle } from '@shared/helpers.js';
import _                                      from 'lodash';

const AUTOSAVE_KEY = 'HB_editor_autoSaveOn';

export default function useCommonEditPageFunctions(dependencies) {
	const {
		setError,
		setThemeBundle,
		HTMLErrors,
		setHTMLErrors,
		currentBrew,
		setCurrentBrew,
		useLocalStorage,
		BREWKEY,
		STYLEKEY,
		SNIPKEY,
		METAKEY,
		hbfm,
		autoSaveEnabled,
		setAutoSaveEnabled,
		setWarnUnsavedChanges,
		trySaveRef,
		sandbox,
		saveGoogle = false,
		unsavedChangesRef,
		setUnsavedChanges,
		lastSavedBrew
	} = dependencies;

	//==--------- Page setup ----------==//
	useEffect(()=>{
		const autoSavePref = !sandbox && JSON.parse(localStorage.getItem(AUTOSAVE_KEY) ?? true);
		setAutoSaveEnabled(autoSavePref);
		console.log(autoSavePref)
		setWarnUnsavedChanges(!autoSavePref);
		setHTMLErrors(hbfm.validate(currentBrew.text));
		fetchThemeBundle(setError, setThemeBundle, currentBrew.renderer, currentBrew.theme);

		const handleControlKeys = (e)=>{
			if(!(e.ctrlKey || e.metaKey)) return;
			if(e.keyCode === 83) trySaveRef.current(true, true, saveGoogle);
			if(e.keyCode === 80) printCurrentBrew();
			if([83, 80].includes(e.keyCode)) {
				e.stopPropagation();
				e.preventDefault();
			}
		};

		document.addEventListener('keydown', handleControlKeys);
		window.onbeforeunload = ()=>{
			if(unsavedChangesRef.current)
				return 'You have unsaved changes!';
		};
		return ()=>{
			document.removeEventListener('keydown', handleControlKeys);
			window.onBeforeUnload = null;
		};
	}, []);

	//======----- Check for unsaved changes and autosave if enabled -----======
	useEffect(()=>{
		const hasChange = !_.isEqual(currentBrew, lastSavedBrew.current);
		setUnsavedChanges(hasChange);

		if(autoSaveEnabled) trySaveRef.current(false, hasChange, saveGoogle);
	}, [currentBrew]);


	const handleBrewChange = (field)=>(value, subfield)=>{	//'text', 'style', 'snippets', 'metadata'
		if(subfield == 'renderer' || subfield == 'theme')
			fetchThemeBundle(setError, setThemeBundle, value.renderer, value.theme);

		//If there are HTML errors, run the validator on every change to give quick feedback
		if(HTMLErrors.length && (field == 'text' || field == 'snippets'))
			setHTMLErrors(hbfm.validate(value));

		if(field == 'metadata') setCurrentBrew((prev)=>({ ...prev, ...value }));
		else                    setCurrentBrew((prev)=>({ ...prev, [field]: value }));

		if(useLocalStorage) {
			if(field == 'text')	    localStorage.setItem(BREWKEY, value);
			if(field == 'style')	  localStorage.setItem(STYLEKEY, value);
			if(field == 'snippets') localStorage.setItem(SNIPKEY, value);
			if(field == 'metadata') localStorage.setItem(METAKEY, JSON.stringify({
				renderer : value.renderer,
				theme	   : value.theme,
				lang	   : value.lang
			}));
		}
	};

	return {
		handleBrewChange
	}
}