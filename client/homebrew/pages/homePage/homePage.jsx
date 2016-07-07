var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var request = require("superagent");

var Nav = require('naturalcrit/nav/nav.jsx');
var Navbar = require('../../navbar/navbar.jsx');
var PatreonNavItem = require('../../navbar/patreon.navitem.jsx');
var IssueNavItem = require('../../navbar/issue.navitem.jsx');
var RecentNavItem = require('../../navbar/recent.navitem.jsx');


var SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
var Editor = require('../../editor/editor.jsx');
var BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');



var HomePage = React.createClass({
	getDefaultProps: function() {
		return {
			welcomeText : ""
		};
	},
	getInitialState: function() {
		return {
			text: this.props.welcomeText
		};
	},
	handleSave : function(){
		request.post('/api')
			.send({
				title : 'Change This',
				text : this.state.text
			})
			.end((err, res)=>{
				if(err) return;
				var brew = res.body;
				window.location = '/edit/' + brew.editId;
			});
	},
	handleSplitMove : function(){
		this.refs.editor.update();
	},
	handleTextChange : function(text){
		this.setState({
			text : text
		});
	},
	renderNavbar : function(){
		return <Navbar>
			<Nav.section>
				<PatreonNavItem />
				<IssueNavItem />
				<Nav.item newTab={true} href='/changelog' color='purple' icon='fa-file-text-o'>
					Changelog
				</Nav.item>
				<RecentNavItem.both />
				<Nav.item href='/new' color='green' icon='fa-external-link'>
					New Brew
				</Nav.item>
			</Nav.section>
		</Navbar>
	},

	render : function(){
		return <div className='homePage page'>
			{this.renderNavbar()}

			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
					<Editor value={this.state.text} onChange={this.handleTextChange} ref='editor'/>
					<BrewRenderer text={this.state.text} />
				</SplitPane>
			</div>

			<div className={cx('floatingSaveButton', {show : this.props.welcomeText != this.state.text})} onClick={this.handleSave}>
				Save current <i className='fa fa-save' />
			</div>

			<a href='/new' className='floatingNewButton'>
				Create your own <i className='fa fa-magic' />
			</a>
		</div>
	}
});

module.exports = HomePage;
