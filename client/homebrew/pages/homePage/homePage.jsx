require('./homePage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');
const request = require('../../utils/request-middleware.js');
const { Meta } = require('vitreum/headtags');

const Navbar = require('../../navbar/navbar.jsx');
import * as Toolbar from '@radix-ui/react-toolbar';
import * as Menubar from '@radix-ui/react-menubar';
import { LinkItem, ButtonItem, Menu, SubMenu } from '../../navbar/menubarExtensions.jsx';
import { getRedditLink } from '../../navbar/getRedditLink.jsx';
import { RecentItems } from '../../navbar/recent.navitem.jsx';

const BrewTitle = require('../../navbar/brewTitle.jsx');
const NewBrew = require('../../navbar/newBrew.jsx');
const HelpItems = require('../../navbar/help.navitem.jsx');
const PrintLink = require('../../navbar/print.navitem.jsx');
const ErrorNavItem = require('../../navbar/error-navitem.jsx');
const Account = require('../../navbar/account.navitem.jsx');
const Tabs = require('../../editor/editorTabs.jsx')


const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const { DEFAULT_BREW } = require('../../../../server/brewDefaults.js');

const HomePage = createClass({
	displayName     : 'HomePage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW,
			ver  : '0.0.0'
		};
	},
	getInitialState : function() {
		return {
			brew        : this.props.brew,
			welcomeText : this.props.brew.text,
			error       : undefined
		};
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
	// handleSplitMove : function(){
	// 	this.refs.editor.update();
	// },
	handleTextChange : function(text){
		this.setState((prevState)=>({
			brew : { ...prevState.brew, text: text }
		}));
	},
	renderNavbar : function(menubar) {
		// If the screen is 'full size'...
		if(this.props.isNarrow == false){

			if(menubar.location === 'bottom') return;

			return <Navbar.Top>
				<Menu trigger='Brew'>
					<NewBrew />
					{/* <SubMenu trigger='Save'>
						{this.renderSaveButton()}
						{this.renderAutoSaveButton()}
					</SubMenu> */}
					<Menubar.Separator />
					<SubMenu trigger='Recently Edited'>
						<RecentItems brew={this.state.brew} storageKey='edit' />
					</SubMenu>
					<SubMenu trigger='Recently Viewed'>
						<RecentItems brew={this.state.brew} storageKey='view' />
					</SubMenu>
					{global.account ? <LinkItem href={`/user/${encodeURI(global.account.username)}`}>Library</LinkItem> : ''}
					{/* <Menubar.Separator /> */}
					{/* <SubMenu trigger='Share'>
						<LinkItem href={`/share/${this.processShareId()}`}
							target='_blank'
							rel='noopener noreferrer'>Go To Share Page</LinkItem>
						<LinkItem href={getRedditLink(this.state.brew)}
							target='_blank'
							rel='noopener noreferrer'>Share On Reddit</LinkItem>
						<ButtonItem onClick={()=>{navigator.clipboard.writeText(`${global.config.publicUrl}/share/${this.processShareId()}`);}}>Copy Share URL</ButtonItem>
					</SubMenu> */}
					{/* <PrintLink shareId={this.processShareId()}>Print</PrintLink> */}
				</Menu>
				<Menu trigger='Help'>
					<HelpItems.faq />
					<HelpItems.migrate />
					<Menubar.Separator />
					<SubMenu trigger='Community'>
						<HelpItems.rHomebrewery />
						<HelpItems.DoMT />
					</SubMenu>
					<Menubar.Separator />
					<SubMenu trigger='Report Issue'>
						<HelpItems.issueToReddit />
						<HelpItems.issueToGithub />
					</SubMenu>
				</Menu>
				<BrewTitle title={this.state.brew.title} />
				<Account />
			</Navbar.Top>;

		} else {    // If the screen is narrow (such as on mobile)...

			if(menubar.location === 'top'){
				return <Navbar.Top>
					<BrewTitle title={this.state.brew.title} />
					<Menu trigger='Help'>
						<HelpItems.faq />
						<HelpItems.migrate />
						<Menubar.Separator />
						<SubMenu trigger='Community'>
							<HelpItems.rHomebrewery />
							<HelpItems.DoMT />
						</SubMenu>
						<Menubar.Separator />
						<SubMenu trigger='Report Issue'>
							<HelpItems.issueToReddit />
							<HelpItems.issueToGithub />
						</SubMenu>
					</Menu>
				</Navbar.Top>;
			} else {
				return <Navbar.Bottom>
					<Menu trigger='Brew'>
						{/* <NewBrew />
						<SubMenu trigger='Save'>
							{this.renderSaveButton()}
							{this.renderAutoSaveButton()}
						</SubMenu> */}
						{/* <Menubar.Separator /> */}
						<SubMenu trigger='Recently Edited'>
							<RecentItems brew={this.state.brew} storageKey='edit' />
						</SubMenu>
						<SubMenu trigger='Recently Viewed'>
							<RecentItems brew={this.state.brew} storageKey='view' />
						</SubMenu>
						{global.account ? <LinkItem href={`/user/${encodeURI(global.account.username)}`}>Library</LinkItem> : ''}
						{/* <Menubar.Separator /> */}
						{/* <PrintLink shareId={this.processShareId()}>Print</PrintLink> */}
					</Menu>
					<Account />
				</Navbar.Bottom>;
			}
		}

	},

	render : function(){
		return <div className='homePage sitePage'>
			<Meta name='google-site-verification' content='NwnAQSSJZzAT7N-p5MY6ydQ7Njm67dtbu73ZSyE5Fy4' />
			{this.renderNavbar({ location: 'top' })}

			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
					<Tabs
						brew={this.state.brew}
						onTextChange={this.handleTextChange}
						onStyleChange={this.handleStyleChange}
						onMetaChange={this.handleMetaChange}
						reportError={this.errorReported}
						renderer={this.state.brew.renderer} 
					/>
					<BrewRenderer
						text={this.state.brew.text}
						style={this.state.brew.style}
						renderer={this.state.brew.renderer}
						theme={this.state.brew.theme}
						errors={this.state.htmlErrors}
						lang={this.state.brew.lang}
					/>
				</SplitPane>
			</div>

			{/* <div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
					<Editor
						ref='editor'
						brew={this.state.brew}
						onTextChange={this.handleTextChange}
						renderer={this.state.brew.renderer}
						showEditButtons={false}
					/>
					<BrewRenderer text={this.state.brew.text} style={this.state.brew.style} renderer={this.state.brew.renderer}/>
				</SplitPane>
			</div> */}

			<div className={cx('floatingSaveButton', { show: this.state.welcomeText != this.state.brew.text })} onClick={this.handleSave}>
				Save current <i className='fas fa-save' />
			</div>

			<a href='/new' className='floatingNewButton'>
				Create your own <i className='fas fa-magic' />
			</a>

			{this.renderNavbar({ location: 'bottom' })}
		</div>;
	}
});

module.exports = HomePage;
