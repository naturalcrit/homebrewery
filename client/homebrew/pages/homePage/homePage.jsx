
import './homePage.less';

// Common imports
import React, { useState, useEffect, useRef, useEffectEvent } from 'react';
import request                                from '../../utils/request-middleware.js';
import { hbfm } from 'marked-hbfm';
import _                                      from 'lodash';

import { DEFAULT_BREW }                       from '../../../../server/brewDefaults.js';

import useCommonEditPageFunctions from '../../utils/commonEditPageFunctions.jsx'

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
	const [saveGoogle, setSaveGoogle] = useState(global.account?.googleId ? true : false);
	const [error, setError]                      = useState(undefined);
	const [HTMLErrors, setHTMLErrors]                 = useState(hbfm.validate(props.brew.text));
	const [currentEditorViewPageNum, setCurrentEditorViewPageNum]   = useState(1);
	const [currentEditorCursorPageNum, setCurrentEditorCursorPageNum] = useState(1);
	const [currentBrewRendererPageNum, setCurrentBrewRendererPageNum] = useState(1);
	const [themeBundle, setThemeBundle]                = useState({});

	const editorRef          = useRef(null);
	const lastSavedBrew      = useRef(_.cloneDeep(props.brew));

	const save = async (brew, saveToGoogle)=>{
		const res = await request
			.post(`/api${saveGoogle ? '?saveToGoogle=true' : ''}`)
			.send(brew)
			.catch((err)=>{
				console.error('Error Updating Local Brew');
				setError(err);
			});
		if(!res) return;

		const saved = res.body;
		window.onbeforeunload = null;
		window.location = `/edit/${saved.editId}`;
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
		handleSplitMove,
		handleBrewChange,
		clearError,
		renderSaveButton,
		unsavedChanges,
		trySave
	} = useCommonEditPageFunctions({
		saveGoogle,
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
		sandbox,
		lastSavedBrew,
		editorRef,
		save,
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
						themeBundle={themeBundle}
						onPageChange={setCurrentBrewRendererPageNum}
						currentEditorCursorPageNum={currentEditorCursorPageNum}
					/>
				</SplitPane>
			</div>
			<div className={`floatingSaveButton${unsavedChanges ? ' show' : ''}`} onClick={()=>trySave(true, true, saveGoogle)}>
				Save current <i className='fas fa-save' />
			</div>

			<a href='/new' className='floatingNewButton'>
				Create your own <i className='fas fa-magic' />
			</a>
		</div>
	);
};

export default HomePage;
