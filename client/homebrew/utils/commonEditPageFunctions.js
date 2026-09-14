import React, { useState, useEffect, useEffectEvent, useRef } from 'react';
import { printCurrentBrew, fetchThemeBundle } from '@shared/helpers.js';
import _                                      from 'lodash';
import Nav                                    from '@navbar/nav.jsx';

const AUTOSAVE_KEY = 'HB_editor_autoSaveOn';

const SAVE_TIMEOUT                  = 10000;  //Autosave 10 seconds after last change
const UNSAVED_WARNING_TIMEOUT       = 900000; //Warn user afer 15 minutes of unsaved changes
const UNSAVED_WARNING_POPUP_TIMEOUT = 4000;   //Show the warning for 4 seconds

export default function useCommonEditPageFunctions(dependencies) {
	const {
		saveGoogle,
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
		sandbox,
		lastSavedBrew,
		editorRef,
		save,
	} = dependencies;

	const [isSaving, setIsSaving] = useState(false);
	const [lastSavedTime, setLastSavedTime] = useState(new Date());
	const [autoSaveEnabled, setAutoSaveEnabled] = useState(!sandbox);
	const [warnUnsavedChanges, setWarnUnsavedChanges] = useState(true);
	const [unsavedChanges, setUnsavedChanges] = useState(false);

	const unsavedChangesRef  = useRef(unsavedChanges); // onBeforeUnload lives outside React and needs ref to unsavedChanges
	const warnUnsavedTimeout = useRef(null);           // timers live outside React and need ref to consistently track time
	const saveTimeout        = useRef(null);

	//==--------- Page setup ----------==//
	useEffect(()=>{
		const autoSavePref = !sandbox && JSON.parse(localStorage.getItem(AUTOSAVE_KEY) ?? true);
		setAutoSaveEnabled(autoSavePref);
		setWarnUnsavedChanges(!autoSavePref);
		setHTMLErrors(hbfm.validate(currentBrew.text));
		fetchThemeBundle(setError, setThemeBundle, currentBrew.renderer, currentBrew.theme);

		const handleControlKeys = (e)=>{
			if(!(e.ctrlKey || e.metaKey)) return;
			if(e.keyCode === 83) trySave(true, true, saveGoogle);
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
		unsavedChangesRef.current = hasChange;

		if(autoSaveEnabled) trySave(false, hasChange, saveGoogle);
	}, [currentBrew]);

	const resetWarnUnsavedTimer = ()=>{
		setTimeout(()=>setWarnUnsavedChanges(false), UNSAVED_WARNING_POPUP_TIMEOUT); // Hide the warning after 4 seconds
		clearTimeout(warnUnsavedTimeout.current);
		warnUnsavedTimeout.current = setTimeout(()=>setWarnUnsavedChanges(true), UNSAVED_WARNING_TIMEOUT); // 15 minutes between unsaved work warnings
	};

	const handleSplitMove = ()=>{
		editorRef.current.update();
	};

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

	const toggleAutoSave = ()=>{
		clearTimeout(warnUnsavedTimeout.current);
		clearTimeout(saveTimeout.current);
		localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(!autoSaveEnabled));
		setAutoSaveEnabled(!autoSaveEnabled);
		setWarnUnsavedChanges(autoSaveEnabled);
	};

	const clearError = ()=>{
		setError(null);
		setIsSaving(false);
	};

	const trySave = useEffectEvent((forceSave = false, hasChanges = true, saveToGoogle = false)=>{
		clearTimeout(saveTimeout.current);
		if(isSaving) return;
		if(!forceSave && !hasChanges) return;
		const newTimeout = forceSave ? 0 : SAVE_TIMEOUT;

		saveTimeout.current = setTimeout(async ()=>{
			setIsSaving(true);
			setError(null);
			await save(currentBrew, saveToGoogle)
			.catch((err)=>{
				setError(err);
			});
			setIsSaving(false);
			setLastSavedTime(new Date());
			if(!autoSaveEnabled) resetWarnUnsavedTimer();
		}, newTimeout);
	});

	const renderSaveButton = ()=>{
		if(isSaving)
			return <Nav.item className='save' icon='fas fa-spinner fa-spin'>saving...</Nav.item>;

		if(unsavedChanges && warnUnsavedChanges) {
			resetWarnUnsavedTimer();
			const elapsedTime = Math.round((new Date() - lastSavedTime) / 1000 / 60);
			const text = elapsedTime === 0
				? `Autosave is OFF${sandbox ? ' for this sandbox page' : ''}.`
				: `Autosave is OFF${sandbox ? ' for this sandbox page' : ''}, and you haven't saved for ${elapsedTime} minutes.`;

			return <Nav.item className='save error' icon='fas fa-exclamation-circle'>
						Reminder...
						<div className='errorContainer'>{text}</div>
			</Nav.item>;
		}

		if(unsavedChanges)
			return <Nav.item className='save' onClick={()=>trySave(true, true, saveGoogle)} color='blue' icon='fas fa-save'>save now</Nav.item>;

		if(autoSaveEnabled)
			return <Nav.item className='save saved'>auto-saved</Nav.item>;

		if(sandbox)
			return <Nav.item className='save neverSaved' disabled={true}>save now</Nav.item>;

		return <Nav.item className='save saved'>saved</Nav.item>;
	};

	return {
		handleSplitMove,
		handleBrewChange,
		toggleAutoSave,
		clearError,
		trySave,
		renderSaveButton,
		autoSaveEnabled,
		unsavedChanges,
	}
}