import React, { useState, useEffect, useEffectEvent, useRef } from 'react';
import { printCurrentBrew, fetchThemeBundle } from '@shared/helpers.js';
import _                                      from 'lodash';
import { hbfm }                               from 'marked-hbfm';
import { md5 }                                from 'hash-wasm';
import { makePatches, stringifyPatches }      from '@sanity/diff-match-patch';

import Headtags         from '@vitreum/headtags.js';
import SplitPane        from '@components/splitPane/splitPane.jsx';
import Editor           from '../editor/editor.jsx';
import BrewRenderer     from '../brewRenderer/brewRenderer.jsx';
import LockNotification from '../pages/editPage/lockNotification/lockNotification.jsx';
const Meta = Headtags.Meta;

//===---- Navbar
import Nav            from '@navbar/nav.jsx';
import Navbar         from '@navbar/navbar.jsx';
import NewBrewItem    from '@navbar/newbrew.navitem.jsx';
import AccountNavItem from '@navbar/account.navitem.jsx';
import ErrorNavItem   from '@navbar/error-navitem.jsx';
import HelpNavItem    from '@navbar/help.navitem.jsx';
import VaultNavItem   from '@navbar/vault.navitem.jsx';
import PrintNavItem   from '@navbar/print.navitem.jsx';
import ShareNavItem   from '@navbar/share.navitem.jsx';
import RecentNavItems from '@navbar/recent.navitem.jsx';
const { both: RecentNavItem } = RecentNavItems;
import googleDriveIcon from '../googleDrive.svg';

const AUTOSAVE_KEY   = 'HB_editor_autoSaveOn';
const BREWKEY        = 'HB_newPage_content';
const STYLEKEY       = 'HB_newPage_style';
const SNIPKEY        = 'HB_newPage_snippets';
const METAKEY        = 'HB_newPage_meta';
const SAVEKEY_PREFIX = 'HB_editor_defaultSave_';

const SAVE_TIMEOUT                  = 10000;  //Autosave 10 seconds after last change
const UNSAVED_WARNING_TIMEOUT       = 900000; //Warn user afer 15 minutes of unsaved changes
const UNSAVED_WARNING_POPUP_TIMEOUT = 4000;   //Show the warning for 4 seconds

export default function useCommonEditPageFunctions(dependencies) {
	const {
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
		userThemes = {}
	} = dependencies;

	const [isSaving, setIsSaving]                     = useState(false);
	const [lastSavedTime, setLastSavedTime]           = useState(new Date());
	const [autoSaveEnabled, setAutoSaveEnabled]       = useState(!sandbox);
	const [warnUnsavedChanges, setWarnUnsavedChanges] = useState(true);
	const [unsavedChanges, setUnsavedChanges]         = useState(false);
	const [themeBundle, setThemeBundle]               = useState({});
	const [HTMLErrors, setHTMLErrors]                 = useState(hbfm.validate(currentBrew.text));
	const [saveGoogle, setSaveGoogle]                 = useState(currentBrew.googleId);

	const [alertTrashedGoogleBrew, setAlertTrashedGoogleBrew]     = useState(currentBrew.trashed);
	const [alertNoGoogleToTransfer, setAlertNoGoogleToTransfer]   = useState(false);
	const [alertOwnershipToTransfer, setAlertOwnershipToTransfer] = useState(false);
	const [confirmGoogleTransfer, setConfirmGoogleTransfer]       = useState(false);

	const [currentEditorViewPageNum, setCurrentEditorViewPageNum] = useState(1);
	const [currentEditorCursorPageNum, setCurrentEditorCursorPageNum] = useState(1);
	const [currentBrewRendererPageNum, setCurrentBrewRendererPageNum] = useState(1);

	const unsavedChangesRef  = useRef(unsavedChanges); // onBeforeUnload lives outside React and needs ref to unsavedChanges
	const warnUnsavedTimeout = useRef(null);           // timers live outside React and need ref to consistently track time
	const lastSavedBrew      = useRef(_.cloneDeep(currentBrew));
	const saveTimeout        = useRef(null);
	const editorRef          = useRef(null);

	//==--------- Page setup ----------==//
	useEffect(()=>{
		if(useLocalStorage) loadBrewFromLocalStorage();
		const autoSavePref = !sandbox && JSON.parse(localStorage.getItem(AUTOSAVE_KEY) ?? true);
		setAutoSaveEnabled(autoSavePref);
		setWarnUnsavedChanges(!autoSavePref);
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
			window.onbeforeunload = null;
		};
	}, []);

	const loadBrewFromLocalStorage = ()=>{
		const brew = { ...currentBrew };
		if(!brew.shareId && typeof window !== 'undefined') { //Load from localStorage if in client browser
			const brewStorage  = localStorage.getItem(BREWKEY);
			const styleStorage = localStorage.getItem(STYLEKEY);
			const snipStorage  = localStorage.getItem(SNIPKEY);
			const metaStorage  = JSON.parse(localStorage.getItem(METAKEY));

			brew.text     = brewStorage           ?? brew.text;
			brew.style    = styleStorage          ?? brew.style;
			brew.snippets = snipStorage           ?? brew.snippets;
			brew.renderer = metaStorage?.renderer ?? brew.renderer;
			brew.theme    = metaStorage?.theme    ?? brew.theme;
			brew.lang     = metaStorage?.lang     ?? brew.lang;
		}

		const SAVEKEY = `${SAVEKEY_PREFIX}${global.account?.username}`;
		const saveStorage = localStorage.getItem(SAVEKEY) || 'HOMEBREWERY';

		setCurrentBrew(brew);
		lastSavedBrew.current = brew;
		setSaveGoogle(saveStorage == 'GOOGLE-DRIVE' && saveGoogle);

		                  localStorage.setItem(BREWKEY,  brew.text);
		if(brew.style)    localStorage.setItem(STYLEKEY, brew.style);
		if(brew.snippets) localStorage.setItem(SNIPKEY,  brew.snippets);
		localStorage.setItem(METAKEY, JSON.stringify({ renderer: brew.renderer, theme: brew.theme, lang: brew.lang }));
		if(window.location.pathname !== '/new')
			window.history.replaceState({}, window.location.title, '/new/');
	};

	const clearLocalStorage = ()=>{
		localStorage.removeItem(BREWKEY);
		localStorage.removeItem(STYLEKEY);
		localStorage.removeItem(SNIPKEY);
		localStorage.removeItem(METAKEY);
	};

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
			if(field == 'style')    localStorage.setItem(STYLEKEY, value);
			if(field == 'snippets') localStorage.setItem(SNIPKEY, value);
			if(field == 'metadata') localStorage.setItem(METAKEY, JSON.stringify({
				renderer : value.renderer,
				theme    : value.theme,
				lang     : value.lang
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
			setHTMLErrors(hbfm.validate(currentBrew.text));

			//Prepare content to send to server
			const snapshotBrewBeforeSave = currentBrew;
			const brewToSave = {
				...currentBrew,
				text      : currentBrew.text.normalize('NFC'),
				pageCount : ((currentBrew.renderer === 'legacy' ? currentBrew.text.match(/\\page/g) : currentBrew.text.match(/^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/gm)) || []).length + 1,
				patches   : stringifyPatches(makePatches(encodeURI(lastSavedBrew.current.text.normalize('NFC')), encodeURI(currentBrew.text.normalize('NFC')))),
				hash      : await md5(lastSavedBrew.current.text.normalize('NFC')),
				textBin   : undefined,
				version   : lastSavedBrew.current.version
			};

			const savedBrew = await save(brewToSave, saveToGoogle)
				.catch((err)=>{setError(err);});
			if(savedBrew) {
				lastSavedBrew.current = {
					...snapshotBrewBeforeSave,
					...savedBrew
				};

				setCurrentBrew((prevBrew)=>({
					...prevBrew,
					...savedBrew
				}));

				if(useLocalStorage) clearLocalStorage();
				onSaveSuccess(savedBrew);
			}
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

	//TODO: Candidate for refactor/rename; used with history tool to load previous verion; may overlap with snippet injection or handleBrewChange
	const updateBrew = (newData)=>setCurrentBrew((prevBrew)=>({
		...prevBrew,
		style    : newData.style,
		text     : newData.text,
		snippets : newData.snippets
	}));

	//======----- Google Toggle Button -----======
	const closeAlerts = (e)=>{
		e.stopPropagation(); //Only handle click once so alert doesn't reopen
		setAlertTrashedGoogleBrew(false);
		setAlertNoGoogleToTransfer(false);
		setConfirmGoogleTransfer(false);
		setAlertOwnershipToTransfer(false);
	};

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

	const toggleGoogleStorage = (e)=>{
		closeAlerts(e);
		const newSaveGoogle = !saveGoogle;
		setSaveGoogle((prev)=>!prev);
		setError(null);
		trySave(true, true, newSaveGoogle);
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

	//======----- Navbar -----======
	const renderNavbar = ()=>(
		<Navbar>
			<Nav.section>
				<Nav.item className='brewTitle'>{currentBrew.title}</Nav.item>
			</Nav.section>
			<Nav.section>
				{(pageName == 'editPage') && renderGoogleDriveIcon()}
				{error
					? <ErrorNavItem error={error} clearError={clearError} />
					: <Nav.dropdown className='save-menu'>
						{renderSaveButton()}
						{(pageName == 'editPage') && renderAutoSaveButton()}
					</Nav.dropdown>}
				<NewBrewItem />
				<PrintNavItem />
				<HelpNavItem />
				<VaultNavItem />
				{(pageName == 'editPage') && <ShareNavItem brew={currentBrew} currentPage={currentBrewRendererPageNum} />}
				<RecentNavItem brew={currentBrew} storageKey={(pageName == 'editPage') ? 'edit' : undefined} />
				<AccountNavItem />
			</Nav.section>
		</Navbar>
	);

	const renderAutoSaveButton = ()=>(
		<Nav.item onClick={toggleAutoSave}>
			Autosave <i className={autoSaveEnabled ? 'fas fa-power-off active' : 'fas fa-power-off'}></i>
		</Nav.item>
	);

	const renderFloatingSaveButtons = ()=>(
		<>
			<div className={`floatingSaveButton${unsavedChanges ? ' show' : ''}`} onClick={()=>trySave(true, true, saveGoogle)}>
				Save current <i className='fas fa-save' />
			</div>
			<a href='/new' className='floatingNewButton'>
				Create your own <i className='fas fa-magic' />
			</a>
		</>
	);

	const renderPanels = ()=>(
		<div className= {`${pageName} sitePage`}>
			<Meta name='google-site-verification' content='NwnAQSSJZzAT7N-p5MY6ydQ7Njm67dtbu73ZSyE5Fy4' />
			{(pageName == 'editPage') && <Meta name='robots' content='noindex, nofollow' />}
			{renderNavbar()}
			{currentBrew.lock && <LockNotification shareId={currentBrew.shareId} message={currentBrew.lock.editMessage} reviewRequested={currentBrew.lock.reviewRequested}/>}
			<div className='content'>
				<SplitPane onDragFinish={handleSplitMove}>
					<Editor
						ref={editorRef}
						brew={currentBrew}
						onBrewChange={handleBrewChange}
						reportError={setError}
						renderer={currentBrew.renderer}
						userThemes={userThemes}
						showEditButtons={showEditorButtons}
						themeBundle={themeBundle}
						updateBrew={updateBrew}
						onCursorPageChange={setCurrentEditorCursorPageNum}
						onViewPageChange={setCurrentEditorViewPageNum}
						currentEditorViewPageNum={currentEditorViewPageNum}
						currentEditorCursorPageNum={currentEditorCursorPageNum}
						currentBrewRendererPageNum={currentBrewRendererPageNum}
					/>
					<BrewRenderer
						lang={currentBrew.lang}
						text={currentBrew.text}
						style={currentBrew.style}
						renderer={currentBrew.renderer}
						themeBundle={themeBundle}
						errors={HTMLErrors}
						onPageChange={setCurrentBrewRendererPageNum}
						currentEditorCursorPageNum={currentEditorCursorPageNum}
						allowPrint={true} //TODO: candidate for cleanup in brewRenderer. Homepage only place where allowPrint = false. Vote OK to allow print everywhere
					/>
				</SplitPane>
			</div>
			{showFloatingButtons && renderFloatingSaveButtons()}
		</div>
	);

	return {
		trySave,
		renderPanels
	};
}