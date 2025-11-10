/* eslint-disable max-lines */
import './newPage.less';

// Common imports
import React, { useState, useEffect, useRef } from 'react';
import request                                from '../../utils/request-middleware.js';
import Markdown                               from 'markdown.js';
import _                                      from 'lodash';

import { DEFAULT_BREW }                       from '../../../../server/brewDefaults.js';
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
import { Meta }                  from 'vitreum/headtags';

const BREWKEY  = 'HB_newPage_content';
const STYLEKEY = 'HB_newPage_style';
const METAKEY  = 'HB_newPage_metadata';
const SNIPKEY  = 'HB_newPage_snippets';
const SAVEKEYPREFIX  = 'HB_editor_defaultSave_';

const useLocalStorage = true;
const neverSaved      = true;

const NewPage = (props)=>{
	props = {
		brew : DEFAULT_BREW,
		...props
	};

	const [currentBrew               , setCurrentBrew               ] = useState(props.brew);
	const [isSaving                  , setIsSaving                  ] = useState(false);
	const [saveGoogle                , setSaveGoogle                ] = useState(global.account?.googleId ? true : false);
	const [error                     , setError                     ] = useState(null);
	const [HTMLErrors                , setHTMLErrors                ] = useState(Markdown.validate(props.brew.text));
	const [currentEditorViewPageNum  , setCurrentEditorViewPageNum  ] = useState(1);
	const [currentEditorCursorPageNum, setCurrentEditorCursorPageNum] = useState(1);
	const [currentBrewRendererPageNum, setCurrentBrewRendererPageNum] = useState(1);
	const [themeBundle               , setThemeBundle               ] = useState({});
	const [unsavedChanges            , setUnsavedChanges            ] = useState(false);
	const [autoSaveEnabled           , setAutoSaveEnabled           ] = useState(false);

	const editorRef     = useRef(null);
	const lastSavedBrew = useRef(_.cloneDeep(props.brew));
	// const saveTimeout        = useRef(null);
	// const warnUnsavedTimeout = useRef(null);
	const trySaveRef         = useRef(trySave); // CTRL+S listener lives outside React and needs ref to use trySave with latest copy of brew
	const unsavedChangesRef  = useRef(unsavedChanges); // Similarly, onBeforeUnload lives outside React and needs ref to unsavedChanges

	useEffect(()=>{
		loadBrew();
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

		return ()=>{
			document.removeEventListener('keydown', handleControlKeys);
		};
	}, []);

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
		const hasChange = !_.isEqual(currentBrew, lastSavedBrew.current);
		setUnsavedChanges(hasChange);

		if(autoSaveEnabled) trySave(false, hasChange);
	}, [currentBrew]);

	useEffect(()=>{
		trySaveRef.current = trySave;
		unsavedChangesRef.current = unsavedChanges;
	});

	const handleSplitMove = ()=>{
		editorRef.current.update();
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

	const trySave = async ()=>{
  	setIsSaving(true);

		const updatedBrew = { ...currentBrew };
		splitTextStyleAndMetadata(updatedBrew);

		const pageRegex = updatedBrew.renderer === 'legacy' ? /\\page/g : /^\\page$/gm;
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
		window.location = `/edit/${savedBrew.editId}`;
	};

	const renderSaveButton = ()=>{
		// #1 - Currently saving, show SAVING
		if(isSaving)
			return <Nav.item className='save' icon='fas fa-spinner fa-spin'>saving...</Nav.item>;

		// #2 - Unsaved changes exist, autosave is OFF and warning timer has expired, show AUTOSAVE WARNING
		// if(unsavedChanges && warnUnsavedChanges) {
		// 	resetWarnUnsavedTimer();
		// 	const elapsedTime = Math.round((new Date() - lastSavedTime) / 1000 / 60);
		// 	const text = elapsedTime === 0
		// 		? 'Autosave is OFF.'
		// 		: `Autosave is OFF, and you haven't saved for ${elapsedTime} minutes.`;

		// 	return <Nav.item className='save error' icon='fas fa-exclamation-circle'>
		// 					Reminder...
		// 		<div className='errorContainer'>{text}</div>
		// 	</Nav.item>;
		// }

		// #3 - Unsaved changes exist, click to save, show SAVE NOW
		if(unsavedChanges)
			return <Nav.item className='save' onClick={trySave} color='blue' icon='fas fa-save'>save now</Nav.item>;

		// #4 - No unsaved changes, autosave is ON, show AUTO-SAVED
		if(autoSaveEnabled)
			return <Nav.item className='save saved'>auto-saved</Nav.item>;

		// #5 - No unsaved changes, and has never been saved, hide the button
		if(neverSaved)
			return <Nav.item className='save neverSaved'>save now</Nav.item>;

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

module.exports = NewPage;
