var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var request = require("superagent");

var Nav = require('naturalcrit/nav/nav.jsx');
var Navbar = require('../../navbar/navbar.jsx');

var EditTitle = require('../../navbar/editTitle.navitem.jsx');
var ReportIssue = require('../../navbar/issue.navitem.jsx');
var PrintLink = require('../../navbar/print.navitem.jsx');


var SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
var Editor = require('../../editor/editor.jsx');
var BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');



const SAVE_TIMEOUT = 3000;



var EditPage = React.createClass({
	getDefaultProps: function() {
		return {
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

			lastUpdated : this.props.brew.updatedAt
		};
	},

	savedBrew : null,


	componentDidMount: function(){
		this.debounceSave = _.debounce(this.save, SAVE_TIMEOUT);

		window.onbeforeunload = ()=>{
			//do state checks

			//return "You have unsaved changes!";
		}
	},
	componentWillUnmount: function() {
		window.onbeforeunload = function(){};
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
		this.setState({
			text : text,
			isPending : true
		});

		(this.hasChanges() ? this.debounceSave() : this.debounceSave.cancel());
	},

	handleDelete : function(){
		if(!confirm("are you sure you want to delete this brew?")) return;
		if(!confirm("are you REALLY sure? You will not be able to recover it")) return;

		request.get('/homebrew/api/remove/' + this.props.brew.editId)
			.send()
			.end(function(err, res){
				window.location.href = '/homebrew';
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
		console.log('saving!');
		this.debounceSave.cancel();
		this.setState({
			isSaving : true
		});

		request
			.put('/homebrew/api/update/' + this.props.brew.editId)
			.send({text : this.state.text})
			.end((err, res) => {
				console.log('done', res.body);
				this.savedBrew = res.body;
				this.setState({
					isPending : false,
					isSaving : false,
					lastUpdated : res.body.updatedAt
				})
			})
	},

	renderSaveButton : function(){

		if(this.state.isSaving){
			return <Nav.item icon="fa-spinner fa-spin">saving...</Nav.item>
		}


		if(!this.state.isPending && !this.state.isSaving){
			return <Nav.item>saved.</Nav.item>
		}

		if(this.state.isPending && this.hasChanges()){
			return <Nav.item onClick={this.save} color='blue'>Save Now</Nav.item>
		}

	},



	renderNavbar : function(){
		return <Navbar>
			<Nav.section>
				<EditTitle title={this.state.title} onChange={this.handleTitleChange} />
			</Nav.section>

			<Nav.section>
				{this.renderSaveButton()}

				<Nav.item newTab={true} href={'/homebrew/share/' + this.props.brew.shareId} color='teal' icon='fa-share'>
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
					<BrewRenderer text={this.state.text} />
				</SplitPane>
			</div>
		</div>
	}
});

module.exports = EditPage;
