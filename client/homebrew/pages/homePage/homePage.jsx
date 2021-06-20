require('./homePage.less');
const React = require('react');
const createClass = require('create-react-class');
const cx = require('classnames');
const request = require('superagent');
const { Meta } = require('vitreum/headtags');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const NewBrewItem = require('../../navbar/newbrew.navitem.jsx');
const IssueNavItem = require('../../navbar/issue.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const AccountNavItem = require('../../navbar/account.navitem.jsx');


const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');



const HomePage = createClass({
	getDefaultProps : function() {
		return {
			brew : {
				text : ''
			},
			welcomeText : '',
			ver         : '0.0.0'
		};


	},
	getInitialState : function() {
		return {
			brew : {
				text : this.props.welcomeText
			}
		};
	},
	handleSave : function(){
		request.post('/api')
			.send({
				text : this.state.brew.text
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
			brew : { text: text }
		});
	},
	renderNavbar : function(){
		return <Navbar ver={this.props.ver}>
			<Nav.section>
				<NewBrewItem />
				<IssueNavItem />
				<Nav.item newTab={true} href='/changelog' color='purple' icon='far fa-file-alt'>
					Changelog
				</Nav.item>
				<RecentNavItem />
				<AccountNavItem />
			</Nav.section>
		</Navbar>;
	},

	render : function(){
		return <div className='homePage page'>
			<Meta name='google-site-verification' content='NwnAQSSJZzAT7N-p5MY6ydQ7Njm67dtbu73ZSyE5Fy4' />
			{this.renderNavbar()}

			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
					<Editor
						ref='editor'
						brew={this.state.brew}
						onTextChange={this.handleTextChange}
						renderer={this.state.brew.renderer}
						showEditButtons={false}
					/>
					<BrewRenderer text={this.state.brew.text} />
				</SplitPane>
			</div>

			<div className={cx('floatingSaveButton', { show: this.props.welcomeText != this.state.brew.text })} onClick={this.handleSave}>
				Save current <i className='fas fa-save' />
			</div>

			<a href='/new' className='floatingNewButton'>
				Create your own <i className='fas fa-magic' />
			</a>
		</div>;
	}
});

module.exports = HomePage;
