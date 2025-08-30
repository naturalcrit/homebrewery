require('./editPage.less');
const React = require('react');
const _ = require('lodash');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../../navbar/navbar.jsx');
const NewBrewItem = require('../../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../../navbar/help.navitem.jsx');
const PrintNavItem = require('../../../navbar/print.navitem.jsx');
const ErrorNavItem = require('../../../navbar/error-navitem.jsx');
const AccountNavItem = require('../../../navbar/account.navitem.jsx');
const RecentNavItem = require('../../../navbar/recent.navitem.jsx').both;
const VaultNavItem = require('../../../navbar/vault.navitem.jsx');

const SplitPane = require('client/components/splitPane/splitPane.jsx');
const Editor = require('../../../editor/editor.jsx');
const BrewRenderer = require('../../../brewRenderer/brewRenderer.jsx');

const { fetchThemeBundle } = require('../../../../../shared/helpers.js');

import { useEffect, useState, useRef } from 'react';
import Markdown from 'naturalcrit/markdown.js';

const BREWKEY  = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY  = 'homebrewery-new-meta';
const SAVEKEY  = `HOMEBREWERY-DEFAULT-SAVE-LOCATION-${global.account?.username || ''}`;

const SAVE_TIMEOUT = 10000;

const BaseEditPage = (props)=>{
  const [brew,                       setBrew]                       = useState(() => props.brew);
	const [savedBrew,                  setSavedBrew]                  = useState(brew);
  const [isSaving,                   setIsSaving]                   = useState(false);
	const [lastSavedTime,              setLastSavedTime]              = useState(new Date());
	const [saveGoogle,                 setSaveGoogle]                 = useState(() => (global.account?.googleId ? true : false));
  const [welcomeText,                setWelcomeText]                = useState(() => props.brew?.text ?? '');
  const [error,                      setError]                      = useState(undefined);
	const [htmlErrors,                 setHTMLErrors]                 = useState(Markdown.validate(props.brew.text));
  const [currentEditorViewPageNum,   setCurrentEditorViewPageNum]   = useState(1);
  const [currentEditorCursorPageNum, setCurrentEditorCursorPageNum] = useState(1);
  const [currentBrewRendererPageNum, setCurrentBrewRendererPageNum] = useState(1);
  const [themeBundle,                setThemeBundle]                = useState({});
	const [unsavedChanges,             setUnsavedChanges]             = useState(false);
	const [autoSaveEnabled,            setAutoSaveEnabled]            = useState(true);
	const [warnUnsavedChanges,         setWarnUnsavedChanges]         = useState(false);

	const editorRef     = useRef(null);
	let   lastSavedBrew = useRef(JSON.parse(JSON.stringify(this.propcopys.brew))); //Deep copy
	const saveTimeout   = useRef(null);
	const unsavedChangesTimer = useRef(null);

	const handleSplitMove = ()=>{
		editorRef.current.update();
	};

	const handleEditorViewPageChange = (pageNumber)=>{
		setCurrentEditorViewPageNum(pageNumber);
	};
	
	const handleEditorCursorPageChange = (pageNumber)=>{
		setCurrentEditorCursorPageNum(pageNumber);
	};
	
	const handleBrewRendererPageChange	 = (pageNumber)=>{
		setCurrentBrewRendererPageNum(pageNumber);
	};

	const handleTextChange = (text)=>{
		//If there are HTML errors, run the validator on every change to give quick feedback
		if(htmlErrors.length)
			htmlErrors = Markdown.validate(text);

		setHTMLErrors(htmlErrors);
		setBrew((prevBrew) => ({ ...prevBrew, text }));

		// TODO: ONLY ON /NEW PAGE
		localStorage.setItem(BREWKEY, text);
	};

	const handleStyleChange = (style)=>{
		setBrew((prevBrew) => ({ ...prevBrew, style }));

		if(props.useLocalStorage)
			localStorage.setItem(STYLEKEY, style);
	};

	const handleSnipChange = (snippet)=>{
		//If there are HTML errors, run the validator on every change to give quick feedback
		if(htmlErrors.length)
			htmlErrors = Markdown.validate(text);

		setHTMLErrors(htmlErrors);
		setBrew((prevBrew) => ({ ...prevBrew, snippets: snippet }));
	};

	const handleMetaChange = (metadata, field=undefined)=>{
		if(field == 'theme' || field == 'renderer')	// Fetch theme bundle only if theme or renderer was changed
			fetchThemeBundle(setError, setThemeBundle, metadata.renderer, metadata.theme);

		setBrew((prevBrew) => ({ ...prevBrew, ...metadata }));

		if(props.useLocalStorage)
			localStorage.setItem(METAKEY, JSON.stringify({
				'renderer' : metadata.renderer,
				'theme'    : metadata.theme,
				'lang'     : metadata.lang
			}));
	};

	const updateBrew = (newData) => {
		setBrew(prevBrew => ({	//TODO: May be able to just directly use setBrew instead of a wrapper, if its safe to assume we want all the data from newData
			...prevBrew,					//OR:  Somehow combine handleTextChange, handleStyleChange, handleMetaChange, and handleSnipChange into one function that calls this
			style: newData.style,
			text: newData.text,
			snippets: newData.snippets
		}));
	};
		
	const clearError = ()=>{
		setError(null);
		setIsSaving(false);
	};

	const save = async (immediate=false)=>{
		if(isSaving) return;
		if(!unsavedChanges && !immediate) return;

		clearTimeout(saveTimeout.current);

		const timeout = immediate ? 0 : 10000;

		saveTimeout.current = setTimeout(async () => {
			setIsSaving(true);
			await props.performSave(brew, saveGoogle)
			.catch((err)=>{
				setError(err);
			});
			setIsSaving(false);
			setLastSavedTime(new Date());
			setTimeout(setWarnUnsavedChanges(true), 900000); // 15 minutes between unsaved work warnings
		}, timeout);
	};

	const handleControlKeys = (e)=>{
		if(!(e.ctrlKey || e.metaKey)) return;
		const S_KEY = 83;
		const P_KEY = 80;
		if(e.keyCode == S_KEY) save();
		if(e.keyCode == P_KEY) BrewRenderer.printCurrentBrew();
		if(e.keyCode == P_KEY || e.keyCode == S_KEY){
			e.stopPropagation();
			e.preventDefault();
		}
	};

	const	hasChanges =()=>{
		return !_.isEqual(brew, savedBrew);
	};

	useEffect(() => {
		props.loadBrew?.(brew, setBrew, setSaveGoogle);  //Initial load from localStorage/etc.

		//Load settings
		setAutoSaveEnabled(JSON.parse(localStorage.getItem('AUTOSAVE_ON')) ?? true);

		setHTMLErrors(Markdown.validate(brew.text));

		document.addEventListener('keydown', handleControlKeys);
		window.onbeforeunload = ()=>{
			if(isSaving || unsavedChanges)
				return 'You have unsaved changes!';
		};

		return () => {
			document.removeEventListener('keydown', handleControlKeys);
			window.onbeforeunload = null;
		}
	}, []);

	useEffect(() => {
		fetchThemeBundle(setError, setThemeBundle, brew.renderer, brew.theme);
	}, [brew.renderer, brew.theme]);

	useEffect(() => {
		const hasChange = hasChanges();
		if(unsavedChanges !== hasChange)
			setUnsavedChanges(hasChange);

		if(autoSaveEnabled) save();
	}, [brew]);

	const resetUnsavedChangesWarning = ()=>{
		setTimeout(setWarnUnsavedChanges(false), 4000);  // Display warning for 4 seconds
		setTimeout(setWarnUnsavedChanges(true) , 90000); // 15 minutes between warnings
	};

	const toggleAutoSave = ()=>{
		if(unsavedChangesTimer.current) clearTimeout(unsavedChangesTimer.current);
		localStorage.setItem('AUTOSAVE_ON', JSON.stringify(!autoSaveEnabled));
		setAutoSaveEnabled(!autoSaveEnabled);
		setWarnUnsavedChanges(false);
	};

	const renderSaveButton = ()=>{
		// #1 - Currently saving, show SAVING
		if(isSaving)
			return <Nav.item className='save' icon='fas fa-spinner fa-spin'>saving...</Nav.item>;

		// #2 - Unsaved changes exist, autosave is OFF and warning timer has expired, show AUTOSAVE WARNING
		if(unsavedChanges && warnUnsavedChanges){
			resetUnsavedChangesWarning();
			const elapsedTime = Math.round((new Date() - lastSavedTime) / 1000 / 60);
			const text = elapsedTime == 0 ? 'Autosave is OFF.' : `Autosave is OFF, and you haven't saved for ${elapsedTime} minutes.`;

			return <Nav.item className='save error' icon='fas fa-exclamation-circle'>
							Reminder...
							<div className='errorContainer'>{text}</div>
						</Nav.item>;
		}

		// #3 - Unsaved changes exist, click to save, show SAVE NOW
		if(unsavedChanges)
			return <Nav.item className='save' onClick={()=>save(true)} color='blue' icon='fas fa-save'>Save Now</Nav.item>;

		// #4 - No unsaved changes, autosave is ON, show AUTO-SAVED
		if(autoSaveEnabled)
			return <Nav.item className='save saved'>auto-saved.</Nav.item>;

		// DEFAULT - No unsaved changes, show SAVED
		return <Nav.item className='save saved'>saved.</Nav.item>;
	};

	const renderAutoSaveButton = ()=>{
		return <Nav.item onClick={toggleAutoSave}>
						Autosave <i className={autosaveEnabled ? 'fas fa-power-off active' : 'fas fa-power-off'}></i>
					</Nav.item>;
	};

	return (
		<div className={`sitePage ${props.className || ''}`}>
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{props.brew.title}</Nav.item>
				</Nav.section>
				<Nav.section>
					{error
						? <ErrorNavItem error={error} clearError={clearError}></ErrorNavItem>
						: <Nav.dropdown className='save-menu'>
								{renderSaveButton()}
								{renderAutoSaveButton()}
							</Nav.dropdown>
					}
					{props.renderUniqueNav?.()}
				</Nav.section>
				<Nav.section>
					<PrintNavItem />
					<NewBrewItem />
					<HelpNavItem />
					<VaultNavItem />
					<RecentNavItem brew={props.brew} storageKey={props.recentStorageKey} />
					<AccountNavItem />
				</Nav.section>
			</Navbar>

			<div className='content'>
				<SplitPane onDragFinish={handleSplitMove}>
					<Editor
						ref={editorRef}
						brew={brew}
						onTextChange={handleTextChange}
						onStyleChange={handleStyleChange}
						onMetaChange={handleMetaChange}
						onSnipChange={handleSnipChange}
						reportError={this.errorReported}
						renderer={brew.renderer}
						showEditButtons={false}  //FALSE FOR HOME PAGE
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
						text={brew.text}
						style={brew.style}
						renderer={brew.renderer}
						theme={brew.theme}
						errors={htmlErrors}
						lang={brew.lang}
						onPageChange={handleBrewRendererPageChange}
						currentEditorViewPageNum={currentEditorViewPageNum}
						currentEditorCursorPageNum={currentEditorCursorPageNum}
						currentBrewRendererPageNum={currentBrewRendererPageNum}
						themeBundle={themeBundle}
						allowPrint={true} // FALSE FOR HOME PAGE
					/>
				</SplitPane>
			</div>

			{props.children?.(welcomeText, brew, save)}
		</div>
	);	
};

module.exports = BaseEditPage;
