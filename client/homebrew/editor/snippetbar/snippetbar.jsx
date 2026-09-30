/*eslint max-lines: ["warn", {"max": 350, "skipBlankLines": true, "skipComments": true}]*/
import './snippetbar.less';
import React, { useState, useEffect} from 'react';
import { Dropdown } from '@components/dropdown/dropdown.jsx';

import _ from 'lodash';
import cx from 'classnames';

import { loadHistory } from '../../utils/versionHistory.js';
import { brewSnippetsToJSON } from '@shared/helpers.js';

/*eslint-disable camelcase*/
import Legacy5ePHB from '@themes/Legacy/5ePHB/snippets.js';
import V3_5ePHB   from '@themes/V3/5ePHB/snippets.js';
import V3_5eDMG   from '@themes/V3/5eDMG/snippets.js';
import V3_Journal from '@themes/V3/Journal/snippets.js';
import V3_Blank  from '@themes/V3/Blank/snippets.js';

const ThemeSnippets = {
	Legacy_5ePHB : Legacy5ePHB,
	V3_5ePHB     : V3_5ePHB,
	V3_5eDMG     : V3_5eDMG,
	V3_Journal   : V3_Journal,
	V3_Blank     : V3_Blank,
};
/*eslint-enable camelcase */

const execute = function(val, props){
	if(_.isFunction(val)) return val(props);
	return val;
};

const SnippetBar = ({
	brew            = {},
	view            = 'text',
	onViewChange    = ()=>{},
	onInject        = ()=>{},
	onToggle        = ()=>{},
	showEditButtons = true,
	renderer        = 'legacy',
	undo            = ()=>{},
	redo            = ()=>{},
	historySize     = ()=>{},
	foldCode        = ()=>{},
	unfoldCode      = ()=>{},
	formatCode      = ()=>{},
	cursorPos       = {},
	themeBundle     = [],
	updateBrew      = ()=>{}
})=>{
	const [snippets, setSnippets] = useState([]);
	const [showHistory, setShowHistory] = useState(false);
	const [historyExists, setHistoryExists] = useState(false);
	const [historyItems, setHistoryItems] = useState([]);

	useEffect(()=>{
		setSnippets(compileSnippets());
	}, []);

	const mergeCustomizer = (oldValue, newValue, key)=>{
		if(key == 'snippets') {
			const result = _.reverse(_.unionBy(_.reverse(newValue), _.reverse(oldValue), 'name')); // Join snippets together, with preference for the child theme over the parent theme
			return result.filter((snip)=>snip.gen || snip.subsnippets);
		};
	};
	const compileSnippets = ()=>{
		let compiledSnippets = [];

		let oldSnippets = _.keyBy(compiledSnippets, 'groupName');

		if(themeBundle.snippets) {
			for (let snippets of themeBundle.snippets) {
				if(typeof(snippets) == 'string')	// load staticThemes as needed; they were sent as just a file name
					snippets = ThemeSnippets[snippets];

				const newSnippets = _.keyBy(_.cloneDeep(snippets), 'groupName');
				compiledSnippets = _.values(_.mergeWith(oldSnippets, newSnippets, mergeCustomizer));

				oldSnippets = _.keyBy(compiledSnippets, 'groupName');
			}
		}

		const userSnippetsasJSON = brewSnippetsToJSON(brew.title || 'New Document', brew.snippets, themeBundle.snippets);
		compiledSnippets.push(userSnippetsasJSON);

		return compiledSnippets;
	};

	useEffect(()=>{
		setSnippets(compileSnippets());
	}, [renderer, themeBundle, brew.snippets]);

	useEffect(()=>{
		const updateHistory = async ()=>{
			// Update history list if it has changed
			const checkHistoryItems = await loadHistory(brew);

			// If all items have the noData property, there is no saved data
			const checkHistoryExists = !checkHistoryItems.every(
				(historyItem)=>historyItem?.noData
			);

			if(historyExists !== checkHistoryExists) {
				setHistoryExists(checkHistoryExists);
			}

			// If any history items have changed, update the list
			if(!_.isEqual(checkHistoryItems, historyItems)) {
				setHistoryItems(checkHistoryItems);
			}
		};

		updateHistory();
	}, [brew]);

	const handleSnippetClick = (injectedText)=>onInject(injectedText);

	const renderSnippetGroups = ()=>{
		const currentSnippets = snippets.filter((snippetGroup)=>snippetGroup.view === view);
		if(currentSnippets.length === 0) return null;

		return <ul className='snippets' role='menubar' aria-label='Snippets Menubar'>
			{_.map(currentSnippets, (snippetGroup)=>{
				return <SnippetGroup
					brew={brew}
					groupName={snippetGroup.groupName}
					icon={snippetGroup.icon}
					snippets={snippetGroup.snippets}
					key={snippetGroup.groupName}
					onSnippetClick={handleSnippetClick}
					cursorPos={cursorPos}
				/>;
			})
			}
		</ul>;
	};

	const replaceContent = (item)=>{
		return updateBrew(item);
	};

	const toggleHistoryMenu = ()=>setShowHistory(!showHistory);

	const renderHistoryItems = ()=>{
		if(!historyExists) return;

		return <div className='dropdown'>
			{_.map(historyItems, (item, index)=>{
				if(item.noData || !item.savedAt) return;

				const saveTime = new Date(item.savedAt);
				const diffMs = new Date() - saveTime;
				const diffSecs = Math.floor(diffMs / 1000);

				let diffString = `about ${diffSecs} seconds ago`;

				if(diffSecs > 60) diffString = `about ${Math.floor(diffSecs / 60)} minutes ago`;
				if(diffSecs > (60 * 60)) diffString = `about ${Math.floor(diffSecs / (60 * 60))} hours ago`;
				if(diffSecs > (24 * 60 * 60)) diffString = `about ${Math.floor(diffSecs / (24 * 60 * 60))} days ago`;
				if(diffSecs > (7 * 24 * 60 * 60)) diffString = `about ${Math.floor(diffSecs / (7 * 24 * 60 * 60))} weeks ago`;

				return <div className='snippet' key={index} onClick={()=>{replaceContent(item);}} >
					<i className={`fas fa-${index+1}`} />
					<span className='name' title={saveTime.toISOString()}>v{item.version} : {diffString}</span>
				</div>;
			})}
		</div>;
	};


	const renderEditorButtons =()=>{
		if(!showEditButtons) return;

		return (
			<div className='editors'>
				{view !== 'meta' && view !== 'settings' && <><div className='historyTools'>
					<button className={`editorTool snippetGroup history ${historyExists ? 'active' : ''}`}
						onClick={toggleHistoryMenu} >
						<i className='fas fa-clock-rotate-left' />
						{ showHistory && renderHistoryItems() }
					</button>
					<button className={`editorTool undo ${historySize.done ? 'active' : ''}`}
						onClick={undo} >
						<i className='fas fa-undo' />
					</button>
					<button className={`editorTool redo ${historySize.undone ? 'active' : ''}`}
						onClick={redo} >
						<i className='fas fa-redo' />
					</button>
				</div>
				<div className='codeTools'>
					<button className={`editorTool foldAll ${foldCode ? 'active' : ''}`}
						onClick={foldCode} >
						<i className='fas fa-compress-alt' />
					</button>
					<button className={`editorTool unfoldAll ${unfoldCode ? 'active' : ''}`}
						onClick={unfoldCode} >
						<i className='fas fa-expand-alt' />
					</button>
					<button className={`editorTool formatCode ${formatCode ? 'active' : ''}`}
						onClick={formatCode} >
						<i className='fas fa-wand-magic-sparkles' />
					</button>
				</div></>}

				<div className='tabs'>
					<button className={cx('text', { selected: view === 'text' })}
						onClick={()=>onViewChange('text')}>
						<i className='fa fa-beer' />
					</button>
					<button className={cx('style', { selected: view === 'style' })}
						onClick={()=>onViewChange('style')}>
						<i className='fa fa-paint-brush' />
					</button>
					<button className={cx('snippet', { selected: view === 'snippet' })}
						onClick={()=>onViewChange('snippet')}>
						<i className='fas fa-th-list' />
					</button>
					<button className={cx('meta', { selected: view === 'meta' })}
						onClick={()=>onViewChange('meta')}>
						<i className='fas fa-info-circle' />
					</button>
					<button className={cx('settings', { selected: view === 'settings' })}
						onClick={()=>onViewChange('settings')}>
						<i className='fas fa-gear' />
					</button>
				</div>

			</div>
		);
	};

	return <div className='snippetBar'>
		{renderSnippetGroups()}
		{renderEditorButtons()}
	</div>;
};

export default SnippetBar;

const SnippetGroup = (props)=>{
	const {
		brew           = {},
		groupName      = '',
		icon           = 'fas fa-rocket',
		snippets       = [],
		onSnippetClick = function(){},
	} = props;

	const handleSnippetClick = (e, snippet)=>{
		onSnippetClick(execute(snippet.gen, props));
	};
	const renderSnippets = (snippets)=>{
		return _.map(snippets, (snippet)=>{
			if(!snippet.subsnippets){
				return (
					<li key={snippet.name} role='none'>
						<button className='menu-item'  onClick={(e)=>handleSnippetClick(e, snippet)} role='menuitem' aria-label={snippet.name} disabled={snippet.disabled}>
							<i className={snippet.icon} />
							<span className={`name${snippet.disabled ? ' disabled' : ''}`} title={snippet.name}>{snippet.name}</span>
							{snippet.experimental && <span className='status'>beta</span>}
							{snippet.disabled     && <span className='status' title='temporarily disabled due to large slowdown; under re-design'>disabled</span>}
						</button>
					</li>
				);
			} else if(snippet.subsnippets){
				return (
					<Dropdown groupName={snippet.name} icon={snippet.icon} key={snippet.name}>
						{renderSnippets(snippet.subsnippets)}
					</Dropdown>
				);
			}

		});
	};

	return <Dropdown groupName={groupName} id={groupName} icon={icon}>
		{renderSnippets(snippets)}
	</Dropdown>;
};
