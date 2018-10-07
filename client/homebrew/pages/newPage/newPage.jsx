const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');
const request = require('superagent');

const Markdown = require('naturalcrit/markdown.js');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const AccountNavItem = require('../../navbar/account.navitem.jsx');
const IssueNavItem = require('../../navbar/issue.navitem.jsx');

const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');


const KEY = 'homebrewery-new';

const NewPage = createClass({
	getInitialState : function() {
		return {
			metadata : {
				title       : '',
				description : '',
				tags        : '',
				published   : false,
				authors     : [],
				systems     : []
			},

			text     : '',
			isSaving : false,
			errors   : []
		};
	},
	componentDidMount : function() {
		const storage = localStorage.getItem(KEY);
		if(storage){
			this.setState({
				text : storage
			});
		}
		document.addEventListener('keydown', this.handleControlKeys);
	},
	componentWillUnmount : function() {
		document.removeEventListener('keydown', this.handleControlKeys);
	},

	handleControlKeys : function(e){
		if(!(e.ctrlKey || e.metaKey)) return;
		const S_KEY = 83;
		const P_KEY = 80;
		if(e.keyCode == S_KEY) this.save();
		if(e.keyCode == P_KEY) this.print();
		if(e.keyCode == P_KEY || e.keyCode == S_KEY){
			e.stopPropagation();
			e.preventDefault();
		}
	},

	handleSplitMove : function(){
		this.refs.editor.update();
	},

	handleMetadataChange : function(metadata){
		this.setState({
			metadata : _.merge({}, this.state.metadata, metadata)
		});
	},

	handleTextChange : function(text){
		this.setState({
			text   : text,
			errors : Markdown.validate(text)
		});
		localStorage.setItem(KEY, text);
	},

	save : function(){
		this.setState({
			isSaving : true
		});

		request.post('/api')
			.send(_.merge({}, this.state.metadata, {
				text : this.state.text
			}))
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
				window.location = `/edit/${brew.editId}`;
			});
	},

	renderSaveButton : function(){
		if(this.state.isSaving){
			return <Nav.block icon='fa-spinner fa-spin' className='saveButton'>
				save...
			</Nav.block>;
		} else {
			return <Nav.block icon='fa-save' className='saveButton' onClick={this.save}>
				save
			</Nav.block>;
		}
	},

	print : function(){
		localStorage.setItem('print', this.state.text);
		window.open('/print?dialog=true&local=print', '_blank');
	},

	renderLocalPrintButton : function(){
		return <Nav.block color='purple' icon='fa-file-pdf-o' onClick={this.print}>
			get PDF
		</Nav.block>;
	},

	renderNavbar : function(){
		return <Navbar>

			<Nav.section>
				<Nav.block className='brewTitle'>{this.state.metadata.title}</Nav.block>
			</Nav.section>

			<Nav.section>
				{this.renderSaveButton()}
				{this.renderLocalPrintButton()}
				<IssueNavItem />
				<AccountNavItem />
			</Nav.section>
		</Navbar>;
	},

	render : function(){
		return <div className='newPage page'>
			{this.renderNavbar()}
			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
					<Editor
						ref='editor'
						value={this.state.text}
						onChange={this.handleTextChange}
						metadata={this.state.metadata}
						onMetadataChange={this.handleMetadataChange}
					/>
					<BrewRenderer text={this.state.text} errors={this.state.errors} />
				</SplitPane>
			</div>
		</div>;
	}
});

module.exports = NewPage;
