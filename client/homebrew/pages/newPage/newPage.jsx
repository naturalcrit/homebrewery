/* eslint-disable max-lines */
import './newPage.less';

// Common imports
import React, { useState, useEffect, useRef } from 'react';
import request                                from '../../utils/request-middleware.js';
import { hbfm } from 'hbmarkedwrapper';
import _                                      from 'lodash';

import { DEFAULT_BREW }                       from '../../../../server/brewDefaults.js';
import { printCurrentBrew, fetchThemeBundle, splitTextStyleAndMetadata } from '@shared/helpers.js';

import useCommonEditPageFunctions from '../../utils/commonEditPageFunctions.js'

import SplitPane    from '@components/splitPane/splitPane.jsx';
import Editor       from '../../editor/editor.jsx';
import BrewRenderer from '../../brewRenderer/brewRenderer.jsx';

import Nav            from '@navbar/nav.jsx';
import Navbar         from '@navbar/navbar.jsx';
import NewBrewItem    from '@navbar/newbrew.navitem.jsx';
import AccountNavItem from '@navbar/account.navitem.jsx';
import ErrorNavItem   from '@navbar/error-navitem.jsx';
import HelpNavItem    from '@navbar/help.navitem.jsx';
import VaultNavItem   from '@navbar/vault.navitem.jsx';
import PrintNavItem   from '@navbar/print.navitem.jsx';
import RecentNavItems from '@navbar/recent.navitem.jsx';
const { both: RecentNavItem } = RecentNavItems;

// Page specific imports
const SAVE_TIMEOUT = 10000;
const UNSAVED_WARNING_TIMEOUT = 900000; //Warn user afer 15 minutes of unsaved changes
const UNSAVED_WARNING_POPUP_TIMEOUT = 4000; //Show the warning for 4 seconds

const BREWKEY  = 'HB_newPage_content';
const STYLEKEY = 'HB_newPage_style';
const SNIPKEY  = 'HB_newPage_snippets';
const METAKEY  = 'HB_newPage_meta';

const SAVEKEYPREFIX  = 'HB_editor_defaultSave_';

const useLocalStorage = true;
const sandbox         = true;

const NewPage = (props)=>{
	props = {
		brew : DEFAULT_BREW,
		...props
	};

	const [currentBrew, setCurrentBrew] = useState(props.brew);
	const [isSaving, setIsSaving] = useState(false);
	const [lastSavedTime, setLastSavedTime] = useState(new Date());
	const [saveGoogle, setSaveGoogle] = useState(global.account?.googleId ? true : false);
	const [error, setError] = useState(null);
	const [HTMLErrors, setHTMLErrors] = useState(hbfm.validate(props.brew.text));
	const [currentEditorViewPageNum, setCurrentEditorViewPageNum] = useState(1);
	const [currentEditorCursorPageNum, setCurrentEditorCursorPageNum] = useState(1);
	const [currentBrewRendererPageNum, setCurrentBrewRendererPageNum] = useState(1);
	const [themeBundle, setThemeBundle] = useState({});
	const [unsavedChanges, setUnsavedChanges] = useState(false);
	const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
	const [warnUnsavedChanges, setWarnUnsavedChanges] = useState(true);

	const editorRef     = useRef(null);
	const lastSavedBrew = useRef(_.cloneDeep(props.brew));
	// const saveTimeout        = useRef(null);
	const warnUnsavedTimeout = useRef(null);
	const trySaveRef         = useRef(null); // CTRL+S listener lives outside React and needs ref to use trySave with latest copy of brew
	const unsavedChangesRef  = useRef(unsavedChanges); // Similarly, onBeforeUnload lives outside React and needs ref to unsavedChanges

	useEffect(()=>{
		loadBrew();
	}, []);

	const {
		handleBrewChange
	} = useCommonEditPageFunctions({
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
		unsavedChangesRef,
		setUnsavedChanges,
		sandbox,
		lastSavedBrew
	});

	const loadBrew = ()=>{
		const brew = { ...currentBrew };
		if(!brew.shareId && typeof window !== 'undefined') { //Load from localStorage if in client browser
			const brewStorage  = localStorage.getItem(BREWKEY);
			const styleStorage = localStorage.getItem(STYLEKEY);
			const metaStorage  = JSON.parse(localStorage.getItem(METAKEY));

			brew.text     = brewStorage           ?? brew.text;
			brew.style    = styleStorage          ?? brew.style;
			brew.renderer = metaStorage?.renderer ?? brew.renderer;
			brew.theme    = metaStorage?.theme    ?? brew.theme;
			brew.lang     = metaStorage?.lang     ?? brew.lang;
		}

		const SAVEKEY = `${SAVEKEYPREFIX}${global.account?.username}`;
		const saveStorage = localStorage.getItem(SAVEKEY) || 'HOMEBREWERY';

		setCurrentBrew(brew);
		lastSavedBrew.current = brew;
		setSaveGoogle(saveStorage == 'GOOGLE-DRIVE' && saveGoogle);

		localStorage.setItem(BREWKEY, brew.text);
		if(brew.style)
			localStorage.setItem(STYLEKEY, brew.style);
		localStorage.setItem(METAKEY, JSON.stringify({ renderer: brew.renderer, theme: brew.theme, lang: brew.lang }));
		if(window.location.pathname !== '/new')
			window.history.replaceState({}, window.location.title, '/new/');
	};

	useEffect(()=>{
		trySaveRef.current = trySave;
		unsavedChangesRef.current = unsavedChanges;
	});

	const handleSplitMove = ()=>{
		editorRef.current.update();
	};

	const resetWarnUnsavedTimer = ()=>{
		setTimeout(()=>setWarnUnsavedChanges(false), UNSAVED_WARNING_POPUP_TIMEOUT); // Hide the warning after 4 seconds
		clearTimeout(warnUnsavedTimeout.current);
		warnUnsavedTimeout.current = setTimeout(()=>setWarnUnsavedChanges(true), UNSAVED_WARNING_TIMEOUT); // 15 minutes between unsaved work warnings
	};

	const trySave = async ()=>{
  	setIsSaving(true);

		const updatedBrew = { ...currentBrew };
		splitTextStyleAndMetadata(updatedBrew);

		const pageRegex = updatedBrew.renderer === 'legacy' ? /\\page/g : /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/gm;
		updatedBrew.pageCount = (updatedBrew.text.match(pageRegex) || []).length + 1;

		const res = await request
			.post(`/api${saveGoogle ? '?saveToGoogle=true' : ''}`)
			.send(updatedBrew)
			.catch((err)=>{
				setIsSaving(false);
				setError(err);
			});

		setIsSaving(false);
		if(!res) return;

		const savedBrew = res.body;

		localStorage.removeItem(BREWKEY);
		localStorage.removeItem(STYLEKEY);
		localStorage.removeItem(METAKEY);
		window.onbeforeunload = null;
		window.location = `/edit/${savedBrew.editId}`;
	};

	const renderSaveButton = ()=>{
		// #1 - Currently saving, show SAVING
		if(isSaving)
			return <Nav.item className='save' icon='fas fa-spinner fa-spin'>saving...</Nav.item>;

		// #2 - Unsaved changes exist, autosave is OFF and warning timer has expired, show AUTOSAVE WARNING
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

		// #3 - Unsaved changes exist, click to save, show SAVE NOW
		if(unsavedChanges)
			return <Nav.item className='save' onClick={trySave} color='blue' icon='fas fa-save'>save now</Nav.item>;

		// #4 - No unsaved changes, autosave is ON, show AUTO-SAVED
		if(autoSaveEnabled)
			return <Nav.item className='save saved'>auto-saved</Nav.item>;

		// #5 - Sandbox with no unsaved changes, and has never been saved, hide the button
		if(sandbox)
			return <Nav.item className='save neverSaved' disabled={true}>save now</Nav.item>;

		// DEFAULT - No unsaved changes, show SAVED
		return <Nav.item className='save saved'>saved</Nav.item>;
	};

	const clearError = ()=>{
		setError(null);
		setIsSaving(false);
	};

	const renderNavbar = ()=>(
		<Navbar>
			<Nav.section>
				<Nav.item className='brewTitle'>{currentBrew.title}</Nav.item>
			</Nav.section>

			<Nav.section>
				{error
					? <ErrorNavItem error={error} clearError={clearError} />
					: renderSaveButton()}
				<NewBrewItem />
				<PrintNavItem />
				<HelpNavItem />
				<VaultNavItem />
				<RecentNavItem />
				<AccountNavItem />
			</Nav.section>
		</Navbar>
	);

	return (
		<div className='newPage sitePage'>
			{renderNavbar()}
			<div className='content'>
				<SplitPane onDragFinish={handleSplitMove}>
					<Editor
						ref={editorRef}
						brew={currentBrew}
						onBrewChange={handleBrewChange}
						renderer={currentBrew.renderer}
						userThemes={props.userThemes}
						themeBundle={themeBundle}
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

export default NewPage;
