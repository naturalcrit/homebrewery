import './homePage.less';

import React                           from 'react';
import { useEffect, useState, useRef } from 'react';
import request                         from '../../utils/request-middleware.js';
import { Meta }                        from 'vitreum/headtags';

import Nav                             from 'naturalcrit/nav/nav.jsx';
import Navbar                          from '../../navbar/navbar.jsx';
import NewBrewItem                     from '../../navbar/newbrew.navitem.jsx';
import HelpNavItem                     from '../../navbar/help.navitem.jsx';
import VaultNavItem                    from '../../navbar/vault.navitem.jsx';
import { both as RecentNavItem }       from '../../navbar/recent.navitem.jsx';
import AccountNavItem                  from '../../navbar/account.navitem.jsx';
import ErrorNavItem                    from '../../navbar/error-navitem.jsx';
import { fetchThemeBundle }            from '../../../../shared/helpers.js';

import SplitPane                       from 'client/components/splitPane/splitPane.jsx';
import Editor                          from '../../editor/editor.jsx';
import BrewRenderer                    from '../../brewRenderer/brewRenderer.jsx';

import { DEFAULT_BREW }                from '../../../../server/brewDefaults.js';

const HomePage =(props)=>{
	props = {
		brew : DEFAULT_BREW,
		ver  : '0.0.0',
    ...props
  };

	const [brew                      , setBrew]                       = useState(props.brew);
	const [welcomeText               , setWelcomeText]                = useState(props.brew.text);
	const [error                     , setError]                      = useState(undefined);
	const [currentEditorViewPageNum  , setCurrentEditorViewPageNum]   = useState(1);
	const [currentEditorCursorPageNum, setCurrentEditorCursorPageNum] = useState(1);
	const [currentBrewRendererPageNum, setCurrentBrewRendererPageNum] = useState(1);
	const [themeBundle               , setThemeBundle]                = useState({});
	const [isSaving                  , setIsSaving]                   = useState(false);

	const editorRef = useRef(null);

	useEffect(()=>{
		fetchThemeBundle(setError, setThemeBundle, brew.renderer, brew.theme);
	}, []);

	const save = ()=>{
		request.post('/api')
			.send(brew)
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
		setBrew((prevBrew) => ({ ...prevBrew, text }));
	};

	const clearError = ()=>{
		setError(null);
		setIsSaving(false);
	};

	const renderNavbar = ()=>{
		return <Navbar ver={props.ver}>
			<Nav.section>
				{error ?
					<ErrorNavItem error={error} clearError={clearError}></ErrorNavItem> :
					null
				}
				<NewBrewItem />
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
						brew={brew}
						onTextChange={handleTextChange}
						renderer={brew.renderer}
						showEditButtons={false}
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
						onPageChange={handleBrewRendererPageChange}
						currentEditorViewPageNum={currentEditorViewPageNum}
						currentEditorCursorPageNum={currentEditorCursorPageNum}
						currentBrewRendererPageNum={currentBrewRendererPageNum}
						themeBundle={themeBundle}
					/>
				</SplitPane>
			</div>
			<div className={`floatingSaveButton${welcomeText !== brew.text ? ' show' : ''}`} onClick={save}>
				Save current <i className='fas fa-save' />
			</div>

			<a href='/new' className='floatingNewButton'>
				Create your own <i className='fas fa-magic' />
			</a>
		</div>
	)
};

module.exports = HomePage;
