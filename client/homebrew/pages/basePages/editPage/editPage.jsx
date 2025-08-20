require('./editPage.less');
const React = require('react');

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

const BaseEditPage = (props)=>{
  const [brew,                       setBrew]                       = useState(() => props.brew);
  const [isSaving,                   setIsSaving]                   = useState(false);
	const [saveGoogle,                 setSaveGoogle]                 = useState(() => (global.account?.googleId ? true : false));
  const [welcomeText,                setWelcomeText]                = useState(() => props.brew?.text ?? '');
  const [error,                      setError]                      = useState(undefined);
	const [htmlErrors,                 setHTMLErrors]                 = useState(Markdown.validate(props.brew.text));
  const [currentEditorViewPageNum,   setCurrentEditorViewPageNum]   = useState(1);
  const [currentEditorCursorPageNum, setCurrentEditorCursorPageNum] = useState(1);
  const [currentBrewRendererPageNum, setCurrentBrewRendererPageNum] = useState(1);
  const [themeBundle,                setThemeBundle]                = useState({});

	const editorRef = useRef(null);

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
	
	const clearError = ()=>{
		setError(null);
		setIsSaving(false);
	};

	const save = async ()=>{
		setIsSaving(true);
		await props.performSave(brew, saveGoogle)
		.catch((err)=>{
			setError(err);
		});
		setIsSaving(false)
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

	useEffect(() => {
		props.loadBrew?.(brew, setBrew, setSaveGoogle);  //Initial load from localStorage/etc.

		document.addEventListener('keydown', handleControlKeys);
		return document.removeEventListener('keydown', handleControlKeys);
	}, []);

	useEffect(() => {
		fetchThemeBundle(setError, setThemeBundle, brew.renderer, brew.theme);
	}, [brew.renderer, brew.theme]);

	return (
		<div className={`sitePage ${props.className || ''}`}>
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{props.brew.title}</Nav.item>
				</Nav.section>
				<Nav.section>
					{error
						? <ErrorNavItem error={error} clearError={clearError}></ErrorNavItem>
						: props.saveButton?.(save, isSaving)
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
						renderer={brew.renderer}
						showEditButtons={false}  //FALSE FOR HOME PAGE
						userThemes={props.userThemes}
						themeBundle={themeBundle}
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

			{props.children?.(welcomeText, brew.text, save)}
		</div>
	);	
};

module.exports = BaseEditPage;
