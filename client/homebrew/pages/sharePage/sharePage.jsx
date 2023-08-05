require('./sharePage.less');
const React = require('react');
const createClass = require('create-react-class');
const { Meta } = require('vitreum/headtags');

const Navbar = require('../../navbar/navbar.jsx');
import * as Menubar from '@radix-ui/react-menubar';
import { LinkItem, Menu, SubMenu } from '../../navbar/menubarExtensions.jsx';

const BrewTitle = require('../../navbar/brewTitle.jsx');
const NewBrew = require('../../navbar/newBrew.jsx');
const HelpItems = require('../../navbar/help.navitem.jsx');
const PrintLink = require('../../navbar/print.navitem.jsx');
const { SourceItems } = require('../../navbar/source.navitem.jsx')
const Account = require('../../navbar/account.navitem.jsx');
import { RecentItems } from '../../navbar/recent.navitem.jsx';


const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const { DEFAULT_BREW_LOAD } = require('../../../../server/brewDefaults.js');

const SharePage = createClass({
	displayName     : 'SharePage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW_LOAD
		};
	},

	componentDidMount : function() {
		document.addEventListener('keydown', this.handleControlKeys);
	},

	componentWillUnmount : function() {
		document.removeEventListener('keydown', this.handleControlKeys);
	},

	handleControlKeys : function(e){
		if(!(e.ctrlKey || e.metaKey)) return;
		const P_KEY = 80;
		if(e.keyCode == P_KEY){
			window.open(`/print/${this.processShareId()}?dialog=true`, '_blank').focus();
			e.stopPropagation();
			e.preventDefault();
		}
	},

	processShareId : function() {
		return this.props.brew.googleId && !this.props.brew.stubbed ?
					 this.props.brew.googleId + this.props.brew.shareId :
					 this.props.brew.shareId;
	},

	renderNavbar : function(menubar) {
		// If the screen is 'full size'...
		if(this.props.isNarrow == false){

			if(menubar.location === 'bottom') return;

			return <Navbar.Top>
				<Menu trigger='Brew'>
					<NewBrew />
					<Menubar.Separator />
					<SubMenu trigger='Source'>
						<SourceItems.view shareId={this.processShareId()} />
						<SourceItems.download shareId={this.processShareId()} />
						<SourceItems.clone shareId={this.processShareId()} />
					</SubMenu>
					<Menubar.Separator />
					<SubMenu trigger='Recently Viewed'>
						<RecentItems brew={this.props.brew} storageKey='view' />
					</SubMenu>
					{global.account ? <LinkItem href={`/user/${encodeURI(global.account.username)}`}>Library</LinkItem> : ''}
					<Menubar.Separator />
					<PrintLink shareId={this.processShareId()}>Print</PrintLink>
				</Menu>
				<Menu trigger='Help'>
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
				<BrewTitle title={this.props.brew.title} />
				<Account />
			</Navbar.Top>;

		} 
		else {    // If the screen is narrow (such as on mobile)...

			if(menubar.location === 'top'){
				return <Navbar.Top>
					<BrewTitle title={this.props.brew.title} />
					<Menu trigger='Help'>
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
						<NewBrew />
						<Menubar.Separator />
					<SubMenu trigger='Source'>
						<SourceItems.view shareId={this.processShareId()} />
						<SourceItems.download shareId={this.processShareId()} />
						<SourceItems.clone shareId={this.processShareId()} />
					</SubMenu>
					<Menubar.Separator />
						<SubMenu trigger='Recently Viewed'>
							<RecentItems brew={this.props.brew} storageKey='view' />
						</SubMenu>
						{global.account ? <LinkItem href={`/user/${encodeURI(global.account.username)}`}>Library</LinkItem> : ''}
						<Menubar.Separator />
						<PrintLink shareId={this.processShareId()}>Print</PrintLink>
					</Menu>
					<Account />
				</Navbar.Bottom>;
			}
		}

	},

	render : function(){
		return <div className='sharePage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
			{this.renderNavbar({ location: 'top' })}
			<div className='content'>
				<BrewRenderer text={this.props.brew.text} style={this.props.brew.style} renderer={this.props.brew.renderer} theme={this.props.brew.theme} />
			</div>

			{this.renderNavbar({ location: 'bottom' })}
		</div>;
	}
});

module.exports = SharePage;
