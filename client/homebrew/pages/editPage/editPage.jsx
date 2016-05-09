var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var request = require("superagent");


var Nav = require('naturalcrit/nav/nav.jsx');
var Navbar = require('../../navbar/navbar.jsx');

var EditTitle = require('../../navbar/editTitle.navitem.jsx');


var SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
var Editor = require('../../editor/editor.jsx');
var BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');






var Statusbar = require('../../statusbar/statusbar.jsx');
var PageContainer = require('../../pageContainer/pageContainer.jsx');
var Editor = require('../../editor/editor.jsx');




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
			errors : null,
			pending : false,

			lastUpdated : this.props.brew.updatedAt
		};
	},

	componentDidMount: function() {
		var self = this;
		window.onbeforeunload = function(){
			if(!self.state.pending) return;
			return "You have unsaved changes!";
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
			pending : true
		});
		this.save();
	},

	handleTextChange : function(text){
		this.setState({
			text : text,
			pending : true
		});
		this.save();
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

	save : _.debounce(function(){
		request
			.put('/homebrew/api/update/' + this.props.id)
			.send({text : this.state.text})
			.end((err, res) => {
				this.setState({
					pending : false,
					lastUpdated : res.body.updatedAt
				})
			})
	}, SAVE_TIMEOUT),



	renderNavbar : function(){
		return <Navbar>
			<Nav.section>
				<EditTitle title={this.state.title} onChange={this.handleTitleChange} />
			</Nav.section>

			<Nav.section>
				<Nav.item newTab={true} href='https://github.com/stolksdorf/naturalcrit/issues' color='red' icon='fa-bug'>
					report issue
				</Nav.item>

				<Nav.item newTab={true} href={'/homebrew/share/' + this.props.brew.shareId} color='teal' icon='fa-share'>
					Share
				</Nav.item>

				<Nav.item newTab={true} href={'/homebrew/print/' + this.props.brew.sharedId} color='orange' icon='fa-print'>
					print
				</Nav.item>

				<Nav.item color='lightred' icon='fa-trash' onClick={this.handleDelete}>
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
