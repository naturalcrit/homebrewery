/* eslint-disable max-lines */
require('./editorPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const request = require('superagent');
const { Meta } = require('vitreum/headtags');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../../navbar/navbar.jsx');

const ReportIssue = require('../../../navbar/issue.navitem.jsx');
const Account = require('../../../navbar/account.navitem.jsx');
const RecentNavItem = require('../../../navbar/recent.navitem.jsx').both;

const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../../../editor/editor.jsx');
const BrewRenderer = require('../../../brewRenderer/brewRenderer.jsx');

const Markdown = require('naturalcrit/markdown.js');

const googleDriveActive = require('../../../googleDrive.png');
const googleDriveInactive = require('../../../googleDriveMono.png');

const SAVE_TIMEOUT = 3000;

const BREWKEY = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY = 'homebrewery-new-meta';

const EditorPage = createClass({
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
			},
			pageType           : 'edit',
			googleDriveOptions : [
				'DRIVE > HB',
				'HB > DRIVE'
			],
			printLink   : '',
			navElements : ''
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
			errors                 : null,
			htmlErrors             : Markdown.validate(this.props.brew.text),
			url                    : '',
		};
		// return {
		// 	brew : {
		// 		text        : brew.text || '',
		// 		style       : brew.style || undefined,
		// 		gDrive      : false,
		// 		title       : brew.title || '',
		// 		description : brew.description || '',
		// 		tags        : brew.tags || '',
		// 		published   : false,
		// 		authors     : [],
		// 		systems     : brew.systems || [],
		// 		renderer    : brew.renderer || 'legacy'
		// 	},

		// 	isSaving               : false,
		// 	isPending              : false,
		// 	alertTrashedGoogleBrew : this.props.brew.trashed,
		// 	alertLoginToTransfer   : false,
		// 	saveGoogle             : (global.account && global.account.googleId ? true : false),
		// 	confirmGoogleTransfer  : false,
		// 	errors                 : null,
		// 	htmlErrors             : Markdown.validate(brew.text),
		// 	url                    : ''
		// };
	},
	savedBrew : null,

	componentDidMount : function(){
		this.setState({
			url : window.location.href
		});

		this.savedBrew = JSON.parse(JSON.stringify(this.props.brew)); //Deep copy

		this.trySave();
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
		if(e.keyCode == P_KEY) window.open(this.props.printLink, '_blank').focus();
		if(e.keyCode == P_KEY || e.keyCode == S_KEY){
			e.stopPropagation();
			e.preventDefault();
		}
	},

	isEdit : function(){
		return this.props.pageType == 'edit';
	},

	isNew : function(){
		return this.props.pageType == 'new';
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

	localSave : function(){
		if(this.state.brew.text) localStorage.setItem(BREWKEY, this.state.brew.text);
		if(this.state.brew.style) localStorage.setItem(STYLEKEY, this.state.brew.style);
		localStorage.setItem(METAKEY, JSON.stringify({
			renderer : (this.state.brew.renderer || 'legacy')
		}));
	},

	hasChanges : function(){
		return !_.isEqual(this.state.brew, this.savedBrew);
	},

	trySave : function(){
		if(this.isEdit() && !this.debounceSave) this.debounceSave = _.debounce(this.save, SAVE_TIMEOUT);
		if(this.isNew() && !this.debounceSave) this.debounceSave = _.debounce(this.localSave, SAVE_TIMEOUT);
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
		}), ()=>this.isEdit() && this.save());
	},

	clearErrors : function(){
		this.setState({
			errors   : null,
			isSaving : false

		});
	},

	save : async function(){
		this.setState((prevState)=>({
			isSaving   : true,
			errors     : null,
			htmlErrors : Markdown.validate(prevState.brew.text)
		}));

		if(this.isEdit()){
			if(this.debounceSave && this.debounceSave.cancel) this.debounceSave.cancel();

			const transfer = this.state.saveGoogle == _.isNil(this.state.brew.googleId);

			const brew = this.state.brew;
			brew.pageCount = ((brew.renderer=='legacy' ? brew.text.match(/\\page/g) : brew.text.match(/^\\page$/gm)) || []).length + 1;

			if(this.state.saveGoogle) {
				if(transfer) {
					const res = await request
					.post('/api/newGoogle/')
					.send(brew)
					.catch((err)=>{
						console.log(err.status === 401
							? 'Not signed in!'
							: 'Error Transferring to Google!');
						this.setState({ errors: err, saveGoogle: false });
					});

					if(!res) { return; }

					console.log('Deleting Local Copy');
					await request.delete(`/api/${brew.editId}`)
					.send()
					.catch((err)=>{
						console.log('Error deleting Local Copy');
					});

					this.savedBrew = res.body;
					history.replaceState(null, null, `/edit/${this.savedBrew.googleId}${this.savedBrew.editId}`); //update URL to match doc ID
				} else {
					const res = await request
					.put(`/api/updateGoogle/${brew.editId}`)
					.send(brew)
					.catch((err)=>{
						console.log(err.status === 401
							? 'Not signed in!'
							: 'Error Saving to Google!');
						this.setState({ errors: err });
						return;
					});

					this.savedBrew = res.body;
				}
			} else {
				if(transfer) {
					const res = await request.post('/api')
					.send(brew)
					.catch((err)=>{
						console.log('Error creating Local Copy');
						this.setState({ errors: err });
						return;
					});

					await request.get(`/api/removeGoogle/${brew.googleId}${brew.editId}`)
					.send()
					.catch((err)=>{
						console.log('Error Deleting Google Brew');
					});

					this.savedBrew = res.body;
					history.replaceState(null, null, `/edit/${this.savedBrew.editId}`); //update URL to match doc ID
				} else {
					const res = await request
					.put(`/api/update/${brew.editId}`)
					.send(brew)
					.catch((err)=>{
						console.log('Error Updating Local Brew');
						this.setState({ errors: err });
						return;
					});

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
		}

		if(this.isNew()){
			console.log('saving new brew');

			let brew = this.state.brew;
			// Split out CSS to Style if CSS codefence exists
			if(brew.text.startsWith('```css') && brew.text.indexOf('```\n\n') > 0) {
				const index = brew.text.indexOf('```\n\n');
				brew.style = `${brew.style ? `${brew.style}\n` : ''}${brew.text.slice(7, index - 1)}`;
				brew.text = brew.text.slice(index + 5);
			};

			brew.pageCount=((brew.renderer=='legacy' ? brew.text.match(/\\page/g) : brew.text.match(/^\\page$/gm)) || []).length + 1;

			if(this.state.saveGoogle) {
				const res = await request
				.post('/api/newGoogle/')
				.send(brew)
				.catch((err)=>{
					console.log(err.status === 401
						? 'Not signed in!'
						: 'Error Creating New Google Brew!');
					this.setState({ isSaving: false, errors: err });
					return;
				});
				window.onbeforeunload = function(){};
				brew = res.body;
				localStorage.removeItem(BREWKEY);
				localStorage.removeItem(STYLEKEY);
				localStorage.removeItem(METAKEY);
				window.location = `/edit/${brew.googleId}${brew.editId}`;
			} else {
				request.post('/api')
				.send(brew)
				.end((err, res)=>{
					if(err){
						this.setState({
							isSaving : false
						});
						return;
					}
					window.onbeforeunload = function(){};
					brew = res.body;
					localStorage.removeItem(BREWKEY);
					localStorage.removeItem(STYLEKEY);
					localStorage.removeItem(METAKEY);
					window.location = `/edit/${brew.editId}`;
				});
			}
		}
	},

	renderGoogleDriveIcon : function(){
		return <Nav.item className='googleDriveStorage' onClick={this.handleGoogleClick}>
			{this.state.saveGoogle
				? <img src={googleDriveActive} alt='googleDriveActive'/>
				: <img src={googleDriveInactive} alt='googleDriveInactive'/>
			}

			{this.state.confirmGoogleTransfer &&
				<div className='errorContainer' onClick={this.closeAlerts}>
					{ this.state.saveGoogle
						?	this.props.googleDriveOptions[0]
						: this.props.googleDriveOptions[1]
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
		</Nav.item>;
	},

	renderSaveButton : function(){
		if(this.state.errors){
			let errMsg = '';
			try {
				errMsg += `${this.state.errors.toString()}\n\n`;
				errMsg += `\`\`\`\n${this.state.errors.stack}\n`;
				errMsg += `${JSON.stringify(this.state.errors.response.error, null, '  ')}\n\`\`\``;
				console.log(errMsg);
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

			if(this.state.errors.status == '403' && this.state.errors.response.body.errors[0].reason == 'insufficientPermissions'){
				return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
					Oops!
					<div className='errorContainer' onClick={this.clearErrors}>
					Looks like your Google credentials have
					expired! Visit the log in page to sign out
					and sign back in with Google
					to save this to Google Drive!
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
		if(this.state.isPending && this.hasChanges()){
			return <Nav.item className='save' onClick={this.save} color='blue' icon='fas fa-save'>Save Now</Nav.item>;
		}
		if(!this.state.isPending && !this.state.isSaving){
			return <Nav.item className='save saved'>saved.</Nav.item>;
		}
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
				{this.props.navElements}
				<ReportIssue />
				<RecentNavItem brew={this.state.brew} storageKey='edit' />
				<Account />
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

module.exports = EditorPage;
