/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./newPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
import { saveBrew } from 'client/homebrew/utils/save.js';

import Markdown from 'naturalcrit/markdown.js';

import MainNavigationBar from 'client/homebrew/navbar/mainNavigationBar.jsx';

const { SplitPane } = require('client/components/splitPane/splitPane.jsx');
const ScrollButtons = require('client/components/splitPane/dividerButtons/scrollButtons.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const { DEFAULT_BREW } = require('../../../../server/brewDefaults.js');
const { printCurrentBrew, fetchThemeBundle } = require('../../../../shared/helpers.js');

const BREWKEY  = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY  = 'homebrewery-new-meta';
let SAVEKEY;

const SAVE_TIMEOUT = 10000;


const NewPage = createClass({
	displayName     : 'NewPage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW
		};
	},

	getInitialState : function() {
		const brew = this.props.brew;

		return {
			brew                       : brew,
			saveGoogle                 : (global.account && global.account.googleId ? true : false),
			error                      : null,
			htmlErrors                 : Markdown.validate(brew.text),
			editorView                 : 'text',
			currentEditorViewPageNum   : 1,
			currentEditorCursorPageNum : 1,
			currentBrewRendererPageNum : 1,
			themeBundle                : {},
			paneOrder                  : [0, 1],
			alerts                     : {
				alertLoginToTransfer   : false,
				alertTrashedGoogleBrew : this.props.brew.trashed,
				htmlErrors             : Markdown.validate(this.props.brew.text),
				autoSaveWarning        : false,
				unsavedChanges         : true,
				isSaving               : false,
			},
		};
	},

	editor : React.createRef(null),

	componentDidMount : function() {
		document.addEventListener('keydown', this.handleControlKeys);

		const brew = this.state.brew;

		if(!this.props.brew.shareId && typeof window !== 'undefined') { //Load from localStorage if in client browser
			const brewStorage  = localStorage.getItem(BREWKEY);
			const styleStorage = localStorage.getItem(STYLEKEY);
			const metaStorage = JSON.parse(localStorage.getItem(METAKEY));

			brew.text  = brewStorage  ?? brew.text;
			brew.style = styleStorage ?? brew.style;
			// brew.title = metaStorage?.title || this.state.brew.title;
			// brew.description = metaStorage?.description || this.state.brew.description;
			brew.renderer = metaStorage?.renderer ?? brew.renderer;
			brew.theme    = metaStorage?.theme    ?? brew.theme;
			brew.lang     = metaStorage?.lang     ?? brew.lang;
		}

		SAVEKEY = `HOMEBREWERY-DEFAULT-SAVE-LOCATION-${global.account?.username || ''}`;
		const saveStorage = localStorage.getItem(SAVEKEY) || 'HOMEBREWERY';

		this.setState({
			brew       : brew,
			saveGoogle : (saveStorage == 'GOOGLE-DRIVE' && this.state.saveGoogle)
		});

		fetchThemeBundle(this, this.props.brew.renderer, this.props.brew.theme);

		localStorage.setItem(BREWKEY, brew.text);
		if(brew.style)
			localStorage.setItem(STYLEKEY, brew.style);
		localStorage.setItem(METAKEY, JSON.stringify({ 'renderer': brew.renderer, 'theme': brew.theme, 'lang': brew.lang }));
		if(window.location.pathname != '/new') {
			window.history.replaceState({}, window.location.title, '/new/');
		}
	},
	componentWillUnmount : function() {
		document.removeEventListener('keydown', this.handleControlKeys);
	},

	handleControlKeys : function(e){
		if(!(e.ctrlKey || e.metaKey)) return;
		const S_KEY = 83;
		const P_KEY = 80;
		if(e.keyCode == S_KEY) this.save();
		if(e.keyCode == P_KEY) printCurrentBrew();
		if(e.keyCode == P_KEY || e.keyCode == S_KEY){
			e.stopPropagation();
			e.preventDefault();
		}
	},

	handleSplitMove : function(){
		this.editor.current.update();
	},

	handleEditorViewChange : function(newView){
		this.setState({ editorView: newView });
	},

	handleEditorViewPageChange : function(pageNumber){
		this.setState({ currentEditorViewPageNum: pageNumber });
	},

	handleEditorCursorPageChange : function(pageNumber){
		this.setState({ currentEditorCursorPageNum: pageNumber });
	},

	handleBrewRendererPageChange : function(pageNumber){
		this.setState({ currentBrewRendererPageNum: pageNumber });
	},

	handleTextChange : function(text){
		//If there are errors, run the validator on every change to give quick feedback
		let htmlErrors = this.state.htmlErrors;
		if(htmlErrors.length) htmlErrors = Markdown.validate(text);

		this.setState((prevState)=>({
			brew       : { ...prevState.brew, text: text },
			htmlErrors : htmlErrors,
		}));
		localStorage.setItem(BREWKEY, text);
	},

	handleStyleChange : function(style){
		this.setState((prevState)=>({
			brew : { ...prevState.brew, style: style },
		}));
		localStorage.setItem(STYLEKEY, style);
	},

	handleSnipChange : function(snippet){
		//If there are errors, run the validator on every change to give quick feedback
		let htmlErrors = this.state.htmlErrors;
		if(htmlErrors.length) htmlErrors = Markdown.validate(snippet);

		this.setState((prevState)=>({
			brew       : { ...prevState.brew, snippets: snippet },
			htmlErrors : htmlErrors,
		}), ()=>{if(this.state.autoSave) this.trySave();});
	},

	handleMetaChange : function(metadata, field=undefined){
		if(field == 'theme' || field == 'renderer')	// Fetch theme bundle only if theme or renderer was changed
			fetchThemeBundle(this, metadata.renderer, metadata.theme);

		this.setState((prevState)=>({
			brew : { ...prevState.brew, ...metadata },
		}), ()=>{
			localStorage.setItem(METAKEY, JSON.stringify({
				// 'title'       : this.state.brew.title,
				// 'description' : this.state.brew.description,
				'renderer' : this.state.brew.renderer,
				'theme'    : this.state.brew.theme,
				'lang'     : this.state.brew.lang
			}));
		});
		;
	},

	trySave : function(immediate=false){
		if(!this.debounceSave) this.debounceSave = _.debounce(this.save, SAVE_TIMEOUT);
		if(this.state.alerts.isSaving)
			return;

		if(immediate) {
			this.debounceSave();
			this.debounceSave.flush();
			return;
		}

		if(this.hasChanges())
			this.debounceSave();
		else
			this.debounceSave.cancel();
	},

	save : async function(){
		if(this.debounceSave && this.debounceSave.cancel) this.debounceSave.cancel();

		this.setState((prevState)=>({
			error  : null,
			alerts : {
				...prevState.alerts,
				isSaving   : true,
				htmlErrors : Markdown.validate(prevState.brew.text)
			}
		}));

		let brew = this.state.brew;

		let res;
		try {
			res = await saveBrew({
				mode       : 'new',
				brew       : brew,
				saveGoogle : this.state.saveGoogle
			});
		} catch (err) {
			console.log('Error Saving Local Brew');
			this.setState({ error: err, alerts: { isSaving: false, error: err } });
			return;
		}
		if(!res) return;

		brew = res.body;
		localStorage.removeItem(BREWKEY);
		localStorage.removeItem(STYLEKEY);
		localStorage.removeItem(METAKEY);
		window.location = `/edit/${brew.editId}`;
	},


	render : function(){
		return <div className='newPage sitePage'>
			<MainNavigationBar alerts={this.state.alerts} brew={this.state.brew} trySave={this.trySave} unsavedTime={this.state.unsavedTime} autoSave={this.state.autoSave} />

			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove}
					paneOrder={this.state.paneOrder}
					setPaneOrder={(order)=>this.setState({ paneOrder: order })}
					dividerButtons={ScrollButtons({
						paneOrder          : this.state.paneOrder,
						editorRef          : this.editor,
						liveScroll         : this.state.liveScroll,
						onLiveScrollToggle : this.liveScrollToggle
					})}>

					<Editor
						ref={this.editor}
						brew={this.state.brew}
						onViewChange={this.handleEditorViewChange}
						onTextChange={this.handleTextChange}
						onStyleChange={this.handleStyleChange}
						onMetaChange={this.handleMetaChange}
						onSnipChange={this.handleSnipChange}
						renderer={this.state.brew.renderer}
						userThemes={this.props.userThemes}
						themeBundle={this.state.themeBundle}
						onCursorPageChange={this.handleEditorCursorPageChange}
						onViewPageChange={this.handleEditorViewPageChange}
						currentEditorViewPageNum={this.state.currentEditorViewPageNum}
						currentEditorCursorPageNum={this.state.currentEditorCursorPageNum}
						currentBrewRendererPageNum={this.state.currentBrewRendererPageNum}
						liveScroll={this.state.liveScroll}
					/>
					<BrewRenderer
						text={this.state.brew.text}
						style={this.state.brew.style}
						renderer={this.state.brew.renderer}
						theme={this.state.brew.theme}
						themeBundle={this.state.themeBundle}
						errors={this.state.htmlErrors}
						lang={this.state.brew.lang}
						onPageChange={this.handleBrewRendererPageChange}
						currentEditorViewPageNum={this.state.currentEditorViewPageNum}
						currentEditorCursorPageNum={this.state.currentEditorCursorPageNum}
						currentBrewRendererPageNum={this.state.currentBrewRendererPageNum}
						allowPrint={true}
					/>
				</SplitPane>
			</div>
		</div>;
	}
});

module.exports = NewPage;
