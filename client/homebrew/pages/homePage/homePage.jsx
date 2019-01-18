const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');
const request = require('superagent');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const PatreonNavItem = require('../../navbar/patreon.navitem.jsx');
const IssueNavItem = require('../../navbar/issue.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const AccountNavItem = require('../../navbar/account.navitem.jsx');


const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');



const HomePage = createClass({
	getDefaultProps : function() {
		return {
			welcomeText : '',
			ver         : '0.0.0'
		};


	},
	getInitialState : function() {
		return {
			text : this.props.welcomeText
		};
	},
	handleSave : function(){
		request.post('/api')
			.send({
				text : this.state.text
			})
			.end((err, res)=>{
				if(err) return;
				const brew = res.body;
				window.location = `/edit/${brew.editId}`;
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
		return <Navbar ver={this.props.ver}>
			<Nav.section>
				<PatreonNavItem />
				<IssueNavItem />
				<Nav.item newTab={true} href='/changelog' color='purple' icon='fa-file-text-o'>
					Changelog
				</Nav.item>
				<RecentNavItem />
				<AccountNavItem />
				{/*}
				<Nav.item href='/new' color='green' icon='fa-external-link'>
					New Brew
				</Nav.item>
				*/}
			</Nav.section>
		</Navbar>;
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

			<div className={cx('floatingSaveButton', { show: this.props.welcomeText != this.state.text })} onClick={this.handleSave}>
				Save current <i className='fa fa-save' />
			</div>

			<a href='/new' className='floatingNewButton'>
				Create your own <i className='fa fa-magic' />
			</a>
		</div>;
	}
});

module.exports = HomePage;
