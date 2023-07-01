/* eslint-disable max-lines */
require('./editPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const request = require('../../utils/request-middleware.js');
const { Meta } = require('vitreum/headtags');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const NewBrew = require('../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../navbar/help.navitem.jsx');
const PrintLink = require('../../navbar/print.navitem.jsx');
const ErrorNavItem = require('../../navbar/error-navitem.jsx');
const Account = require('../../navbar/account.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;

const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const Markdown = require('naturalcrit/markdown.js');

const { DEFAULT_BREW_LOAD } = require('../../../../server/brewDefaults.js');


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
			alertLoginToTransfer   : false,
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
				return 'Du hast ungespeicherte Änderungen!';
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

	handleSplitMove : function(){
		this.refs.editor.update();
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

	closeAlerts : function(event){
		event.stopPropagation();	//Only handle click once so alert doesn't reopen
		this.setState({
			alertLoginToTransfer   : false,
		});
	},


	save : async function(){
		if(this.debounceSave && this.debounceSave.cancel) this.debounceSave.cancel();

		this.setState((prevState)=>({
			isSaving   : true,
			error      : null,
			htmlErrors : Markdown.validate(prevState.brew.text)
		}));

		const brew = this.state.brew;
		brew.pageCount = ((brew.renderer=='legacy' ? brew.text.match(/\\page/g) : brew.text.match(/^\\page$/gm)) || []).length + 1;

		const params = '';
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
				editId 	 : this.savedBrew.editId,
				shareId  : this.savedBrew.shareId,
				version  : this.savedBrew.version
			},
			isPending   : false,
			isSaving    : false,
			unsavedTime : new Date()
		}));
	},


	renderSaveButton : function(){
		if(this.state.autoSaveWarning && this.hasChanges()){
			this.setAutosaveWarning();
			const elapsedTime = Math.round((new Date() - this.state.unsavedTime) / 1000 / 60);
			const text = elapsedTime == 0 ? 'Auto-Save ist AUS.' : `Auto-Save ist AUS und du hast seit ${elapsedTime} Minutes nicht gespeichert.`;

			return <Nav.item className='save error' icon='fas fa-exclamation-circle'>
			Reminder...
				<div className='errorContainer'>
					{text}
				</div>
			</Nav.item>;
		}

		if(this.state.isSaving){
			return <Nav.item className='save' icon='fas fa-spinner fa-spin'>speichern...</Nav.item>;
		}
		if(this.state.isPending && this.hasChanges()){
			return <Nav.item className='save' onClick={this.save} color='blue' icon='fas fa-save'>Jetzt speichern</Nav.item>;
		}
		if(!this.state.isPending && !this.state.isSaving && this.state.autoSave){
			return <Nav.item className='save saved'>auto-save.</Nav.item>;
		}
		if(!this.state.isPending && !this.state.isSaving){
			return <Nav.item className='save saved'>gespeichert.</Nav.item>;
		}
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
		return <Nav.item onClick={this.handleAutoSave}>
			Auto-Save <i className={this.state.autoSave ? 'fas fa-power-off active' : 'fas fa-power-off'}></i>
		</Nav.item>;
	},

	processShareId : function() {
		return this.state.brew.shareId;
	},

	getRedditLink : function(){

		const shareLink = this.processShareId();
		const systems = this.props.brew.systems.length > 0 ? ` [${this.props.brew.systems.join(' - ')}]` : '';
		const title = `${this.props.brew.title} ${systems}`;
		const text = `Hey Leute! Ich habe hier was zusammengebraut. Ich würde mich über Feedback freuen. Sehts euch an!.

**[Brauerei Link](${global.config.publicUrl}/share/${shareLink})**`;

		return `https://www.reddit.com/r/Ilaris/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
	},

	renderNavbar : function(){
		const shareLink = this.processShareId();

		return <Navbar>
			<Nav.section>
				<Nav.item className='brewTitle'>{this.state.brew.title}</Nav.item>
			</Nav.section>

			<Nav.section>
				{this.state.error ?
					<ErrorNavItem error={this.state.error} parent={this}></ErrorNavItem> :
					<Nav.dropdown className='save-menu'>
						{this.renderSaveButton()}
						{this.renderAutoSaveButton()}
					</Nav.dropdown>
				}
				<NewBrew />
				<HelpNavItem/>
				<Nav.dropdown>
					<Nav.item color='teal' icon='fas fa-share-alt'>
						Teilen
					</Nav.item>
					<Nav.item color='blue' href={`/share/${shareLink}`}>
						Anschauen
					</Nav.item>
					<Nav.item color='blue' onClick={()=>{navigator.clipboard.writeText(`${global.config.publicUrl}/share/${shareLink}`);}}>
						URL kopieren
					</Nav.item>
					{/*<Nav.item color='blue' href={this.getRedditLink()} newTab={true} rel='noopener noreferrer'>
						post to reddit
					</Nav.item>
					*/}
				</Nav.dropdown>
				<PrintLink shareId={this.processShareId()} />
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
		</div>;
	}
});

module.exports = EditPage;
