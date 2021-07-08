/* eslint-disable max-lines */
require('./editPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const request = require('superagent');
const { Meta } = require('vitreum/headtags');

const Markdown = require('naturalcrit/markdown.js');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const NewBrewNavItem = require('../../navbar/newbrew.navitem.jsx');
const PrintLinkNavItem = require('../../navbar/print.navitem.jsx');
const ReportIssueNavItem = require('../../navbar/issue.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const AccountNavItem = require('../../navbar/account.navitem.jsx');

const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const googleDriveActive = require('../../googleDrive.png');
const googleDriveInactive = require('../../googleDriveMono.png');

const SAVE_TIMEOUT = 3000;

const BREWKEY = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const localStorageKeys = [BREWKEY, STYLEKEY];


const EditPage = createClass({
	getDefaultProps : function() {
		return {
			brew : {
				text      : '',
				style     : '',
				shareId   : null,
				editId    : null,
				createdAt : null,
				updatedAt : null,
				gDrive    : false,
				trashed   : false,

				title       : '',
				description : '',
				tags        : '',
				published   : false,
				authors     : [],
				systems     : [],
				renderer    : 'legacy'
			}
		};
	},

	getInitialState : function() {
		return {
			brew                   : this.props.brew,
			isSaving               : false,
			isPending              : false,
			alertTrashedGoogleBrew : this.props.brew.trashed,
			alertLoginToTransfer   : false,
			saveGoogle             : this.props.brew.googleId || (global.account?.googleId && this.props.editType == 'new') ? true : false,
			confirmGoogleTransfer  : false,
			errors                 : null,
			htmlErrors             : Markdown.validate(this.props.brew.text),
			url                    : ''
		};
	},
	savedBrew : null,

	componentDidMount : function(){
		this.savedBrew = JSON.parse(JSON.stringify(this.props.brew)); //Deep copy

		const brew = this.props.brew;

		if(this.isNew()) {
			console.log('is new');
			if(!brew.text || !brew.style){
				console.log('has local data');

				brew.text = brew.text || (localStorage.getItem(BREWKEY) ?? '');
				brew.style = brew.style || (localStorage.getItem(STYLEKEY) ?? undefined);
			}
		}

		if(this.isEdit()) { this.trySave(); };
		window.onbeforeunload = ()=>{
			if(!this.isNew && (this.state.isSaving || this.state.isPending)){
				return 'You have unsaved changes!';
			}
		};

		this.setState((prevState)=>({
			brew       : _.merge({}, prevState.brew, brew),
			url        : window.location.href,
			htmlErrors : Markdown.validate(prevState.brew.text)
		}));

		document.addEventListener('keydown', this.handleControlKeys);
	},
	componentWillUnmount : function() {
		window.onbeforeunload = function(){};
		document.removeEventListener('keydown', this.handleControlKeys);
	},

	isNew : function() {
		return (this.props.editType == 'new');
	},

	isEdit : function() {
		return (this.props.editType == 'edit');
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

	handleSplitMove : function(){
		this.refs.editor.update();
	},

	handleTextChange : function(text){
		//If there are errors, run the validator on every change to give quick feedback
		let htmlErrors = this.state.htmlErrors;
		if(htmlErrors.length) htmlErrors = Markdown.validate(text);

		this.setState((prevState)=>({
			brew       : _.merge({}, prevState.brew, { text: text }),
			isPending  : true,
			htmlErrors : htmlErrors
		}), ()=>this.trySave());
	},

	handleStyleChange : function(style){
		this.setState((prevState)=>({
			brew      : _.merge({}, prevState.brew, { style: style }),
			isPending : true
		}), ()=>this.trySave());
	},

	handleMetaChange : function(metadata){
		this.setState((prevState)=>({
			brew      : _.merge({}, prevState.brew, metadata),
			isPending : true,
		}), ()=>this.trySave());
	},

	hasChanges : function(){
		return !_.isEqual(this.state.brew, this.savedBrew);
	},

	trySave : function(){
		if(!this.debounceSave) this.debounceSave = _.debounce(this.save, SAVE_TIMEOUT);
		if(this.hasChanges()){
			if(this.isEdit()) {
				this.debounceSave();
			}
			if(this.isNew()) {
				//console.log(this.state.brew.text);
				localStorage.setItem(BREWKEY, this.state.brew.text);
				localStorage.setItem(STYLEKEY, this.state.brew.style);
				this.debounceSave.cancel();
			}
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
		this.clearErrors();
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
			errors     : null
		}), ()=> {
			if(this.isEdit())
				this.transferBrew();
		});
	},

	clearErrors : function(){
		this.setState({
			errors   : null,
			isSaving : false
		});
	},

	transferBrew : async function(){
		const brewToTransfer = this.state.brew;

		if(this.state.saveGoogle) {
			const res = await this.saveGoogleBrew(brewToTransfer);
			if(res) {
				await this.setState({
					googleId : res.body.googleId
				});
			} else {
				return;
			}

			console.log('Deleting Local copy');
			await this.deleteBrew(brewToTransfer);

			this.savedBrew = res.body;
			history.replaceState(null, null, `/edit/${this.savedBrew.googleId}${this.savedBrew.editId}`); //update URL to match doc ID
		} else {
			const res = await this.saveBrew(brewToTransfer);

			if(!res) { return; }

			console.log('Deleting Google copy');
			await this.deleteGoogleBrew(brewToTransfer);

			this.savedBrew = res.body;
			history.replaceState(null, null, `/edit/${this.savedBrew.editId}`); //update URL to match doc ID
		}
	},

	saveBrew : async function(brewToSave) {
		const res = await request
							.post('/api')
							.send(brewToSave)
							.catch((err)=>{
								alert('Error while saving!');
								this.setState({
									errors   : err,
									isSaving : false
								});
								return;
							});
		this.setState((prevState)=>({
			brew : _.merge({}, prevState.brew, {
				googleId : '',
				editId 	 : res.body.editId,
				shareId  : res.body.shareId
			})
		}));
		return res;
	},

	saveGoogleBrew : async function(brewToSave) {
		const res = await request
					.post('/api/newGoogle/')
					.send(brewToSave)
					.catch((err)=>{
						alert(err.status === 401
							? 'Not signed in!'
							: 'Error Saving to Google Brew!');
						this.setState({
							errors     : err,
							isSaving   : false,
							saveGoogle : false
						});
						return;
					});
		this.setState((prevState)=>({
			brew : _.merge({}, prevState.brew, {
				googleId : res.body.googleId,
				editId 	 : res.body.editId,
				shareId  : res.body.shareId
			})
		}));
		return res;
	},

	deleteBrew : async function(brewToDelete) {
		const res = await request.delete(`/api/${brewToDelete.editId}`)
					.send()
					.catch((err)=>{
						console.log('Error deleting Local Copy');
						// TODO: setState errors: err, as per saveBrew/saveGoogleBrew???
						return;
					});
		return res;
	},

	deleteGoogleBrew : async function(brewToDelete) {
		const res = await request.get(`/api/removeGoogle/${brewToDelete.googleId}${brewToDelete.editId}`)
					.send()
					.catch((err)=>{
						console.log('Error Deleting Google Brew');
						// TODO: setState errors: err, as per saveBrew/saveGoogleBrew???
						return;
					});
		return res;
	},

	updateBrew : async function(brewToUpdate) {
		const res = await request
					.put(`/api/update/${brewToUpdate.editId}`)
					.send(brewToUpdate)
					.catch((err)=>{
						console.log('Error Updating Local Brew');
						this.setState({ errors: err });
						return;
					});
		return res;
	},

	updateGoogleBrew : async function(brewToUpdate) {
		const res = await request
					.put(`/api/updateGoogle/${brewToUpdate.editId}`)
					.send(brewToUpdate)
					.catch((err)=>{
						console.log(err.status === 401
							? 'Not signed in!'
							: 'Error Saving to Google!');
						this.setState({ errors: err });
						return;
					});
		return res;
	},

	save : async function(){
		if(this.debounceSave && this.debounceSave.cancel) this.debounceSave.cancel();

		this.setState((prevState)=>({
			isSaving   : true,
			errors     : null,
			htmlErrors : Markdown.validate(prevState.brew.text)
		}));

		const brewToSave = this.state.brew;
		if(this.isNew()) {
			// Split out CSS to Style if CSS codefence exists
			if(brewToSave.text.startsWith('```css') && brewToSave.text.indexOf('```\n\n') > 0) {
				const index = brewToSave.text.indexOf('```\n\n');
				brewToSave.style = `${brewToSave.style ? `${brewToSave.style}\n` : ''}${brewToSave.text.slice(7, index - 1)}`;
				brewToSave.text = brewToSave.text.slice(index + 5);
			};

			let editUrl = '';
			if(this.state.saveGoogle) {
				const res = await this.saveGoogleBrew(brewToSave);
				this.savedBrew = res.body;
				editUrl = `/edit/${this.savedBrew.googleId}${this.savedBrew.editId}`;
			} else {
				const res = await this.saveBrew(brewToSave);
				window.onbeforeunload = function(){};
				this.savedBrew = res.body;
				editUrl = `/edit/${this.savedBrew.editId}`;
			}
			localStorageKeys.forEach((key)=>(localStorage.removeItem(key)));
			window.location.href = editUrl;
		}
		if(this.isEdit())	{
			if(this.state.saveGoogle) {
				const res = await this.updateGoogleBrew(brewToSave);
				this.savedBrew = res.body;
			} else {
				const res = await this.updateBrew(brewToSave);
				this.savedBrew = res.body;
			}
		}
		this.setState((prevState)=>({
			brew : _.merge({}, prevState.brew, {
				googleId : this.savedBrew.googleId ? this.savedBrew.googleId : null,
				editId 	 : this.savedBrew.editId,
				shareId  : this.savedBrew.shareId
			}),
			isPending : false,
			isSaving  : false,
		}));
	},

	renderGoogleDriveIcon : function(){
		return <Nav.item className='googleDriveStorage' onClick={this.handleGoogleClick}>
			{this.state.saveGoogle
				? <img src={googleDriveActive} alt='googleDriveActive'/>
				: <img src={googleDriveInactive} alt='googleDriveInactive'/>
			}

			{this.state.confirmGoogleTransfer &&
				<div className='errorContainer' onClick={this.closeAlerts}>
					{ this.isNew() && (this.state.saveGoogle
						?	`Use Homebrewery storage when you save this brew?`
						: `Use Google Drive storage when you save this brew?`
					)}
					{ this.isEdit() && (this.state.saveGoogle
						?	`Would you like to transfer this brew from your Google Drive storage back to the Homebrewery?`
						: `Would you like to transfer this brew from the Homebrewery to your personal Google Drive storage?`
					)}
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
		</Nav.item>;
	},

	renderSaveButton : function(){
		if(this.state.errors){
			let errMsg = '';
			try {
				errMsg += `${this.state.errors.toString()}\n\n`;
				errMsg += `\`\`\`\n${JSON.stringify(this.state.errors.response.error, null, '  ')}\n\`\`\``;
			} catch (e){}

			if(this.state.errors.status == '401'){
				return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
					Oops!
					<div className='errorContainer' onClick={this.clearErrors}>
					You must be signed in to a Google account
						to save this to<br />Google Drive!<br />
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
				</Nav.item>;
			}

			return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
				Oops!
				<div className='errorContainer'>
					Looks like there was a problem saving. <br />
					Report the issue <a target='_blank' rel='noopener noreferrer'
						href={`https://github.com/naturalcrit/homebrewery/issues/new?body=${encodeURIComponent(errMsg)}`}>
						here
					</a>.
				</div>
			</Nav.item>;
		}

		if(this.state.isSaving){
			return <Nav.item className='save' icon='fas fa-spinner fa-spin'>saving...</Nav.item>;
		}
		if(this.isNew() || (this.state.isPending && this.hasChanges())){
			return <Nav.item className='save' onClick={this.save} color='blue' icon='fas fa-save'>Save Now</Nav.item>;
		}
		if(!this.state.isPending && !this.state.isSaving){
			return <Nav.item className='save saved'>saved.</Nav.item>;
		}
	},

	processShareId : function() {
		return this.state.brew.googleId ?
					 this.state.brew.googleId + this.state.brew.shareId :
					 this.state.brew.shareId;
	},

	renderNavbar : function(){
		return <Navbar>

			{this.state.alertTrashedGoogleBrew &&
				<div className='errorContainer' onClick={this.closeAlerts}>
				This brew is currently in your Trash folder on Google Drive!<br />If you want to keep it, make sure to move it before it is deleted permanently!<br />
					<div className='confirm'>
						OK
					</div>
				</div>
			}

			<Nav.section>
				<Nav.item className='brewTitle'>{this.state.brew.title}</Nav.item>
			</Nav.section>

			<Nav.section>
				{this.renderGoogleDriveIcon()}
				{this.renderSaveButton()}
				{this.isEdit() && <NewBrewNavItem />}
				<Nav.item newTab={true} href={`/share/${this.processShareId()}`} color='teal' icon='fas fa-share-alt'>
					Share
				</Nav.item>
				<PrintLinkNavItem shareId={this.processShareId()} />
				<ReportIssueNavItem />
				<RecentNavItem brew={this.state.brew} storageKey='edit' />
				<AccountNavItem />
			</Nav.section>

		</Navbar>;
	},

	render : function(){
		return <div className='editPage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
			{this.renderNavbar()}

			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
					<Editor
						ref='editor'
						brew={this.state.brew}
						onTextChange={this.handleTextChange}
						onStyleChange={this.handleStyleChange}
						onMetaChange={this.handleMetaChange}
						renderer={this.state.brew.renderer}
					/>
					<BrewRenderer text={this.state.brew.text} style={this.state.brew.style} renderer={this.state.brew.renderer} errors={this.state.htmlErrors} />
				</SplitPane>
			</div>
		</div>;
	}
});

module.exports = EditPage;
