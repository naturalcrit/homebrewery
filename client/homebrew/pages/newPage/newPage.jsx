/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
import './newPage.less';

import React, { useState, useEffect, useRef } from 'react';
import request                                from '../../utils/request-middleware.js';
import Markdown                               from 'naturalcrit/markdown.js';

import Nav                       from 'naturalcrit/nav/nav.jsx';
import Navbar                    from '../../navbar/navbar.jsx';
import AccountNavItem            from '../../navbar/account.navitem.jsx';
import ErrorNavItem              from '../../navbar/error-navitem.jsx';
import HelpNavItem               from '../../navbar/help.navitem.jsx';
import PrintNavItem              from '../../navbar/print.navitem.jsx';
import { both as RecentNavItem } from '../../navbar/recent.navitem.jsx';

import SplitPane    from 'client/components/splitPane/splitPane.jsx';
import Editor       from '../../editor/editor.jsx';
import BrewRenderer from '../../brewRenderer/brewRenderer.jsx';

import { DEFAULT_BREW }                       from '../../../../server/brewDefaults.js';
import { printCurrentBrew, fetchThemeBundle, splitTextStyleAndMetadata } from '../../../../shared/helpers.js';

const BREWKEY  = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY  = 'homebrewery-new-meta';
const SAVEKEY  = `HOMEBREWERY-DEFAULT-SAVE-LOCATION-${global.account?.username || ''}`;

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
		document.addEventListener('keydown', handleControlKeys);
		loadBrew();
		fetchThemeBundle(setError, setThemeBundle, currentBrew.renderer, currentBrew.theme);

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

	const handleControlKeys = (e) => {
		if (!(e.ctrlKey || e.metaKey)) return;
		const S_KEY = 83;
		const P_KEY = 80;
		if (e.keyCode === S_KEY) save();
		if (e.keyCode === P_KEY) printCurrentBrew();
		if (e.keyCode === S_KEY || e.keyCode === P_KEY) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	const handleSplitMove = ()=>{
		editorRef.current.update();
	};

	const handleEditorViewPageChange = (pageNumber)=>{
		setCurrentEditorViewPageNum(pageNumber);
	};
	
	const handleEditorCursorPageChange = (pageNumber)=>{
		setCurrentEditorCursorPageNum(pageNumber);
	};
	
	const handleBrewRendererPageChange = (pageNumber)=>{
		setCurrentBrewRendererPageNum(pageNumber);
	};

	const handleTextChange = (text)=>{
		//If there are HTML errors, run the validator on every change to give quick feedback
		if(HTMLErrors.length)
			HTMLErrors = Markdown.validate(text);

		setHTMLErrors(HTMLErrors);
		setCurrentBrew((prevBrew) => ({ ...prevBrew, text }));
		localStorage.setItem(BREWKEY, text);
	};

	const handleStyleChange = (style) => {
		setCurrentBrew(prevBrew => ({ ...prevBrew, style }));
		localStorage.setItem(STYLEKEY, style);
	};

	const handleSnipChange = (snippet)=>{
		//If there are HTML errors, run the validator on every change to give quick feedback
		if(HTMLErrors.length)
			HTMLErrors = Markdown.validate(snippet);

		setHTMLErrors(HTMLErrors);
		setCurrentBrew((prevBrew) => ({ ...prevBrew, snippets: snippet }));
	};

	const handleMetaChange = (metadata, field = undefined) => {
		if (field === 'theme' || field === 'renderer')
			fetchThemeBundle(setError, setThemeBundle, metadata.renderer, metadata.theme);

		setCurrentBrew(prev => ({ ...prev, ...metadata }));
		localStorage.setItem(METAKEY, JSON.stringify({
			renderer : metadata.renderer,
			theme    : metadata.theme,
			lang     : metadata.lang
		}));
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
				<PrintNavItem />
				<HelpNavItem />
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
						onTextChange={handleTextChange}
						onStyleChange={handleStyleChange}
						onMetaChange={handleMetaChange}
						onSnipChange={handleSnipChange}
						renderer={currentBrew.renderer}
						userThemes={props.userThemes}
						themeBundle={themeBundle}
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

module.exports = NewPage;
