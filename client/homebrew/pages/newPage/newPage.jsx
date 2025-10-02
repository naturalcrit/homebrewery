/* eslint-disable max-lines */
import './newPage.less';

// Common imports
import React, { useState, useEffect, useRef } from 'react';
import request                                from '../../utils/request-middleware.js';
import Markdown                               from 'naturalcrit/markdown.js';

import { DEFAULT_BREW }                       from '../../../../server/brewDefaults.js';
import { printCurrentBrew, fetchThemeBundle, splitTextStyleAndMetadata } from '../../../../shared/helpers.js';

import SplitPane    from 'client/components/splitPane/splitPane.jsx';
import Editor       from '../../editor/editor.jsx';
import BrewRenderer from '../../brewRenderer/brewRenderer.jsx';

import Nav                       from 'naturalcrit/nav/nav.jsx';
import Navbar                    from '../../navbar/navbar.jsx';
import NewBrewItem               from '../../navbar/newbrew.navitem.jsx';
import AccountNavItem            from '../../navbar/account.navitem.jsx';
import ErrorNavItem              from '../../navbar/error-navitem.jsx';
import HelpNavItem               from '../../navbar/help.navitem.jsx';
import VaultNavItem              from '../../navbar/vault.navitem.jsx';
import PrintNavItem              from '../../navbar/print.navitem.jsx';
import { both as RecentNavItem } from '../../navbar/recent.navitem.jsx';

// Page specific imports
import { Meta }                  from 'vitreum/headtags';

const BREWKEY  = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const SNIPKEY  = 'homebrewery-new-snippets';
const METAKEY  = 'homebrewery-new-meta';
const SAVEKEYPREFIX  = 'HOMEBREWERY-DEFAULT-SAVE-LOCATION-';

const useLocalStorage = true;

const NewPage = (props) => {
	props = {
		brew: DEFAULT_BREW,
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

	const editorRef = useRef(null);

	useEffect(() => {
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

		return () => {
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
		setSaveGoogle(saveStorage == 'GOOGLE-DRIVE' && saveGoogle);

		localStorage.setItem(BREWKEY, brew.text);
		if(brew.style)
			localStorage.setItem(STYLEKEY, brew.style);
		localStorage.setItem(METAKEY, JSON.stringify({ renderer: brew.renderer, theme: brew.theme, lang: brew.lang }));
		if(window.location.pathname !== '/new')
			window.history.replaceState({}, window.location.title, '/new/');
	};

	const handleSplitMove = ()=>{
		editorRef.current.update();
	};

	const handleBrewChange = (field) => (value, subfield) => {	//'text', 'style', 'snippets', 'metadata'
		if (subfield == 'renderer' || subfield == 'theme')
			fetchThemeBundle(setError, setThemeBundle, value.renderer, value.theme);

		//If there are HTML errors, run the validator on every change to give quick feedback
		if(HTMLErrors.length && (field == 'text' || field == 'snippets'))
			setHTMLErrors(Markdown.validate(value));

		if(field == 'metadata') setCurrentBrew(prev => ({ ...prev, ...value }));
		else                    setCurrentBrew(prev => ({ ...prev, [field]: value }));

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

	const save = async () => {
  	setIsSaving(true);

		let updatedBrew = { ...currentBrew };
		splitTextStyleAndMetadata(updatedBrew);

		const pageRegex = updatedBrew.renderer === 'legacy' ? /\\page/g : /^\\page$/gm;
		updatedBrew.pageCount = (updatedBrew.text.match(pageRegex) || []).length + 1;

		const res = await request
			.post(`/api${saveGoogle ? '?saveToGoogle=true' : ''}`)
			.send(updatedBrew)
			.catch((err) => {
				setIsSaving(false);
				setError(err);
			});

		setIsSaving(false)
		if (!res) return;

		const savedBrew = res.body;

		localStorage.removeItem(BREWKEY);
		localStorage.removeItem(STYLEKEY);
		localStorage.removeItem(METAKEY);
		window.location = `/edit/${savedBrew.editId}`;
	};

	const renderSaveButton = ()=>{
		if(isSaving){
			return <Nav.item icon='fas fa-spinner fa-spin' className='save'>
				save...
			</Nav.item>;
		} else {
			return <Nav.item icon='fas fa-save' className='save' onClick={save}>
				save
			</Nav.item>;
		}
	};

	const clearError = ()=>{
		setError(null);
		setIsSaving(false);
	};

	const renderNavbar = () => (
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
