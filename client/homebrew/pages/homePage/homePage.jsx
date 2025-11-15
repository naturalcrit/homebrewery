/* eslint-disable max-lines */
import './homePage.less';

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
import { Meta }                               from 'vitreum/headtags';

const BREWKEY  = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const SNIPKEY  = 'homebrewery-new-snippets';
const METAKEY  = 'homebrewery-new-meta';

const useLocalStorage = false;
const neverSaved      = true;

const HomePage =(props)=>{
	props = {
		brew : DEFAULT_BREW,
		ver  : '0.0.0',
		...props
	};

	const [currentBrew               , setCurrentBrew]                = useState(props.brew);
	const [error                     , setError]                      = useState(undefined);
	const [HTMLErrors                , setHTMLErrors]                 = useState(Markdown.validate(props.brew.text));
	const [currentEditorViewPageNum  , setCurrentEditorViewPageNum]   = useState(1);
	const [currentEditorCursorPageNum, setCurrentEditorCursorPageNum] = useState(1);
	const [currentBrewRendererPageNum, setCurrentBrewRendererPageNum] = useState(1);
	const [themeBundle               , setThemeBundle]                = useState({});
	const [unsavedChanges            , setUnsavedChanges]             = useState(false);
	const [isSaving                  , setIsSaving]                   = useState(false);
	const [autoSaveEnabled           , setAutoSaveEnable]             = useState(false);

	const editorRef         = useRef(null);
	const lastSavedBrew     = useRef(_.cloneDeep(props.brew));
	const unsavedChangesRef = useRef(unsavedChanges);

	useEffect(()=>{
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
			window.onbeforeunload = null;
		};
	}, []);

	useEffect(()=>{
		unsavedChangesRef.current = unsavedChanges;
	}, [unsavedChanges]);

	const save = ()=>{
		request.post('/api')
			.send(currentBrew)
			.end((err, res)=>{
				if(err) {
					setError(err);
					return;
				}
				const saved = res.body;
				window.location = `/edit/${saved.editId}`;
			});
	};

	useEffect(()=>{
		const hasChange = !_.isEqual(currentBrew, lastSavedBrew.current);
		setUnsavedChanges(hasChange);

		if(autoSaveEnabled) trySave(false, hasChange);
	}, [currentBrew]);

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
			return <Nav.item className='save' onClick={save} color='blue' icon='fas fa-save'>save now</Nav.item>;

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

	const renderNavbar = ()=>{
		return <Navbar ver={props.ver}>
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
		</Navbar>;
	};

	return (
		<div className='homePage sitePage'>
			<Meta name='google-site-verification' content='NwnAQSSJZzAT7N-p5MY6ydQ7Njm67dtbu73ZSyE5Fy4' />
			{renderNavbar()}
			<div className='content'>
				<SplitPane onDragFinish={handleSplitMove}>
					<Editor
						ref={editorRef}
						brew={currentBrew}
						onBrewChange={handleBrewChange}
						renderer={currentBrew.renderer}
						showEditButtons={false}
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
						onPageChange={setCurrentBrewRendererPageNum}
						currentEditorViewPageNum={currentEditorViewPageNum}
						currentEditorCursorPageNum={currentEditorCursorPageNum}
						currentBrewRendererPageNum={currentBrewRendererPageNum}
						themeBundle={themeBundle}
					/>
				</SplitPane>
			</div>
			<div className={`floatingSaveButton${unsavedChanges ? ' show' : ''}`} onClick={save}>
				Save current <i className='fas fa-save' />
			</div>

			<a href='/new' className='floatingNewButton'>
				Create your own <i className='fas fa-magic' />
			</a>
		</div>
	);
};

module.exports = HomePage;
