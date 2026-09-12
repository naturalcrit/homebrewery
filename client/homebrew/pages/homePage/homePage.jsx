
import './homePage.less';

// Common imports
import React, { useState, useEffect, useRef, useEffectEvent } from 'react';
import request                                from '../../utils/request-middleware.js';
import { hbfm } from 'hbmarkedwrapper';
import _                                      from 'lodash';

import { DEFAULT_BREW }                       from '../../../../server/brewDefaults.js';

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
import Headtags   from '@vitreum/headtags.js';
const Meta = Headtags.Meta;

const SAVE_TIMEOUT = 10000;
const UNSAVED_WARNING_TIMEOUT = 900000; //Warn user afer 15 minutes of unsaved changes
const UNSAVED_WARNING_POPUP_TIMEOUT = 4000; //Show the warning for 4 seconds

const BREWKEY  = 'HB_newPage_content';
const STYLEKEY = 'HB_newPage_style';
const SNIPKEY  = 'HB_newPage_snippets';
const METAKEY  = 'HB_newPage_meta';

const useLocalStorage = false;
const sandbox         = true;

const HomePage =(props)=>{
	props = {
		brew : DEFAULT_BREW,
		...props
	};

	const [currentBrew, setCurrentBrew]                = useState(props.brew);
	const [error, setError]                      = useState(undefined);
	const [HTMLErrors, setHTMLErrors]                 = useState(hbfm.validate(props.brew.text));
	const [currentEditorViewPageNum, setCurrentEditorViewPageNum]   = useState(1);
	const [currentEditorCursorPageNum, setCurrentEditorCursorPageNum] = useState(1);
	const [currentBrewRendererPageNum, setCurrentBrewRendererPageNum] = useState(1);
	const [themeBundle, setThemeBundle]                = useState({});
	const [unsavedChanges, setUnsavedChanges]             = useState(false);
	const [isSaving, setIsSaving]                   = useState(false);
	const [lastSavedTime, setLastSavedTime] = useState(new Date());
	const [autoSaveEnabled, setAutoSaveEnabled]             = useState(false);
	const [warnUnsavedChanges, setWarnUnsavedChanges] = useState(true);

	const editorRef         = useRef(null);
	const lastSavedBrew     = useRef(_.cloneDeep(props.brew));
	const warnUnsavedTimeout = useRef(null);
	const unsavedChangesRef = useRef(unsavedChanges);

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

	const handleSplitMove = ()=>{
		editorRef.current.update();
	};

	const resetWarnUnsavedTimer = ()=>{
		setTimeout(()=>setWarnUnsavedChanges(false), UNSAVED_WARNING_POPUP_TIMEOUT); // Hide the warning after 4 seconds
		clearTimeout(warnUnsavedTimeout.current);
		warnUnsavedTimeout.current = setTimeout(()=>setWarnUnsavedChanges(true), UNSAVED_WARNING_TIMEOUT); // 15 minutes between unsaved work warnings
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
			return <Nav.item className='save' onClick={save} color='blue' icon='fas fa-save'>save now</Nav.item>;

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
		unsavedChangesRef,
		setUnsavedChanges,
		sandbox,
		lastSavedBrew
	});

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

export default HomePage;
