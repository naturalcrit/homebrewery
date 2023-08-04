/* eslint-disable max-lines */
require('./editPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const request = require('../../utils/request-middleware.js');
const { Meta } = require('vitreum/headtags');
const Moment = require('moment');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
import * as Toolbar from '@radix-ui/react-toolbar';
import * as Menubar from '@radix-ui/react-menubar';
import * as Switch from '@radix-ui/react-switch';
import { LinkItem, ButtonItem, Menu, SubMenu } from '../../navbar/menubarExtensions.jsx';

const BrewTitle = require('../../navbar/brewTitle.jsx');
const NewBrew = require('../../navbar/newBrew.jsx');
const HelpItems = require('../../navbar/help.navitem.jsx');
const PrintLink = require('../../navbar/print.navitem.jsx');
const ShareMenu = require('../../navbar/share.jsx');
const ErrorNavItem = require('../../navbar/error-navitem.jsx');
const Account = require('../../navbar/account.navitem.jsx');
import { RecentItems } from '../../navbar/recent.navitem.jsx';

const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');

const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const Tabs = require('../../editor/editorTabs.jsx')

const Markdown = require('naturalcrit/markdown.js');

const { DEFAULT_BREW_LOAD } = require('../../../../server/brewDefaults.js');

const googleDriveIcon = require('../../googleDrive.svg');

const SAVE_TIMEOUT = 3000;

const EditPage = createClass({
	displayName     : 'EditPage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW_LOAD
		};
	},

	getInitialState : function() {
		return {
			brew                   : this.props.brew,
			isSaving               : false,
			isPending              : false,
			alertTrashedGoogleBrew : this.props.brew.trashed,
			alertLoginToTransfer   : false,
			saveGoogle             : this.props.brew.googleId ? true : false,
			confirmGoogleTransfer  : false,
			error                  : null,
			htmlErrors             : Markdown.validate(this.props.brew.text),
			url                    : '',
			autoSave               : true,
			autoSaveWarning        : false,
			unsavedTime            : new Date()
		};
	},
	savedBrew : null,

	componentDidMount : function(){

		document.documentElement.style.setProperty('height', window.innerHeight + 'px');
		window.addEventListener('resize', _.throttle(()=>{document.documentElement.style.setProperty('height', window.innerHeight + 'px')}, 100))

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



		document.addEventListener('keydown', this.handleControlKeys);
	},
	componentWillUnmount : function() {
		window.onbeforeunload = function(){};
		document.removeEventListener('keydown', this.handleControlKeys);
	},

	handleControlKeys : function(e){
		if(!(e.ctrlKey || e.metaKey)) return;
		const S_KEY = 83;
		const P_KEY = 80;
		if(e.keyCode == S_KEY) this.save();
		if(e.keyCode == P_KEY) window.open(`/print/${this.processShareId()}?dialog=true`, '_blank').focus();
		if(e.keyCode == P_KEY || e.keyCode == S_KEY){
			e.stopPropagation();
			e.preventDefault();
		}
	},

	handleTextChange : function(text){
		//If there are errors, run the validator on every change to give quick feedback
		let htmlErrors = this.state.htmlErrors;
		if(htmlErrors.length) htmlErrors = Markdown.validate(text);

		this.setState((prevState)=>({
			brew       : { ...prevState.brew, text: text },
			isPending  : true,
			htmlErrors : htmlErrors
		}), ()=>{if(this.state.autoSave) this.trySave();});
	},

	handleStyleChange : function(style){
		this.setState((prevState)=>({
			brew      : { ...prevState.brew, style: style },
			isPending : true
		}), ()=>{if(this.state.autoSave) this.trySave();});
	},

	handleMetaChange : function(metadata){
		this.setState((prevState)=>({
			brew : {
				...prevState.brew,
				...metadata
			},
			isPending : true,
		}), ()=>{if(this.state.autoSave) this.trySave();});

	},

	hasChanges : function(){
		return !_.isEqual(this.state.brew, this.savedBrew);
	},

	trySave : function(){
		if(!this.debounceSave) this.debounceSave = _.debounce(this.save, SAVE_TIMEOUT);
		if(this.hasChanges()){
			this.debounceSave();
		} else {
			this.debounceSave.cancel();
		}
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

		this.savedBrew = res.body;
		history.replaceState(null, null, `/edit/${this.savedBrew.editId}`);

		this.setState((prevState)=>({
			brew : { ...prevState.brew,
				googleId : this.savedBrew.googleId ? this.savedBrew.googleId : null,
				editId 	 : this.savedBrew.editId,
				shareId  : this.savedBrew.shareId,
				version  : this.savedBrew.version
			},
			isPending   : false,
			isSaving    : false,
			unsavedTime : new Date()
		}));
		console.log(this.state.saveGoogle);
		console.log(`%cSaved at about ${Moment().format('h:mm:ss a')} to ${this.state.saveGoogle ? 'your Google Drive' : 'the Homebrewery database'}.`, 'color: goldenrod', ``);
	},

	renderGoogleDriveIcon : function(){
		return <Toolbar.Button className='googleDriveStorage' onClick={this.handleGoogleClick}>
			<img src={googleDriveIcon} className={this.state.saveGoogle ? '' : 'inactive'} alt='Google Drive icon'/>

			{this.state.confirmGoogleTransfer &&
				<div className='errorContainer' onClick={this.closeAlerts}>
					{ this.state.saveGoogle
						?	`Would you like to transfer this brew from your Google Drive storage back to the Homebrewery?`
						: `Would you like to transfer this brew from the Homebrewery to your personal Google Drive storage?`
					}
					<br />
					<div className='confirm' onClick={this.toggleGoogleStorage}>
						Yes
					</div>
					<div className='deny'>
						No
					</div>
				</div>
			}

			{this.state.alertLoginToTransfer &&
				<div className='errorContainer' onClick={this.closeAlerts}>
					You must be signed in to a Google account to transfer
					between the homebrewery and Google Drive!
					<a target='_blank' rel='noopener noreferrer'
						href={`https://www.naturalcrit.com/login?redirect=${this.state.url}`}>
						<div className='confirm'>
							Sign In
						</div>
					</a>
					<div className='deny'>
						Not Now
					</div>
				</div>
			}

			{this.state.alertTrashedGoogleBrew &&
				<div className='errorContainer' onClick={this.closeAlerts}>
				This brew is currently in your Trash folder on Google Drive!<br />If you want to keep it, make sure to move it before it is deleted permanently!<br />
					<div className='confirm'>
						OK
					</div>
				</div>
			}
		</Toolbar.Button>;
	},

	renderSaveButton : function(){
		return <ButtonItem onClick={this.save} hotkeys={{ mac: ['⌘', 'S'], pc: ['Ctrl', 'S'] }}>Save</ButtonItem>;
	},


	// renderSaveButton : function(){
	// 	if(this.state.autoSaveWarning && this.hasChanges()){
	// 		this.setAutosaveWarning();
	// 		const elapsedTime = Math.round((new Date() - this.state.unsavedTime) / 1000 / 60);
	// 		const text = elapsedTime == 0 ? 'Autosave is OFF.' : `Autosave is OFF, and you haven't saved for ${elapsedTime} minutes.`;

	// 		return <Nav.item className='save error' icon='fas fa-exclamation-circle'>
	// 		Reminder...
	// 			<div className='errorContainer'>
	// 				{text}
	// 			</div>
	// 		</Nav.item>;
	// 	}

	// 	if(this.state.isSaving){
	// 		return <Nav.item className='save' icon='fas fa-spinner fa-spin'>saving...</Nav.item>;
	// 	}
	// 	if(this.state.isPending && this.hasChanges()){
	// 		return <Nav.item className='save' onClick={this.save} color='blue' icon='fas fa-save'>Save Now</Nav.item>;
	// 	}
	// 	if(!this.state.isPending && !this.state.isSaving && this.state.autoSave){
	// 		return <Nav.item className='save saved'>auto-saved.</Nav.item>;
	// 	}
	// 	if(!this.state.isPending && !this.state.isSaving){
	// 		return <Nav.item className='save saved'>saved.</Nav.item>;
	// 	}
	// },

	handleAutoSave : function(){
		if(this.warningTimer) clearTimeout(this.warningTimer);
		this.setState((prevState)=>({
			autoSave        : !prevState.autoSave,
			autoSaveWarning : prevState.autoSave
		}), ()=>{
			localStorage.setItem('AUTOSAVE_ON', JSON.stringify(this.state.autoSave));
			this.state.autoSave == true ? console.log('Autosave turned %cON', 'background: green; color: white; border-radius: 3px; padding: 0 5px') : console.log('Autosave turned %cOFF', 'background: red; color: white; border-radius: 3px; padding: 0 5px');
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

	// renderAutoSaveButton : function(){
	// 	return <ButtonItem onClick={this.handleAutoSave}>
	// 		Autosave <span className='right-slot'><i className={this.state.autoSave ? 'fas fa-power-off active' : 'fas fa-power-off'}></i></span>
	// 	</ButtonItem>;
	// },

	renderAutoSaveButton : function(){
		return <Menubar.CheckboxItem
			className='autosave-toggle switch'
			checked={this.state.autoSave}
			onCheckedChange={this.handleAutoSave}
			onSelect={(e)=>{e.preventDefault();}}>
			Autosave <span className='right-slot'><Menubar.ItemIndicator className='switch' forceMount={true}><span className='switch-thumb'></span></Menubar.ItemIndicator></span>
		</Menubar.CheckboxItem>;
	},

	processShareId : function() {
		return this.state.brew.googleId && !this.state.brew.stubbed ?
					 this.state.brew.googleId + this.state.brew.shareId :
					 this.state.brew.shareId;
	},

	renderNavbar : function(menubar) {
		// If the screen is 'full size'...
		if(this.props.isNarrow == false){

			if(menubar.location === 'bottom') return;

			return <Navbar.Top>
				<Menu trigger='Brew'>
					<NewBrew />
					<SubMenu trigger='Save'>
						{this.renderSaveButton()}
						{this.renderAutoSaveButton()}
					</SubMenu>
					<Menubar.Separator />
					<SubMenu trigger='Recently Edited'>
						<RecentItems brew={this.state.brew} storageKey='edit' />
					</SubMenu>
					<SubMenu trigger='Recently Viewed'>
						<RecentItems brew={this.state.brew} storageKey='view' />
					</SubMenu>
					{global.account ? <LinkItem href={`/user/${encodeURI(global.account.username)}`}>Library</LinkItem> : ''}
					<Menubar.Separator />
					<PrintLink shareId={this.processShareId()}>Print</PrintLink>
				</Menu>
				<Menu trigger='Help'>
					<HelpItems.faq />
					<HelpItems.migrate />
					<Menubar.Separator />
					<SubMenu trigger='Community'>
						<HelpItems.rHomebrewery />
						<HelpItems.DoMT />
					</SubMenu>
					<Menubar.Separator />
					<SubMenu trigger='Report Issue'>
						<HelpItems.issueToReddit />
						<HelpItems.issueToGithub />
					</SubMenu>
				</Menu>
				<BrewTitle title={this.state.brew.title} />
				<Account />
			</Navbar.Top>;

		} else {    // If the screen is narrow (such as on mobile)...

			if(menubar.location === 'top'){
				return <Navbar.Top>
					<BrewTitle title={this.state.brew.title} />
					<Menu trigger='Help'>
						<HelpItems.faq />
						<HelpItems.migrate />
						<Menubar.Separator />
						<SubMenu trigger='Community'>
							<HelpItems.rHomebrewery />
							<HelpItems.DoMT />
						</SubMenu>
						<Menubar.Separator />
						<SubMenu trigger='Report Issue'>
							<HelpItems.issueToReddit />
							<HelpItems.issueToGithub />
						</SubMenu>
					</Menu>
				</Navbar.Top>;
			} else {
				return <Navbar.Bottom>
					<Menu trigger='Brew'>
						<NewBrew />
						<SubMenu trigger='Save'>
							{this.renderSaveButton()}
							{this.renderAutoSaveButton()}
						</SubMenu>
						<Menubar.Separator />
						<SubMenu trigger='Recently Edited'>
							<RecentItems brew={this.state.brew} storageKey='edit' />
						</SubMenu>
						<SubMenu trigger='Recently Viewed'>
							<RecentItems brew={this.state.brew} storageKey='view' />
						</SubMenu>
						{global.account ? <LinkItem href={`/user/${encodeURI(global.account.username)}`}>Library</LinkItem> : ''}
						<Menubar.Separator />
						<PrintLink shareId={this.processShareId()}>Print</PrintLink>
					</Menu>
					<Account />
				</Navbar.Bottom>;
			}
		}

	},

	render : function(){
		return <div className='editPage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
			{this.renderNavbar({ location: 'top' })}

			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
					<Tabs
						brew={this.state.brew}
						onTextChange={this.handleTextChange}
						onStyleChange={this.handleStyleChange}
						onMetaChange={this.handleMetaChange}
						reportError={this.errorReported}
						renderer={this.state.brew.renderer} 
					/>
					<BrewRenderer
						text={this.state.brew.text}
						style={this.state.brew.style}
						renderer={this.state.brew.renderer}
						theme={this.state.brew.theme}
						errors={this.state.htmlErrors}
						lang={this.state.brew.lang}
					/>
				</SplitPane>
			</div>
			{this.renderNavbar({ location: 'bottom' })}
		</div>;
	}
});

module.exports = EditPage;
