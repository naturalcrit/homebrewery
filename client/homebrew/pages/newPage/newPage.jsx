const React = require('react');
const _ = require('lodash');
const cx = require('classnames');
const request = require("superagent");

const Markdown = require('naturalcrit/markdown.js');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const EditTitle = require('../../navbar/editTitle.navitem.jsx');
const IssueNavItem = require('../../navbar/issue.navitem.jsx');

const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');


const KEY = 'homebrewery-new';

const NewPage = React.createClass({
	getInitialState: function() {
		return {
			title : '',
			text: '',
			isSaving : false,
			errors : []
		};
	},


	componentDidMount: function() {
		const storage = localStorage.getItem(KEY);
		if(storage){
			this.setState({
				text : storage
			})
		}
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
			text : text,
			errors : Markdown.validate(text)
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
				const brew = res.body;
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

	handlePrintClick : function(){
		localStorage.setItem('print', this.state.text);
		window.open('/print?dialog=true&local=print','_blank');
	},

	renderLocalPrintButton : function(){
		return <Nav.item color='purple' icon='fa-file-pdf-o' onClick={this.handlePrintClick}>
			get PDF
		</Nav.item>
	},

	renderNavbar : function(){
		return <Navbar ver={this.props.ver}>
			<Nav.section>
				<EditTitle title={this.state.title} onChange={this.handleTitleChange} />
			</Nav.section>

			<Nav.section>
				{this.renderSaveButton()}
				{this.renderLocalPrintButton()}
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
					<BrewRenderer text={this.state.text} errors={this.state.errors} />
				</SplitPane>
			</div>
		</div>
	}
});

module.exports = NewPage;
