var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var request = require("superagent");

var Nav = require('naturalcrit/nav/nav.jsx');
var Navbar = require('../../navbar/navbar.jsx');

var EditTitle = require('../../navbar/editTitle.navitem.jsx');
var ReportIssue = require('../../navbar/issue.navitem.jsx');
var PrintLink = require('../../navbar/print.navitem.jsx');
var RecentlyEdited = require('../../navbar/recent.navitem.jsx').edited;


var SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
var Editor = require('../../editor/editor.jsx');
var BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

var HijackPrint = require('../hijackPrint.js');
var Markdown = require('naturalcrit/markdown.js');


const SAVE_TIMEOUT = 3000;



var EditPage = React.createClass({
	getDefaultProps: function() {
		return {
			ver : '0.0.0',
			id : null,
			brew : {
				title : '',
				text : '',
				shareId : null,
				editId : null,
				createdAt : null,
				updatedAt : null,
			}
		};
	},

	getInitialState: function() {
		return {
			title : this.props.brew.title,
			text: this.props.brew.text,
			isSaving : false,
			isPending : false,
			errors : null,
			htmlErrors : [],
			lastUpdated : this.props.brew.updatedAt
		};
	},
	savedBrew : null,

	componentDidMount: function(){
		this.debounceSave = _.debounce(this.save, SAVE_TIMEOUT);
		window.onbeforeunload = ()=>{
			if(this.state.isSaving || this.state.isPending){
				return 'You have unsaved changes!';
			}
		};

		this.setState({
			htmlErrors : Markdown.validate(this.state.text)
		})

		document.onkeydown = HijackPrint(this.props.brew.shareId);
	},
	componentWillUnmount: function() {
		window.onbeforeunload = function(){};
		document.onkeydown = function(){};
	},

	handleSplitMove : function(){
		this.refs.editor.update();
	},

	handleTitleChange : function(title){
		this.setState({
			title : title,
			isPending : true
		});

		(this.hasChanges() ? this.debounceSave() : this.debounceSave.cancel());
	},

	handleTextChange : function(text){

		//If there are errors, run the validator on everychange to give quick feedback
		var htmlErrors = this.state.htmlErrors;
		if(htmlErrors.length) htmlErrors = Markdown.validate(text);

		this.setState({
			text : text,
			isPending : true,
			htmlErrors : htmlErrors
		});

		(this.hasChanges() ? this.debounceSave() : this.debounceSave.cancel());
	},

	handleDelete : function(){
		if(!confirm("are you sure you want to delete this brew?")) return;
		if(!confirm("are you REALLY sure? You will not be able to recover it")) return;

		request.get('/api/remove/' + this.props.brew.editId)
			.send()
			.end(function(err, res){
				window.location.href = '/';
			});
	},

	hasChanges : function(){
		if(this.savedBrew){
			if(this.state.text !== this.savedBrew.text) return true;
			if(this.state.title !== this.savedBrew.title) return true;
		}else{
			if(this.state.text !== this.props.brew.text) return true;
			if(this.state.title !== this.props.brew.title) return true;
		}
		return false;
	},

	save : function(){
		this.debounceSave.cancel();
		this.setState({
			isSaving : true,
			errors : null,
			htmlErrors : Markdown.validate(this.state.text)
		});

		request
			.put('/api/update/' + this.props.brew.editId)
			.send({
				text : this.state.text,
				title : this.state.title
			})
			.end((err, res) => {
				if(err){
					this.setState({
						errors : err,
					})
				}else{
					this.savedBrew = res.body;
					this.setState({
						isPending : false,
						isSaving : false,
						lastUpdated : res.body.updatedAt
					})
				}
			})
	},

	renderSaveButton : function(){
		if(this.state.errors){
			var errMsg = '';
			try{
				errMsg += this.state.errors.toString() + '\n\n';
				errMsg += '```\n' + JSON.stringify(this.state.errors.response.error, null, '  ') + '\n```';
			}catch(e){}


			return <Nav.item className='save error' icon="fa-warning">
				Oops!
				<div className='errorContainer'>
					Looks like there was a problem saving. <br />
					Report the issue <a target='_blank' href={'https://github.com/stolksdorf/naturalcrit/issues/new?body='+ encodeURIComponent(errMsg)}>
						here
					</a>.
				</div>
			</Nav.item>
		}

		if(this.state.isSaving){
			return <Nav.item className='save' icon="fa-spinner fa-spin">saving...</Nav.item>
		}
		if(!this.state.isPending && !this.state.isSaving){
			return <Nav.item className='save saved'>saved.</Nav.item>
		}
		if(this.state.isPending && this.hasChanges()){
			return <Nav.item className='save' onClick={this.save} color='blue' icon='fa-save'>Save Now</Nav.item>
		}
	},
	renderNavbar : function(){
		return <Navbar ver={this.props.ver}>
			<Nav.section>
				<EditTitle title={this.state.title} onChange={this.handleTitleChange} />
			</Nav.section>
			<Nav.section>
				{this.renderSaveButton()}
				<RecentlyEdited brew={this.props.brew} />
				<Nav.item newTab={true} href={'/share/' + this.props.brew.shareId} color='teal' icon='fa-share-alt'>
					Share
				</Nav.item>
				<PrintLink shareId={this.props.brew.shareId} />
				<Nav.item color='red' icon='fa-trash' onClick={this.handleDelete}>
					Delete
				</Nav.item>
			</Nav.section>
		</Navbar>
	},

	render : function(){
		return <div className='editPage page'>
			{this.renderNavbar()}

			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
					<Editor value={this.state.text} onChange={this.handleTextChange} ref='editor'/>
					<BrewRenderer text={this.state.text} errors={this.state.htmlErrors} />
				</SplitPane>
			</div>
		</div>
	}
});

module.exports = EditPage;
