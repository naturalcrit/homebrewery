/* eslint-disable max-lines */
require('./editPage.less');
const React = require('react');
const _ = require('lodash');
const createClass = require('create-react-class');
import { saveBrew } from 'client/homebrew/utils/save.js';

const { Meta } = require('vitreum/headtags');

const { MenuItem } = require('client/components/menubar/menubar.jsx');

import MainNavigationBar from 'client/homebrew/navbar/mainNavigationBar.jsx';

const DialogZone = require('../../../components/Dialogs/DialogZone.jsx');
const Dialog = require('../../../components/Dialogs/Dialog.jsx');

const { SplitPane } = require('client/components/splitPane/splitPane.jsx');
const ScrollButtons = require('client/components/splitPane/dividerButtons/scrollButtons.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const LockNotification = require('./lockNotification/lockNotification.jsx');

import Markdown from 'naturalcrit/markdown.js';

const { DEFAULT_BREW_LOAD } = require('../../../../server/brewDefaults.js');
const { printCurrentBrew, fetchThemeBundle } = require('../../../../shared/helpers.js');

import { updateHistory, versionHistoryGarbageCollection } from '../../utils/versionHistory.js';

const googleDriveIcon = require('../../googleDrive.svg');
const NaturalCritIcon = require('client/svg/naturalcrit.svg.jsx');

const SAVE_TIMEOUT = 10000;

const EditPage = createClass({
	displayName     : 'EditPage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW_LOAD
		};
	},

	getInitialState : function() {
		return {
			brew                       : this.props.brew,
			saveGoogle                 : this.props.brew.googleId ? true : false,
			confirmGoogleTransfer      : false,
			error                      : null,
			url                        : '',
			autoSave                   : true,
			unsavedTime                : new Date(),
			editorView                 : 'text',
			currentEditorViewPageNum   : 1,
			currentEditorCursorPageNum : 1,
			currentBrewRendererPageNum : 1,
			displayLockMessage         : this.props.brew.lock || false,
			themeBundle                : {},
			openStoragePicker          : false,
			paneOrder                  : [0, 1],
			liveScroll                 : false,
			alerts                     : {
				alertLoginToTransfer   : false,
				alertTrashedGoogleBrew : this.props.brew.trashed,
				htmlErrors             : Markdown.validate(this.props.brew.text),
				autoSaveWarning        : false,
				unsavedChanges         : false,
				isSaving               : false,
			},
		};
	},

	editor    : React.createRef(null),
	savedBrew : null,

	componentDidMount : function(){
		this.setState({
			url : window.location.href
		});

		this.savedBrew = JSON.parse(JSON.stringify(this.props.brew)); //Deep copy

		this.setState({ autoSave: JSON.parse(localStorage.getItem('AUTOSAVE_ON')) ?? true }, ()=>{
			if(this.state.autoSave){
				this.trySave();
			} else {
				this.setState((prevState)=>({ alerts: { ...prevState.alerts, autoSaveWarning: true } }));
			}
		});

		this.setState({ liveScroll: JSON.parse(localStorage.getItem('liveScroll')) === 'true' });

		window.onbeforeunload = ()=>{
			if(this.state.alerts.isSaving || this.state.alerts.unsavedChanges){
				return 'You have unsaved changes!';
			}
		};

		this.setState((prevState)=>({
			alerts : {
				...prevState.alerts,
				htmlErrors : Markdown.validate(prevState.brew.text)
			}
		}));

		fetchThemeBundle(this, this.props.brew.renderer, this.props.brew.theme);

		document.addEventListener('keydown', this.handleControlKeys);
	},
	componentWillUnmount : function() {
		window.onbeforeunload = function(){};
		document.removeEventListener('keydown', this.handleControlKeys);
	},
	componentDidUpdate : function(){
		const hasChange = this.hasChanges();
		if(this.state.alerts.unsavedChanges != hasChange){
			this.setState((prevState)=>({
				alerts : {
					...prevState.alerts,
					unsavedChanges : hasChange
				}
			}));
		}
	},

	handleControlKeys : function(e){
		if(!(e.ctrlKey || e.metaKey)) return;
		const S_KEY = 83;
		const P_KEY = 80;
		if(e.keyCode == S_KEY) this.trySave(true);
		if(e.keyCode == P_KEY) printCurrentBrew();
		if(e.keyCode == P_KEY || e.keyCode == S_KEY){
			e.stopPropagation();
			e.preventDefault();
		}
	},

	handleSplitMove : function(){
		this.editor.current.update();
	},

	liveScrollToggle : function() {
		console.log('toggled');
		this.setState(
			(prevState)=>({ liveScroll: !prevState.liveScroll }),
			()=>{localStorage.setItem('liveScroll', JSON.stringify(this.state.liveScroll)); console.log(this.state.liveScroll);}
		);
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
		let htmlErrors = this.state.alerts.htmlErrors;
		if(htmlErrors.length > 0) htmlErrors = Markdown.validate(text);

		this.setState((prevState)=>({
			brew   : { ...prevState.brew, text: text },
			alerts : {
				...prevState.alerts,
				htmlErrors : htmlErrors
			}
		}), ()=>{if(this.state.autoSave) this.trySave();});
	},

	handleSnipChange : function(snippet){
		//If there are errors, run the validator on every change to give quick feedback
		let htmlErrors = this.state.alerts.htmlErrors;
		if(htmlErrors.length > 0) htmlErrors = Markdown.validate(snippet);

		this.setState((prevState)=>({
			brew           : { ...prevState.brew, snippets: snippet },
			unsavedChanges : true,
			alerts         : {
				...prevState.alerts,
				htmlErrors : htmlErrors
			}
		}), ()=>{if(this.state.autoSave) this.trySave();});
	},

	handleStyleChange : function(style){
		this.setState((prevState)=>({
			brew : { ...prevState.brew, style: style }
		}), ()=>{if(this.state.autoSave) this.trySave();});
	},

	handleMetaChange : function(metadata, field=undefined){
		if(field == 'theme' || field == 'renderer')	// Fetch theme bundle only if theme or renderer was changed
			fetchThemeBundle(this, metadata.renderer, metadata.theme);

		this.setState((prevState)=>({
			brew : {
				...prevState.brew,
				...metadata
			}
		}), ()=>{if(this.state.autoSave) this.trySave();});
	},

	hasChanges : function(){
		return !_.isEqual(this.state.brew, this.savedBrew);
	},

	updateBrew : function(newData){
		this.setState((prevState)=>({
			brew : {
				...prevState.brew,
				style    : newData.style,
				text     : newData.text,
				snippets : newData.snippets
			}
		}));
	},

	trySave : function(immediate=false){
		if(!this.debounceSave) this.debounceSave = _.debounce(this.save, SAVE_TIMEOUT);
		if(this.state.isSaving)
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

	handleGoogleClick : function(){
		if(!global.account?.googleId) {
			this.setState((prevState)=>({
				alerts : {
					...prevState.alerts,
					alertLoginToTransfer : true
				}
			}));
			return;
		}
		this.setState((prevState)=>({
			confirmGoogleTransfer : !prevState.confirmGoogleTransfer,
		}));
		this.setState((prevState)=>({
			error  : null,
			alerts : {
				...prevState.alerts,
				isSaving : false
			}
		}));
		this.setState({
			error : null
		});
	},

	closeAlerts : function(event){
		event.stopPropagation();	//Only handle click once so alert doesn't reopen
		this.setState((prevState)=>({
			confirmGoogleTransfer : false,
			alerts                : {
				...prevState.alerts,
				alertTrashedGoogleBrew : false,
				alertLoginToTransfer   : false,
			}
		}));
	},

	toggleGoogleStorage : function(toGoogle){
		this.setState((prevState)=>({
			saveGoogle : !prevState.saveGoogle,
			error      : null,
			alerts     : {
				...prevState.alerts,
				isSaving : false,
			}
		}), ()=>this.trySave(true));
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

		const brew = this.state.brew;
		const preSaveSnapshot = { ...brew };

		await updateHistory(this.state.brew).catch(console.error);
		await versionHistoryGarbageCollection().catch(console.error);

		let res;
		try {
			res = await saveBrew({
				mode       : 'edit',
				brew       : brew,
				savedBrew  : this.savedBrew,
				saveGoogle : this.state.saveGoogle
			});
		} catch (err) {
			console.log('Error Updating Brew');
			this.setState({ error: err, alerts: { isSaving: false, error: err } });
			return;
		}
		if(!res) return;

		// --- POST-SAVE LOGIC ---
		this.savedBrew = {
			...preSaveSnapshot,
			googleId : res.body.googleId ? res.body.googleId : null,
			editId 	 : res.body.editId,
			shareId  : res.body.shareId,
			version  : res.body.version
		};

		this.setState((prevState)=>({
			brew : {
				...prevState.brew,
				googleId : res.body.googleId ? res.body.googleId : null,
				editId 	 : res.body.editId,
				shareId  : res.body.shareId,
				version  : res.body.version
			},
			unsavedTime : new Date(),
			alerts      : {
				...prevState.alerts,
				unsavedChanges : false,
				isSaving       : false,
			}
		}), ()=>{
			this.setState({ unsavedChanges: this.hasChanges() });
		});

		history.replaceState(null, null, `/edit/${this.savedBrew.editId}`);
	},

	renderStorageTransfer : function(){
		const linkedServices = [];
		const unlinkedServices = [];

		if(global.account?.googleId){
			linkedServices.push({
				id         : 'google-drive',
				icon       : googleDriveIcon,
				name       : 'Google Drive',
				isSelected : this.props.googleId ? true : false,
				onClick    : ()=>this.toggleGoogleStorage(true)
			});
		} else {
			unlinkedServices.push({
				id   : 'google-drive',
				icon : googleDriveIcon,
				name : 'Google Drive'
			});
		}

		// storage services that are available (logged in)

		const linkedButtons = linkedServices.map((service)=>(
			<button
				key={service.id}
				id={`save-to-${service.id}`}
				className={`option-box${service.isSelected ? ' selected' : ''}`}
				onClick={service.onClick}
			>
				<img src={service.icon} alt={service.name} />
				<div>{service.name}</div>
			</button>
		));

		// storage services that are not available (needs to be logged into).
		// ex.  If not logged into Google account, the Google Drive button will appear here.  It will be a link to the login page.

		const unlinkedButtons = unlinkedServices.map((service)=>(
			<a
				key={service.id}
				id={`link-${service.id}`}
				className='option-box unlinked'
				target='_blank'
				rel='noopener noreferrer'
				href={`https://www.naturalcrit.com/login?redirect=${this.state.url}`}
			>
				<img src={service.icon} alt={service.name} />
				<div>Link {service.name}</div>
			</a>
		));

		return <Dialog
			className='prompt-dialog'
			openModal={this.state.openStoragePicker}
			onClose={()=>{this.setState({ openStoragePicker: false });}}
			zone='app-dialogs'
		>
			<Dialog.Title>Save location...</Dialog.Title>
			<Dialog.Content>
				<div className='storage-section'>
					<h4>Available options:</h4>
					<div className='options'>
						<button
							id='save-to-hb'
							className={`option-box${this.props.googleId ? '' : ' selected'}`}
							onClick={()=>this.toggleGoogleStorage(false)}
						>
							<NaturalCritIcon />
							<div>Homebrewery DB</div>
						</button>
						{linkedButtons}
					</div>
				</div>

				{unlinkedButtons.length > 0 && (
					<div className='storage-section'>
						<h4>Link additional options:</h4>
						<div className='options'>
							{unlinkedButtons}
						</div>
					</div>
				)}
			</Dialog.Content>
			<Dialog.Footer />
		</Dialog>;
	},

	renderStoragePicker : function(){
		return <MenuItem className='googleDriveStorage' onClick={()=>{this.setState({ openStoragePicker: true });}}>
			Saved to {this.state.saveGoogle ? <img src={googleDriveIcon} /> : 'HB'}

			{/* {this.state.alertTrashedGoogleBrew &&
				<div className='errorContainer' onClick={this.closeAlerts}>
				This brew is currently in your Trash folder on Google Drive!<br />If you want to keep it, make sure to move it before it is deleted permanently!<br />
					<div className='confirm'>
						OK
					</div>
				</div>
			} */}
		</MenuItem>;
	},

	handleAutoSave : function(){
		if(this.warningTimer) clearTimeout(this.warningTimer);
		this.setState((prevState)=>({
			autoSave : !prevState.autoSave,
			alerts   : {
				...prevState.alerts,
				autoSaveWarning : prevState.autoSave
			}
		}), ()=>{
			localStorage.setItem('AUTOSAVE_ON', JSON.stringify(this.state.autoSave));
		});
	},

	setAutoSaveWarning : function(){
		setTimeout(()=>this.setState((prevState)=>({ alerts: { ...prevState.alerts, autoSaveWarning: false } })), 4000);                           // 4 seconds to display
		this.warningTimer = setTimeout((prevState)=>{this.setState({ alerts: { ...prevState.alerts, autoSaveWarning: true } });}, 900000);   // 15 minutes between warnings
		this.warningTimer;
	},

	errorReported : function(error) {
		this.setState({
			error
		});
	},

	render : function(){
		return <div className='editPage sitePage'>
			<DialogZone id='app-dialogs' />
			{this.renderStorageTransfer()}
			<Meta name='robots' content='noindex, nofollow' />
			<MainNavigationBar
				alerts={this.state.alerts}
				brew={this.state.brew}
				setAutoSaveWarning={this.setAutoSaveWarning}
				trySave={this.trySave}
				unsavedTime={this.state.unsavedTime}
				autoSave={this.state.autoSave}
				toggleAutoSave={this.handleAutoSave} />

			{this.props.brew.lock && <LockNotification shareId={this.props.brew.shareId} message={this.props.brew.lock.editMessage} reviewRequested={this.props.brew.lock.reviewRequested} />}
			<div className='content'>
				<SplitPane
					onDragFinish={this.handleSplitMove}
					paneOrder={this.state.paneOrder}
					setPaneOrder={(order)=>this.setState({ paneOrder: order })}
					dividerButtons={this.state.editorView === 'text' ? ScrollButtons({
						paneOrder          : this.state.paneOrder,
						editorRef          : this.editor,
						liveScroll         : this.state.liveScroll,
						onLiveScrollToggle : this.liveScrollToggle
					}) : null}

				>
					<Editor
						key={`editor-${this.state.paneOrder.indexOf(0)}`}
						ref={this.editor}
						brew={this.state.brew}
						onViewChange={this.handleEditorViewChange}
						onTextChange={this.handleTextChange}
						onStyleChange={this.handleStyleChange}
						onSnipChange={this.handleSnipChange}
						onMetaChange={this.handleMetaChange}
						reportError={this.errorReported}
						renderer={this.state.brew.renderer}
						userThemes={this.props.userThemes}
						themeBundle={this.state.themeBundle}
						updateBrew={this.updateBrew}
						onCursorPageChange={this.handleEditorCursorPageChange}
						onViewPageChange={this.handleEditorViewPageChange}
						currentEditorViewPageNum={this.state.currentEditorViewPageNum}
						currentEditorCursorPageNum={this.state.currentEditorCursorPageNum}
						currentBrewRendererPageNum={this.state.currentBrewRendererPageNum}
						htmlErrors={this.state.alerts.htmlErrors}
						liveScroll={this.state.liveScroll}
					/>
					<BrewRenderer
						key={`renderer-${this.state.paneOrder.indexOf(1)}`}
						text={this.state.brew.text}
						style={this.state.brew.style}
						renderer={this.state.brew.renderer}
						theme={this.state.brew.theme}
						themeBundle={this.state.themeBundle}
						htmlErrors={this.state.alerts.htmlErrors}
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

module.exports = EditPage;
