const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');
const request = require('superagent');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const ReportIssue = require('../../navbar/issue.navitem.jsx');
const PrintLink = require('../../navbar/print.navitem.jsx');
const Account = require('../../navbar/account.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;

const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const Markdown = require('naturalcrit/markdown.js');

const SAVE_TIMEOUT = 3000;


const EditPage = createClass({
	getDefaultProps : function() {
		return {
			brew : {
				text      : '',
				shareId   : null,
				editId    : null,
				createdAt : null,
				updatedAt : null,

				title       : '',
				description : '',
				tags        : '',
				published   : false,
				authors     : [],
				systems     : []
			}
		};
	},

	getInitialState : function() {
		return {
			brew : this.props.brew,

			isSaving   : false,
			isPending  : false,
			errors     : null,
			htmlErrors : Markdown.validate(this.props.brew.text),
		};
	},
	savedBrew : null,

	componentDidMount : function(){
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
		if(e.keyCode == P_KEY) window.open(`/print/${this.props.brew.shareId}?dialog=true`, '_blank').focus();
		if(e.keyCode == P_KEY || e.keyCode == S_KEY){
			e.stopPropagation();
			e.preventDefault();
		}
	},

	handleSplitMove : function(){
		this.refs.editor.update();
	},

	handleMetadataChange : function(metadata){
		this.setState((prevState)=>({
			brew      : _.merge({}, prevState.brew, metadata),
			isPending : true,
		}), ()=>this.trySave());

	},

	handleTextChange : function(text){

		//If there are errors, run the validator on everychange to give quick feedback
		let htmlErrors = this.state.htmlErrors;
		if(htmlErrors.length) htmlErrors = Markdown.validate(text);

		this.setState((prevState)=>({
			brew       : _.merge({}, prevState.brew, { text: text }),
			isPending  : true,
			htmlErrors : htmlErrors
		}), ()=>this.trySave());
	},

	hasChanges : function(){
		const savedBrew = this.savedBrew ? this.savedBrew : this.props.brew;
		return !_.isEqual(this.state.brew, savedBrew);
	},

	trySave : function(){
		if(!this.debounceSave) this.debounceSave = _.debounce(this.save, SAVE_TIMEOUT);
		if(this.hasChanges()){
			this.debounceSave();
		} else {
			this.debounceSave.cancel();
		}
	},

	save : function(){
		if(this.debounceSave && this.debounceSave.cancel) this.debounceSave.cancel();

		this.setState((prevState)=>({
			isSaving   : true,
			errors     : null,
			htmlErrors : Markdown.validate(prevState.brew.text)
		}));

		request
			.put(`/api/update/${this.props.brew.editId}`)
			.send(this.state.brew)
			.end((err, res)=>{
				if(err){
					this.setState({
						errors : err,
					});
				} else {
					this.savedBrew = res.body;
					this.setState({
						isPending : false,
						isSaving  : false,
					});
				}
			});
	},

	renderSaveButton : function(){
		if(this.state.errors){
			let errMsg = '';
			try {
				errMsg += `${this.state.errors.toString()}\n\n`;
				errMsg += `\`\`\`\n${JSON.stringify(this.state.errors.response.error, null, '  ')}\n\`\`\``;
			} catch (e){}

			return <Nav.item className='save error' icon='fa-warning'>
				Oops!
				<div className='errorContainer'>
					Looks like there was a problem saving. <br />
					Report the issue <a target='_blank' rel='noopener noreferrer'
						href={`https://github.com/stolksdorf/naturalcrit/issues/new?body=${encodeURIComponent(errMsg)}`}>
						here
					</a>.
				</div>
			</Nav.item>;
		}

		if(this.state.isSaving){
			return <Nav.item className='save' icon='fa-spinner fa-spin'>saving...</Nav.item>;
		}
		if(this.state.isPending && this.hasChanges()){
			return <Nav.item className='save' onClick={this.save} color='blue' icon='fa-save'>Save Now</Nav.item>;
		}
		if(!this.state.isPending && !this.state.isSaving){
			return <Nav.item className='save saved'>saved.</Nav.item>;
		}
	},
	renderNavbar : function(){
		return <Navbar>
			<Nav.section>
				<Nav.item className='brewTitle'>{this.state.brew.title}</Nav.item>
			</Nav.section>

			<Nav.section>
				{this.renderSaveButton()}
				<ReportIssue />
				<Nav.item newTab={true} href={`/share/${this.props.brew.shareId}`} color='teal' icon='fa-share-alt'>
					Share
				</Nav.item>
				<PrintLink shareId={this.props.brew.shareId} />
				<RecentNavItem brew={this.props.brew} storageKey='edit' />
				<Account />
			</Nav.section>
		</Navbar>;
	},

	render : function(){
		return <div className='editPage page'>
			{this.renderNavbar()}

			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
					<Editor
						ref='editor'
						value={this.state.brew.text}
						onChange={this.handleTextChange}
						metadata={this.state.brew}
						onMetadataChange={this.handleMetadataChange}
					/>
					<BrewRenderer text={this.state.brew.text} errors={this.state.htmlErrors} />
				</SplitPane>
			</div>
		</div>;
	}
});

module.exports = EditPage;
