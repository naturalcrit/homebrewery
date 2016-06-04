var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var request = require("superagent");

var Nav = require('naturalcrit/nav/nav.jsx');
var Navbar = require('../../navbar/navbar.jsx');
var EditTitle = require('../../navbar/editTitle.navitem.jsx');
var IssueNavItem = require('../../navbar/issue.navitem.jsx');


var SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
var Editor = require('../../editor/editor.jsx');
var BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');


const KEY = 'naturalCrit-homebrew-new';

var NewPage = React.createClass({
	getInitialState: function() {
		return {
			title : 'My Awesome Brew v99',
			text: '',
			isSaving : false
		};
	},


	componentDidMount: function() {
		var storage = localStorage.getItem(KEY);
		if(storage){
			this.setState({
				text : storage
			})
		}
		window.onbeforeunload = (e)=>{
			if(this.state.text == '') return;
			return "Your homebrew isn't saved. Are you sure you want to leave?";
		};
	},


	componentWillUnmount: function() {
		window.onbeforeunload = function(){};
	},

	handleSplitMove : function(){
		this.refs.editor.update();
	},

	handleTitleChange : function(title){
		this.setState({
			title : title
		});
	},

	handleTextChange : function(text){
		this.setState({
			text : text
		});
		localStorage.setItem(KEY, text);
	},

	handleSave : function(){
		this.setState({
			isSaving : true
		});
		request.post('/api')
			.send({
				title : this.state.title,
				text : this.state.text
			})
			.end((err, res)=>{

				if(err){
					this.setState({
						isSaving : false
					});
					return;
				}
				window.onbeforeunload = function(){};
				var brew = res.body;
				localStorage.removeItem(KEY);
				window.location = '/edit/' + brew.editId;
			})
	},

	renderSaveButton : function(){
		if(this.state.isSaving){
			return <Nav.item icon='fa-spinner fa-spin' className='saveButton'>
				save...
			</Nav.item>
		}else{
			return <Nav.item icon='fa-save' className='saveButton' onClick={this.handleSave}>
				save
			</Nav.item>
		}
	},

	renderNavbar : function(){
		return <Navbar>
			<Nav.section>
				<EditTitle title={this.state.title} onChange={this.handleTitleChange} />
			</Nav.section>

			<Nav.section>
				{this.renderSaveButton()}
				<IssueNavItem />
			</Nav.section>
		</Navbar>
	},

	render : function(){
		return <div className='newPage page'>
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

module.exports = NewPage;
