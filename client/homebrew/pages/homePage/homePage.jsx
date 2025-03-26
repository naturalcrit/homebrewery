require('./homePage.less');
const React = require('react');
const createClass = require('create-react-class');
const cx = require('classnames');
import request from '../../utils/request-middleware.js';
const { Meta } = require('vitreum/headtags');

const Nav = require('naturalcrit/nav/nav.jsx');
const { NavbarProvider } = require('../../navbar/navbarContext.jsx');
const {Navbar, NavSection, NavItem, Dropdown} = require('../../navbar/navbar.jsx');
const NewBrewItem = require('../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../navbar/help.navitem.jsx');
const VaultNavItem = require('../../navbar/vault.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const AccountNavItem = require('../../navbar/account.navitem.jsx');
const ErrorNavItem = require('../../navbar/error-navitem.jsx');
const PatreonNavItem = require('../../navbar/patreon.navitem.jsx');
const MainMenu = require('../../navbar/mainMenu.navitem.jsx');
const { fetchThemeBundle } = require('../../../../shared/helpers.js');

const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const { DEFAULT_BREW } = require('../../../../server/brewDefaults.js');

const HomePage = createClass({
	displayName     : 'HomePage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW
		};
	},
	getInitialState : function() {
		return {
			brew                       : this.props.brew,
			welcomeText                : this.props.brew.text,
			error                      : undefined,
			currentEditorViewPageNum   : 1,
			currentEditorCursorPageNum : 1,
			currentBrewRendererPageNum : 1,
			themeBundle                : {}
		};
	},

	editor : React.createRef(null),

	componentDidMount : function() {
		fetchThemeBundle(this, this.props.brew.renderer, this.props.brew.theme);
	},

	handleSave : function(){
		request.post('/api')
			.send(this.state.brew)
			.end((err, res)=>{
				if(err) {
					this.setState({ error: err });
					return;
				}
				const brew = res.body;
				window.location = `/edit/${brew.editId}`;
			});
	},
	handleSplitMove : function(){
		this.editor.current.update();
	},

	handleEditorViewPageChange : function(pageNumber){
		this.setState({ currentEditorViewPageNum: pageNumber });
	},

	handleEditorCursorPageChange : function(pageNumber){
		this.setState({ currentEditorCursorPageNum: pageNumber });
	},

	handleBrewRendererPageChange : function(pageNumber){
		this.setState({ currentBrewRendererPageNum: pageNumber });
	},

	handleTextChange : function(text){
		this.setState((prevState)=>({
			brew : { ...prevState.brew, text: text },
		}));
	},
	renderNavbar : function(){
		return <NavbarProvider>
			<Navbar>
				<NavSection>
					<MainMenu />
					<Dropdown id='brewMenu' trigger='click' className='brew-menu'>
						<NavItem color='purple'>Brew</NavItem>
						<NewBrewItem />
						<NavItem
							href={`/user/${encodeURI(global.account.username)}`}
							color='yellow'
							icon='fas fa-beer'
						>
							brews
						</NavItem>
						<RecentNavItem />
					</Dropdown>
					<VaultNavItem />
				</NavSection>
				<NavSection>
					{this.state.error ?
						<ErrorNavItem error={this.state.error} parent={this}></ErrorNavItem> :
						null
					}
					<AccountNavItem />
				</NavSection>
			</Navbar>
		</NavbarProvider>;
	},

	render : function(){
		return <div className='homePage sitePage'>
			<Meta name='google-site-verification' content='NwnAQSSJZzAT7N-p5MY6ydQ7Njm67dtbu73ZSyE5Fy4' />
			{this.renderNavbar()}
			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove}>
					<Editor
						ref={this.editor}
						brew={this.state.brew}
						onTextChange={this.handleTextChange}
						renderer={this.state.brew.renderer}
						showEditButtons={false}
						snippetBundle={this.state.themeBundle.snippets}
						onCursorPageChange={this.handleEditorCursorPageChange}
						onViewPageChange={this.handleEditorViewPageChange}
						currentEditorViewPageNum={this.state.currentEditorViewPageNum}
						currentEditorCursorPageNum={this.state.currentEditorCursorPageNum}
						currentBrewRendererPageNum={this.state.currentBrewRendererPageNum}
					/>
					<BrewRenderer
						text={this.state.brew.text}
						style={this.state.brew.style}
						renderer={this.state.brew.renderer}
						onPageChange={this.handleBrewRendererPageChange}
						currentEditorViewPageNum={this.state.currentEditorViewPageNum}
						currentEditorCursorPageNum={this.state.currentEditorCursorPageNum}
						currentBrewRendererPageNum={this.state.currentBrewRendererPageNum}
						themeBundle={this.state.themeBundle}
					/>
				</SplitPane>
			</div>
			<div className={cx('floatingSaveButton', { show: this.state.welcomeText != this.state.brew.text })} onClick={this.handleSave}>
				Save current <i className='fas fa-save' />
			</div>

			<a href='/new' className='floatingNewButton'>
				Create your own <i className='fas fa-magic' />
			</a>
		</div>;
	}
});

module.exports = HomePage;
