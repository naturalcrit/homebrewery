/* eslint-disable max-lines */
import './editPage.less';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import request                                from '../../utils/request-middleware.js';
import Markdown                               from 'naturalcrit/markdown.js';

import _                                                           from 'lodash';;
import {makePatches, applyPatches, stringifyPatches, parsePatches} from '@sanity/diff-match-patch';
import { md5 }                                                     from 'hash-wasm';
import { gzipSync, strToU8 }                                       from 'fflate';

const { Meta } = require('vitreum/headtags');

import Nav                       from 'naturalcrit/nav/nav.jsx';
import Navbar                    from '../../navbar/navbar.jsx';
import NewBrewItem               from '../../navbar/newbrew.navitem.jsx';
import AccountNavItem            from '../../navbar/account.navitem.jsx';
import ErrorNavItem              from '../../navbar/error-navitem.jsx';
import HelpNavItem               from '../../navbar/help.navitem.jsx';
import VaultNavItem              from '../../navbar/vault.navitem.jsx';
import PrintNavItem              from '../../navbar/print.navitem.jsx';
import { both as RecentNavItem } from '../../navbar/recent.navitem.jsx';

import SplitPane    from 'client/components/splitPane/splitPane.jsx';
import Editor       from '../../editor/editor.jsx';
import BrewRenderer from '../../brewRenderer/brewRenderer.jsx';

import LockNotification from './lockNotification/lockNotification.jsx';

import { DEFAULT_BREW_LOAD }                                             from '../../../../server/brewDefaults.js';
import { printCurrentBrew, fetchThemeBundle, splitTextStyleAndMetadata } from '../../../../shared/helpers.js';

import { updateHistory, versionHistoryGarbageCollection } from '../../utils/versionHistory.js';

import googleDriveIcon from '../../googleDrive.svg';

const SAVE_TIMEOUT = 10000;

const EditPage = (props) => {
	props = {
		brew: DEFAULT_BREW_LOAD,
		...props
	};
  const editorRef    = useRef(null);
  const savedBrew    = useRef(_.cloneDeep(props.brew));
  const warningTimer = useRef(null);

	const [currentBrew               , setCurrentBrew               ] = useState(props.brew);
	const [isSaving                  , setIsSaving                  ] = useState(false);
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
	const [url                       , setUrl                       ] = useState('');
	const [autoSave                  , setAutoSave                  ] = useState(true);
	const [autoSaveWarning           , setAutoSaveWarning           ] = useState(false);
	const [unsavedTime               , setUnsavedTime               ] = useState(new Date());

	const debounceSave = useMemo(() => _.debounce(() => trySave(), SAVE_TIMEOUT), []);

	useEffect(() => {
		setUrl(window.location.href);

		const autoSavePref = JSON.parse(localStorage.getItem('AUTOSAVE_ON') ?? true);
		setAutoSave(autoSavePref);
		setAutoSaveWarning(!autoSavePref)
		setHTMLErrors(Markdown.validate(currentBrew.text));
		fetchThemeBundle(setError, setThemeBundle, currentBrew.renderer, currentBrew.theme);

		document.addEventListener('keydown', handleControlKeys);
		window.onbeforeunload = () => {
			if (isSaving || unsavedChanges) {
				return 'You have unsaved changes!';
			}
		};

		return () => {
			document.removeEventListener('keydown', handleControlKeys);
			window.onbeforeunload = null;
		};
	}, []);

	useEffect(() => {
		const hasChange = !_.isEqual(currentBrew, savedBrew.current);
		setUnsavedChanges(hasChange);
	}, [currentBrew]);

	const handleControlKeys = (e) => {
		if (!(e.ctrlKey || e.metaKey)) return;
		const S_KEY = 83;
		const P_KEY = 80;
		if (e.keyCode === S_KEY) trySave(true);
		if (e.keyCode === P_KEY) printCurrentBrew();
		if (e.keyCode === S_KEY || e.keyCode === P_KEY) {
			e.stopPropagation();
			e.preventDefault();
		}
	};

	const handleSplitMove = () => {
		editorRef.current?.update();
	};

	const handleEditorViewPageChange = (pageNumber) => {
		setCurrentEditorViewPageNum(pageNumber);
	};

	const handleEditorCursorPageChange = (pageNumber) => {
		setCurrentEditorCursorPageNum(pageNumber);
	};

	const handleBrewRendererPageChange = (pageNumber) => {
		setCurrentBrewRendererPageNum(pageNumber);
	};

	const handleTextChange = (text) => {
		//If there are HTML errors, run the validator on every change to give quick feedback
		if(HTMLErrors.length)
			HTMLErrors = Markdown.validate(text);

		setHTMLErrors(HTMLErrors);
		setCurrentBrew((prevBrew) => ({ ...prevBrew, text }));
		if (autoSave) debounceSave();
	};

	const handleStyleChange = (style) => {
		setCurrentBrew(prevBrew => ({ ...prevBrew, style }));
		if (autoSave) debounceSave();
	};

	const handleSnipChange = (snippet)=>{
		//If there are HTML errors, run the validator on every change to give quick feedback
		if(HTMLErrors.length)
			HTMLErrors = Markdown.validate(snippet);

		setHTMLErrors(HTMLErrors);
		setCurrentBrew((prevBrew) => ({ ...prevBrew, snippets: snippet }));
		if (autoSave) debounceSave();
	};

	const handleMetaChange = (metadata, field = undefined) => {
		if (field === 'theme' || field === 'renderer')
			fetchThemeBundle(setError, setThemeBundle, metadata.renderer, metadata.theme);

		setCurrentBrew(prev => ({ ...prev, ...metadata }));
		if (autoSave) debounceSave();
	};

	const updateBrew = (newData) => 
		setCurrentBrew((prevBrew) => ({
			...prevBrew,
			style    : newData.style,
			text     : newData.text,
			snippets : newData.snippets
		}));
		
	const trySave = (immediate = false) => {
		if (!debounceSave.current) return;
		if (isSaving) return;

		const hasChange = !_.isEqual(currentBrew, savedBrew.current);

		if (immediate) {
			debounceSave.current();
			debounceSave.current.flush?.();
			return;
		}

		if (hasChange) {
			debounceSave.current();
		} else {
			debounceSave.current.cancel?.();
		}
	};

	const handleGoogleClick = () => {
		if (!global.account?.googleId) {
			setAlertLoginToTransfer(true);
			return;
		}

		setConfirmGoogleTransfer((prev) => !prev);
		setError(null);
	};

	const closeAlerts = (e) => {
		e.stopPropagation(); //Only handle click once so alert doesn't reopen
		setAlertTrashedGoogleBrew(false);
		setAlertLoginToTransfer(false);
		setConfirmGoogleTransfer(false);
	};

	const toggleGoogleStorage = () => {
		setSaveGoogle((prev) => !prev);
		setError(null);
		trySave(true);
	};

	const save = async () => {
		debounceSave.current?.cancel?.();

		setIsSaving(true);
		setError(null);
		setHTMLErrors(Markdown.validate(currentBrew.text));

		await updateHistory(currentBrew).catch(console.error);
		await versionHistoryGarbageCollection().catch(console.error);

		//Prepare content to send to server
		const brewToSave = {
			...currentBrew,
			text     : currentBrew.text.normalize('NFC'),
			pageCount: ((currentBrew.renderer === 'legacy' ? currentBrew.text.match(/\\page/g) : currentBrew.text.match(/^\\page$/gm)) || []).length + 1,
			patches  : stringifyPatches(makePatches(encodeURI(savedBrew.current.text.normalize('NFC')), encodeURI(currentBrew.text.normalize('NFC')))),
			hash     : await md5(savedBrew.current.text),
			textBin  : undefined
		};

		const compressedBrew = gzipSync(strToU8(JSON.stringify(brewToSave)));
		const transfer = saveGoogle === _.isNil(currentBrew.googleId);
		const params = transfer ? `?${saveGoogle ? 'saveToGoogle' : 'removeFromGoogle'}=true` : '';

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

		const { googleId, editId, shareId, version } = res.body;

		savedBrew.current = {
			...currentBrew,
			googleId: googleId ?? null,
			editId,
			shareId,
			version
		};

		setCurrentBrew(prev => ({
			...prev,
			googleId: googleId ?? null,
			editId,
			shareId,
			version
		}));

		setIsSaving(false);
		setUnsavedTime(new Date());
		setUnsavedChanges(!_.isEqual(currentBrew, savedBrew.current));

		history.replaceState(null, null, `/edit/${editId}`);
	};

	const renderGoogleDriveIcon = () => (
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
					<a target='_blank' rel='noopener noreferrer' href={`https://www.naturalcrit.com/login?redirect=${url}`}>
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

	const renderSaveButton = () => {
		// #1 - Currently saving, show SAVING
		if (isSaving)
			return <Nav.item className='save' icon='fas fa-spinner fa-spin'>saving...</Nav.item>;

		// #2 - Unsaved changes exist, autosave is OFF and warning timer has expired, show AUTOSAVE WARNING
		if (unsavedChanges && autoSaveWarning) {
			setAutosaveWarning();
			const elapsedTime = Math.round((new Date() - unsavedTime) / 1000 / 60);
			const text = elapsedTime === 0
				? 'Autosave is OFF.'
				: `Autosave is OFF, and you haven't saved for ${elapsedTime} minutes.`;

			return <Nav.item className='save error' icon='fas fa-exclamation-circle'>
							Reminder...
							<div className='errorContainer'>{text}</div>
						</Nav.item>
		}

		// #3 - Unsaved changes exist, click to save, show SAVE NOW
		if (unsavedChanges)
			return <Nav.item className='save' onClick={() => trySave(true)} color='blue' icon='fas fa-save'>Save Now</Nav.item>

		// #4 - No unsaved changes, autosave is ON, show AUTO-SAVED
		if (autoSave)
			return <Nav.item className='save saved'>auto-saved.</Nav.item>;

		// DEFAULT - No unsaved changes, show SAVED
		return <Nav.item className='save saved'>saved.</Nav.item>;
	};

	const handleAutoSave = () => {
		if (warningTimer.current) clearTimeout(warningTimer.current);
		localStorage.setItem('AUTOSAVE_ON', JSON.stringify(!autoSaveEnabled));
		setAutoSave(!autoSave);
		setAutoSaveWarning(false);
	};

	const resetAutosaveWarning = () => {
		setTimeout(setAutoSaveWarning(false), 4000); // Hide the warning after 4 seconds
		warningTimer.current = setTimeout(setAutoSaveWarning(true), 900000); // 15 minutes between unsaved changes warnings
	};

	const renderAutoSaveButton = () => (
		<Nav.item onClick={handleAutoSave}>
			Autosave <i className={autoSave ? 'fas fa-power-off active' : 'fas fa-power-off'}></i>
		</Nav.item>
	);

	const processShareId = () => (
		currentBrew.googleId && !currentBrew.stubbed
			? currentBrew.googleId + currentBrew.shareId
			: currentBrew.shareId
	);

	const getRedditLink = () => {
		const shareLink = processShareId();
		const systems = currentBrew.systems.length > 0 ? ` [${currentBrew.systems.join(' - ')}]` : '';
		const title = `${currentBrew.title} ${systems}`;
		const text = `Hey guys! I've been working on this homebrew. I'd love your feedback. Check it out.

	**[Homebrewery Link](${global.config.baseUrl}/share/${shareLink})**`;

		return `https://www.reddit.com/r/UnearthedArcana/submit?title=${encodeURIComponent(title.toWellFormed())}&text=${encodeURIComponent(text)}`;
	};

	const clearError = () => {
		setError(null);
		setIsSaving(false);
	};

	const renderNavbar = ()=>{
		const shareLink = processShareId();

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
				<NewBrewItem/>
				<HelpNavItem/>
				<Nav.dropdown>
					<Nav.item color='teal' icon='fas fa-share-alt'>
						share
					</Nav.item>
					<Nav.item color='blue' href={`/share/${shareLink}`}>
						view
					</Nav.item>
					<Nav.item color='blue' onClick={()=>{navigator.clipboard.writeText(`${global.config.baseUrl}/share/${shareLink}`);}}>
						copy url
					</Nav.item>
					<Nav.item color='blue' href={getRedditLink()} newTab={true} rel='noopener noreferrer'>
						post to reddit
					</Nav.item>
				</Nav.dropdown>
				<PrintNavItem />
				<VaultNavItem />
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
						onTextChange={handleTextChange}
						onStyleChange={handleStyleChange}
						onSnipChange={handleSnipChange}
						onMetaChange={handleMetaChange}
						reportError={setError}
						renderer={currentBrew.renderer}
						userThemes={props.userThemes}
						themeBundle={themeBundle}
						updateBrew={updateBrew}
						onCursorPageChange={handleEditorCursorPageChange}
						onViewPageChange={handleEditorViewPageChange}
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
						onPageChange={handleBrewRendererPageChange}
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
