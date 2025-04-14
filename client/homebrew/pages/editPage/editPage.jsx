/* eslint-disable max-lines */
require('./editPage.less');
const React = require('react');
const _ = require('lodash');
const createClass = require('create-react-class');

import request from '../../utils/request-middleware.js';
const { Meta } = require('vitreum/headtags');


const { NavbarProvider } = require('../../navbar/navbarContext.jsx');
const { Navbar, NavItem, NavSection, Dropdown } = require('../../navbar/navbar.jsx');

const NewBrewItem = require('../../navbar/newbrew.navitem.jsx');
const PrintNavItem = require('../../navbar/print.navitem.jsx');
const Account = require('../../navbar/account.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const VaultNavItem = require('../../navbar/vault.navitem.jsx');
const MainMenu = require('../../navbar/mainMenu.navitem.jsx');
const DialogZone = require('../../../components/Dialogs/DialogZone.jsx');
const Dialog = require('../../../components/Dialogs/Dialog.jsx');


const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const LockNotification = require('./lockNotification/lockNotification.jsx');

import Markdown from 'naturalcrit/markdown.js';

const { DEFAULT_BREW_LOAD } = require('../../../../server/brewDefaults.js');
const { printCurrentBrew, fetchThemeBundle } = require('../../../../shared/helpers.js');

import { updateHistory, versionHistoryGarbageCollection } from '../../utils/versionHistory.js';

const googleDriveIcon = require('../../googleDrive.svg');
const NaturalCritIcon = require('shared/naturalcrit/svg/naturalcrit.svg.jsx');

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
			isSaving                   : false,
			isPending                  : false,
			alertTrashedGoogleBrew     : this.props.brew.trashed,
			alertLoginToTransfer       : false,
			saveGoogle                 : this.props.brew.googleId ? true : false,
			confirmGoogleTransfer      : false,
			error                      : null,
			htmlErrors                 : Markdown.validate(this.props.brew.text),
			url                        : '',
			autoSave                   : true,
			autoSaveWarning            : false,
			unsavedTime                : new Date(),
			currentEditorViewPageNum   : 1,
			currentEditorCursorPageNum : 1,
			currentBrewRendererPageNum : 1,
			displayLockMessage         : this.props.brew.lock || false,
			themeBundle                : {}
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
				this.setState({ autoSaveWarning: true });
			}
		});

		window.onbeforeunload = ()=>{
			if(this.state.isSaving || this.state.isPending){
				return 'You have unsaved changes!';
			}
		};

		this.setState((prevState)=>({
			htmlErrors : Markdown.validate(prevState.brew.text)
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
		if(this.state.isPending != hasChange){
			this.setState({
				isPending : hasChange
			});
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
				style : newData.style,
				text  : newData.text
			}
		}));
	},

	trySave : function(immediate=false){
		if(!this.debounceSave) this.debounceSave = _.debounce(this.save, SAVE_TIMEOUT);
		if(this.hasChanges()){
			this.debounceSave();
		} else {
			this.debounceSave.cancel();
		}
		if(immediate) this.debounceSave.flush();
	},

	handleGoogleClick : function(){
		if(!global.account?.googleId) {
			this.setState({
				alertLoginToTransfer : true
			});
			return;
		}
		this.setState((prevState)=>({
			confirmGoogleTransfer : !prevState.confirmGoogleTransfer
		}));
		this.setState({
			error    : null,
			isSaving : false
		});
	},

	closeAlerts : function(event){
		event.stopPropagation();	//Only handle click once so alert doesn't reopen
		this.setState({
			alertTrashedGoogleBrew : false,
			alertLoginToTransfer   : false,
			confirmGoogleTransfer  : false
		});
	},

	toggleGoogleStorage : function(){
		this.setState((prevState)=>({
			saveGoogle : !prevState.saveGoogle,
			isSaving   : false,
			error      : null
		}), ()=>this.save());
	},

	save : async function(){
		if(this.debounceSave && this.debounceSave.cancel) this.debounceSave.cancel();

		this.setState((prevState)=>({
			isSaving   : true,
			error      : null,
			htmlErrors : Markdown.validate(prevState.brew.text)
		}));

		await updateHistory(this.state.brew).catch(console.error);
		await versionHistoryGarbageCollection().catch(console.error);

		const transfer = this.state.saveGoogle == _.isNil(this.state.brew.googleId);

		const brew = this.state.brew;
		brew.pageCount = ((brew.renderer=='legacy' ? brew.text.match(/\\page/g) : brew.text.match(/^\\page$/gm)) || []).length + 1;

		const params = `${transfer ? `?${this.state.saveGoogle ? 'saveToGoogle' : 'removeFromGoogle'}=true` : ''}`;
		const res = await request
			.put(`/api/update/${brew.editId}${params}`)
			.send(brew)
			.catch((err)=>{
				console.log('Error Updating Local Brew');
				this.setState({ error: err });
			});
		if(!res) return;

		this.savedBrew = {
			...this.state.brew,
			googleId : res.body.googleId ? res.body.googleId : null,
			editId 	 : res.body.editId,
			shareId  : res.body.shareId,
			version  : res.body.version
		};
		history.replaceState(null, null, `/edit/${this.savedBrew.editId}`);

		this.setState(()=>({
			brew        : this.savedBrew,
			isPending   : false,
			isSaving    : false,
			unsavedTime : new Date()
		}));
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
			onClose={()=>{this.setState({openStoragePicker : false })}}
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
		return <NavItem className='googleDriveStorage' onClick={()=>{this.setState({openStoragePicker : true})}}>
			Saved to {this.state.saveGoogle ? <img src={googleDriveIcon} /> : 'HB'}

			{/* {this.state.alertTrashedGoogleBrew &&
				<div className='errorContainer' onClick={this.closeAlerts}>
				This brew is currently in your Trash folder on Google Drive!<br />If you want to keep it, make sure to move it before it is deleted permanently!<br />
					<div className='confirm'>
						OK
					</div>
				</div>
			} */}
		</NavItem>;
	},

	renderSaveButton : function(){

		// #1 - Currently saving, show SAVING
		if(this.state.isSaving){
			return <NavItem className='save' icon='fas fa-spinner fa-spin'>saving...</NavItem>;
		}

		// #2 - Unsaved changes exist, autosave is OFF and warning timer has expired, show AUTOSAVE WARNING
		if(this.state.isPending && this.state.autoSaveWarning){
			this.setAutosaveWarning();
			const elapsedTime = Math.round((new Date() - this.state.unsavedTime) / 1000 / 60);
			const text = elapsedTime == 0 ? 'Autosave is OFF.' : `Autosave is OFF, and you haven't saved for ${elapsedTime} minutes.`;

			return <NavItem className='save error' icon='fas fa-exclamation-circle'>
			Reminder...
				<div className='errorContainer'>
					{text}
				</div>
			</NavItem>;
		}

		// #3 - Unsaved changes exist, click to save, show SAVE NOW
		// Use trySave(true) instead of save() to use debounced save function
		if(this.state.isPending){
			return <NavItem className='save' onClick={()=>this.trySave(true)} color='blue' icon='fas fa-save'>Save Now</NavItem>;
		}
		// #4 - No unsaved changes, autosave is ON, show AUTO-SAVED
		if(this.state.autoSave){
			return <NavItem className='save saved'>auto-saved.</NavItem>;
		}
		// DEFAULT - No unsaved changes, show SAVED
		return <NavItem className='save saved'>saved.</NavItem>;
	},

	handleAutoSave : function(){
		if(this.warningTimer) clearTimeout(this.warningTimer);
		this.setState((prevState)=>({
			autoSave        : !prevState.autoSave,
			autoSaveWarning : prevState.autoSave
		}), ()=>{
			localStorage.setItem('AUTOSAVE_ON', JSON.stringify(this.state.autoSave));
		});
	},

	setAutosaveWarning : function(){
		setTimeout(()=>this.setState({ autoSaveWarning: false }), 4000);                           // 4 seconds to display
		this.warningTimer = setTimeout(()=>{this.setState({ autoSaveWarning: true });}, 900000);   // 15 minutes between warnings
		this.warningTimer;
	},

	errorReported : function(error) {
		this.setState({
			error
		});
	},

	renderAutoSaveButton : function(){
		return <NavItem onClick={this.handleAutoSave}>
			Autosave <i className={this.state.autoSave ? 'fas fa-power-off active' : 'fas fa-power-off'}></i>
		</NavItem>;
	},

	processShareId : function() {
		return this.state.brew.googleId && !this.state.brew.stubbed ?
					 this.state.brew.googleId + this.state.brew.shareId :
					 this.state.brew.shareId;
	},

	getRedditLink : function(){

		const shareLink = this.processShareId();
		const systems = this.props.brew.systems.length > 0 ? ` [${this.props.brew.systems.join(' - ')}]` : '';
		const title = `${this.props.brew.title} ${systems}`;
		const text = `Hey guys! I've been working on this homebrew. I'd love your feedback. Check it out.

**[Homebrewery Link](${global.config.baseUrl}/share/${shareLink})**`;

		return `https://www.reddit.com/r/UnearthedArcana/submit?title=${encodeURIComponent(title.toWellFormed())}&text=${encodeURIComponent(text)}`;
	},

	renderNavbar : function(){
		const shareLink = this.processShareId();

		return <NavbarProvider>
			<Navbar>
				<NavSection>
					<MainMenu />
					<Dropdown id='brewMenu' trigger='click' className='brew-menu'>
						<NavItem color='purple'>Brew</NavItem>
						<NewBrewItem />
						{this.renderSaveButton()}
						{this.renderAutoSaveButton()}
						<NavItem
							href={`/user/${encodeURI(global.account.username)}`}
							color='yellow'
							icon='fas fa-beer'
						>
							brews
						</NavItem>
						<RecentNavItem brew={this.state.brew} storageKey='edit' />
						<NavItem color='blue' href={`/share/${shareLink}`}>
							view
						</NavItem>
						<NavItem color='blue' onClick={()=>{navigator.clipboard.writeText(`${global.config.baseUrl}/share/${shareLink}`);}}>
							copy url
						</NavItem>
						<NavItem color='blue' href={this.getRedditLink()} newTab={true} rel='noopener noreferrer'>
							post to reddit
						</NavItem>
						<PrintNavItem />
					</Dropdown>
					<VaultNavItem />
				</NavSection>
				<NavSection>
					<NavItem className='brewTitle'>{this.state.brew.title} {this.state.isPending && '[M]'}</NavItem>
				</NavSection>

				<NavSection>
					<Account />
					{/* {this.renderGoogleDriveIcon()}
					{this.state.error ?
						<ErrorNavItem error={this.state.error} parent={this}></ErrorNavItem> :
						
					} */}
					{/* <NewBrew />
					<HelpNavItem/> */}
					{/* <Dropdown>
						<NavItem color='teal' icon='fas fa-share-alt'>
							share
						</NavItem>
						<NavItem color='blue' href={`/share/${shareLink}`}>
							view
						</NavItem>
						<NavItem color='blue' onClick={()=>{navigator.clipboard.writeText(`${global.config.baseUrl}/share/${shareLink}`);}}>
							copy url
						</NavItem>
						<NavItem color='blue' href={this.getRedditLink()} newTab={true} rel='noopener noreferrer'>
							post to reddit
						</NavItem>
					</Dropdown> */}
					
				</NavSection>

			</Navbar>
		</NavbarProvider>
	},

	render : function(){
		return <div className='editPage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
			{this.renderNavbar()}

			{this.props.brew.lock && <LockNotification shareId={this.props.brew.shareId} message={this.props.brew.lock.editMessage} />}
			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove}>
					<Editor
						ref={this.editor}
						brew={this.state.brew}
						onTextChange={this.handleTextChange}
						onStyleChange={this.handleStyleChange}
						onMetaChange={this.handleMetaChange}
						reportError={this.errorReported}
						renderer={this.state.brew.renderer}
						userThemes={this.props.userThemes}
						themeBundle={this.state.themeBundle}
						snippetBundle={this.state.themeBundle.snippets}
						updateBrew={this.updateBrew}
						onCursorPageChange={this.handleEditorCursorPageChange}
						onViewPageChange={this.handleEditorViewPageChange}
						currentEditorViewPageNum={this.state.currentEditorViewPageNum}
						currentEditorCursorPageNum={this.state.currentEditorCursorPageNum}
						currentBrewRendererPageNum={this.state.currentBrewRendererPageNum}
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

module.exports = EditPage;
