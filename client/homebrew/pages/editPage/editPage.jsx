/* eslint-disable max-lines */
import './editPage.less';

// Common imports
import React, { useState, useEffect, useRef } from 'react';
import request                                from '../../utils/request-middleware.js';
import Markdown                               from 'markdown.js';
import _                                      from 'lodash';

import { DEFAULT_BREW_LOAD }                  from '../../../../server/brewDefaults.js';
import { printCurrentBrew, fetchThemeBundle, splitTextStyleAndMetadata } from '../../../../shared/helpers.js';

import SplitPane    from 'client/components/splitPane/splitPane.jsx';
import Editor       from '../../editor/editor.jsx';
import BrewRenderer from '../../brewRenderer/brewRenderer.jsx';

import Nav                       from 'client/homebrew/navbar/nav.jsx';
import Navbar                    from 'client/homebrew/navbar/navbar.jsx';
import NewBrewItem               from 'client/homebrew/navbar/newbrew.navitem.jsx';
import AccountNavItem            from 'client/homebrew/navbar/account.navitem.jsx';
import ErrorNavItem              from 'client/homebrew/navbar/error-navitem.jsx';
import HelpNavItem               from 'client/homebrew/navbar/help.navitem.jsx';
import VaultNavItem              from 'client/homebrew/navbar/vault.navitem.jsx';
import PrintNavItem              from 'client/homebrew/navbar/print.navitem.jsx';
import { both as RecentNavItem } from 'client/homebrew/navbar/recent.navitem.jsx';

// Page specific imports
import { Meta }                          from 'vitreum/headtags';
import { md5 }                           from 'hash-wasm';
import { gzipSync, strToU8 }             from 'fflate';
import { makePatches, stringifyPatches } from '@sanity/diff-match-patch';

import ShareNavItem              from 'client/homebrew/navbar/share.navitem.jsx';
import LockNotification from './lockNotification/lockNotification.jsx';
import { updateHistory, versionHistoryGarbageCollection } from '../../utils/versionHistory.js';
import googleDriveIcon from '../../googleDrive.svg';

const SAVE_TIMEOUT = 10000;
const UNSAVED_WARNING_TIMEOUT = 900000; //Warn user afer 15 minutes of unsaved changes
const UNSAVED_WARNING_POPUP_TIMEOUT = 4000; //Show the warning for 4 seconds


const AUTOSAVE_KEY = 'HB_editor_autoSaveOn';
const BREWKEY  = 'HB_newPage_content';
const STYLEKEY = 'HB_newPage_style';
const SNIPKEY  = 'HB_newPage_snippets';
const METAKEY  = 'HB_newPage_meta';

const useLocalStorage = false;
const neverSaved			= false;

const EditPage = (props)=>{
	props = {
		brew : DEFAULT_BREW_LOAD,
		...props
	};

	const [currentBrew               , setCurrentBrew               ] = useState(props.brew);
	const [isSaving                  , setIsSaving                  ] = useState(false);
	const [lastSavedTime             , setLastSavedTime             ] = useState(new Date());
  const [saveGoogle                , setSaveGoogle                ] = useState(!!props.brew.googleId);
	const [error                     , setError                     ] = useState(null);
	const [HTMLErrors                , setHTMLErrors                ] = useState(Markdown.validate(props.brew.text));
	const [currentEditorViewPageNum  , setCurrentEditorViewPageNum  ] = useState(1);
	const [currentEditorCursorPageNum, setCurrentEditorCursorPageNum] = useState(1);
	const [currentBrewRendererPageNum, setCurrentBrewRendererPageNum] = useState(1);
	const [themeBundle               , setThemeBundle               ] = useState({});
	const [unsavedChanges            , setUnsavedChanges            ] = useState(false);
	const [alertTrashedGoogleBrew    , setAlertTrashedGoogleBrew    ] = useState(props.brew.trashed);
	const [alertLoginToTransfer      , setAlertLoginToTransfer      ] = useState(false);
	const [confirmGoogleTransfer     , setConfirmGoogleTransfer     ] = useState(false);
	const [autoSaveEnabled           , setAutoSaveEnabled           ] = useState(true);
	const [warnUnsavedChanges        , setWarnUnsavedChanges        ] = useState(true);

	const editorRef          = useRef(null);
	const lastSavedBrew      = useRef(_.cloneDeep(props.brew));
	const saveTimeout        = useRef(null);
	const warnUnsavedTimeout = useRef(null);
	const trySaveRef         = useRef(trySave); // CTRL+S listener lives outside React and needs ref to use trySave with latest copy of brew
	const unsavedChangesRef  = useRef(unsavedChanges); // Similarly, onBeforeUnload lives outside React and needs ref to unsavedChanges

	useEffect(()=>{
		const autoSavePref = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) ?? true);
		setAutoSaveEnabled(autoSavePref);
		setWarnUnsavedChanges(!autoSavePref);
		setHTMLErrors(Markdown.validate(currentBrew.text));
		fetchThemeBundle(setError, setThemeBundle, currentBrew.renderer, currentBrew.theme);

		const handleControlKeys = (e)=>{
			if(!(e.ctrlKey || e.metaKey)) return;
			if(e.keyCode === 83) trySaveRef.current(true);
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

	useEffect(()=>{
		trySaveRef.current = trySave;
		unsavedChangesRef.current = unsavedChanges;
	});

	useEffect(()=>{
		const hasChange = !_.isEqual(currentBrew, lastSavedBrew.current);
		setUnsavedChanges(hasChange);

		if(autoSaveEnabled) trySave(false, hasChange);
	}, [currentBrew]);

	useEffect(()=>{
		trySave(true);
	}, [saveGoogle]);

	const handleSplitMove = ()=>{
		editorRef.current?.update();
	};

	const handleBrewChange = (field)=>(value, subfield)=>{	//'text', 'style', 'snippets', 'metadata'
		if(subfield == 'renderer' || subfield == 'theme')
			fetchThemeBundle(setError, setThemeBundle, value.renderer, value.theme);

		//If there are HTML errors, run the validator on every change to give quick feedback
		if(HTMLErrors.length && (field == 'text' || field == 'snippets'))
			setHTMLErrors(Markdown.validate(value));

		if(field == 'metadata') setCurrentBrew((prev)=>({ ...prev, ...value }));
		else                    setCurrentBrew((prev)=>({ ...prev, [field]: value }));

		if(useLocalStorage) {
			if(field == 'text')     localStorage.setItem(BREWKEY, value);
			if(field == 'style')    localStorage.setItem(STYLEKEY, value);
			if(field == 'snippets') localStorage.setItem(SNIPKEY, value);
			if(field == 'metadata') localStorage.setItem(METAKEY, JSON.stringify({
				renderer : value.renderer,
				theme    : value.theme,
				lang     : value.lang
			}));
		}
	};

	const updateBrew = (newData)=>setCurrentBrew((prevBrew)=>({
		...prevBrew,
		style    : newData.style,
		text     : newData.text,
		snippets : newData.snippets
	}));

	const resetWarnUnsavedTimer = ()=>{
		setTimeout(()=>setWarnUnsavedChanges(false), UNSAVED_WARNING_POPUP_TIMEOUT); // Hide the warning after 4 seconds
		clearTimeout(warnUnsavedTimeout.current);
		warnUnsavedTimeout.current = setTimeout(()=>setWarnUnsavedChanges(true), UNSAVED_WARNING_TIMEOUT); // 15 minutes between unsaved work warnings
	};

	const handleGoogleClick = ()=>{
		if(!global.account?.googleId) {
			setAlertLoginToTransfer(true);
			return;
		}

		setConfirmGoogleTransfer((prev)=>!prev);
		setError(null);
	};

	const closeAlerts = (e)=>{
		e.stopPropagation(); //Only handle click once so alert doesn't reopen
		setAlertTrashedGoogleBrew(false);
		setAlertLoginToTransfer(false);
		setConfirmGoogleTransfer(false);
	};

	const toggleGoogleStorage = ()=>{
		setSaveGoogle((prev)=>!prev);
		setError(null);
	};

	const trySave = (immediate = false, hasChanges = true)=>{
		clearTimeout(saveTimeout.current);
		if(isSaving) return;
		if(!hasChanges && !immediate) return;
		const newTimeout = immediate ? 0 : SAVE_TIMEOUT;

		saveTimeout.current = setTimeout(async ()=>{
			setIsSaving(true);
			setError(null);
			await save(currentBrew, saveGoogle)
			.catch((err)=>{
				setError(err);
			});
			setIsSaving(false);
			setLastSavedTime(new Date());
			if(!autoSaveEnabled) resetWarnUnsavedTimer();
		}, newTimeout);
	};

	const save = async (brew, saveToGoogle)=>{
		setHTMLErrors(Markdown.validate(brew.text));

		await updateHistory(brew).catch(console.error);
		await versionHistoryGarbageCollection().catch(console.error);

		//Prepare content to send to server
		const brewToSave = {
			...brew,
			text      : brew.text.normalize('NFC'),
			pageCount : ((brew.renderer === 'legacy' ? brew.text.match(/\\page/g) : brew.text.match(/^\\page$/gm)) || []).length + 1,
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
			googleId : res.body.googleId ?? null,
			editId   : res.body.editId,
			shareId  : res.body.shareId,
			version  : res.body.version
		};

		lastSavedBrew.current = {
			...brew,
			...updatedFields
		};

		setCurrentBrew((prevBrew)=>({
			...prevBrew,
			...updatedFields
		}));

		history.replaceState(null, null, `/edit/${res.body.editId}`);
	};

	const renderGoogleDriveIcon = ()=>(
		<Nav.item className='googleDriveStorage' onClick={handleGoogleClick}>
			<img src={googleDriveIcon} className={saveGoogle ? '' : 'inactive'} alt='Google Drive icon' />

			{confirmGoogleTransfer && (
				<div className='errorContainer' onClick={closeAlerts}>
					{saveGoogle
						? 'Would you like to transfer this brew from your Google Drive storage back to the Homebrewery?'
						: 'Would you like to transfer this brew from the Homebrewery to your personal Google Drive storage?'}
					<br />
					<div className='confirm' onClick={toggleGoogleStorage}> Yes </div>
					<div className='deny'>                                  No  </div>
				</div>
			)}

			{alertLoginToTransfer && (
				<div className='errorContainer' onClick={closeAlerts}>
					You must be signed in to a Google account to transfer between the homebrewery and Google Drive!
					<a target='_blank' rel='noopener noreferrer' href={`https://www.naturalcrit.com/login?redirect=${window.location.href}`}>
						<div className='confirm'> Sign In </div>
					</a>
					<div className='deny'>      Not Now </div>
				</div>
			)}

			{alertTrashedGoogleBrew && (
				<div className='errorContainer' onClick={closeAlerts}>
					This brew is currently in your Trash folder on Google Drive!<br />
					If you want to keep it, make sure to move it before it is deleted permanently!<br />
					<div className='confirm'> OK </div>
				</div>
			)}
		</Nav.item>
	);

	const renderSaveButton = ()=>{
		// #1 - Currently saving, show SAVING
		if(isSaving)
			return <Nav.item className='save' icon='fas fa-spinner fa-spin'>saving...</Nav.item>;

		// #2 - Unsaved changes exist, autosave is OFF and warning timer has expired, show AUTOSAVE WARNING
		if(unsavedChanges && warnUnsavedChanges) {
			resetWarnUnsavedTimer();
			const elapsedTime = Math.round((new Date() - lastSavedTime) / 1000 / 60);
			const text = elapsedTime === 0
				? 'Autosave is OFF.'
				: `Autosave is OFF, and you haven't saved for ${elapsedTime} minutes.`;

			return <Nav.item className='save error' icon='fas fa-exclamation-circle'>
							Reminder...
				<div className='errorContainer'>{text}</div>
			</Nav.item>;
		}

		// #3 - Unsaved changes exist, click to save, show SAVE NOW
		if(unsavedChanges)
			return <Nav.item className='save' onClick={()=>trySave(true)} color='blue' icon='fas fa-save'>save now</Nav.item>;

		// #4 - No unsaved changes, autosave is ON, show AUTO-SAVED
		if(autoSaveEnabled)
			return <Nav.item className='save saved'>auto-saved</Nav.item>;

		// #5 - No unsaved changes, and has never been saved, hide the button
		if(neverSaved)
			return <Nav.item className='save neverSaved'>save now</Nav.item>;

		// DEFAULT - No unsaved changes, show SAVED
		return <Nav.item className='save saved'>saved</Nav.item>;
	};

	const toggleAutoSave = ()=>{
		clearTimeout(warnUnsavedTimeout.current);
		clearTimeout(saveTimeout.current);
		localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(!autoSaveEnabled));
		setAutoSaveEnabled(!autoSaveEnabled);
		setWarnUnsavedChanges(autoSaveEnabled);
	};

	const renderAutoSaveButton = ()=>(
		<Nav.item onClick={toggleAutoSave}>
			Autosave <i className={autoSaveEnabled ? 'fas fa-power-off active' : 'fas fa-power-off'}></i>
		</Nav.item>
	);

	const clearError = ()=>{
		setError(null);
		setIsSaving(false);
	};

	const renderNavbar = ()=>{
		return <Navbar>
			<Nav.section>
				<Nav.item className='brewTitle'>{currentBrew.title}</Nav.item>
			</Nav.section>

			<Nav.section>
				{renderGoogleDriveIcon()}
				{error
					? <ErrorNavItem error={error} clearError={clearError} />
					: <Nav.dropdown className='save-menu'>
						{renderSaveButton()}
						{renderAutoSaveButton()}
					</Nav.dropdown>}
				<NewBrewItem />
				<PrintNavItem />
				<HelpNavItem />
				<VaultNavItem />
				<ShareNavItem brew={currentBrew} />
				<RecentNavItem brew={currentBrew} storageKey='edit' />
				<AccountNavItem/>
			</Nav.section>
		</Navbar>;
	};

	return (
		<div className='editPage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />

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
						userThemes={props.userThemes}
						themeBundle={themeBundle}
						updateBrew={updateBrew}
						onCursorPageChange={setCurrentEditorCursorPageNum}
						onViewPageChange={setCurrentEditorViewPageNum}
						currentEditorViewPageNum={currentEditorViewPageNum}
						currentEditorCursorPageNum={currentEditorCursorPageNum}
						currentBrewRendererPageNum={currentBrewRendererPageNum}
					/>
					<BrewRenderer
						text={currentBrew.text}
						style={currentBrew.style}
						renderer={currentBrew.renderer}
						theme={currentBrew.theme}
						themeBundle={themeBundle}
						errors={HTMLErrors}
						lang={currentBrew.lang}
						onPageChange={setCurrentBrewRendererPageNum}
						currentEditorViewPageNum={currentEditorViewPageNum}
						currentEditorCursorPageNum={currentEditorCursorPageNum}
						currentBrewRendererPageNum={currentBrewRendererPageNum}
						allowPrint={true}
					/>
				</SplitPane>
			</div>
		</div>
	);
};

module.exports = EditPage;
