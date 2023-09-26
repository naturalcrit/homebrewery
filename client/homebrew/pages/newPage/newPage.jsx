/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./newPage.less');
const React = require('react');
import PropTypes from 'prop-types';
const _ = require('lodash');
const request = require('../../utils/request-middleware.js');

const { Meta } = require('vitreum/headtags');

const Markdown = require('naturalcrit/markdown.js');

const Navbar = require('../../navbar/navbar.jsx');
import * as Toolbar from '@radix-ui/react-toolbar';
import * as Menubar from '@radix-ui/react-menubar';
import { LinkItem, ButtonItem, Menu, SubMenu } from '../../navbar/menubarExtensions.jsx';
import { getRedditLink } from '../../navbar/getRedditLink.jsx';

const BrewTitle = require('../../navbar/brewTitle.jsx');
const NewBrew = require('../../navbar/newBrew.jsx');
const HelpItems = require('../../navbar/help.navitem.jsx');
const PrintLink = require('../../navbar/print.navitem.jsx');
const ErrorNavItem = require('../../navbar/error-navitem.jsx');
const Account = require('../../navbar/account.navitem.jsx');
import { RecentItems } from '../../navbar/recent.navitem.jsx';
import { Link } from 'react-router-dom';

const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');

const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const Tabs = require('../../editor/editorTabs.jsx')

const { DEFAULT_BREW } = require('../../../../server/brewDefaults.js');

const BREWKEY = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY = 'homebrewery-new-meta';

class NewPage extends React.Component {
	constructor(props) {
		super(props)
	}
	static propTypes = {
		brew: PropTypes.object
	}
	static defaultProps = {
		brew : DEFAULT_BREW
	}
	state = {
		brew       : this.props.brew,
		isSaving   : false,
		saveGoogle : (global.account && global.account.googleId ? true : false),
		error      : null,
		htmlErrors : Markdown.validate(this.props.brew.text)
	}


	componentDidMount() {
		document.addEventListener('keydown', this.handleControlKeys);

		const brew = this.state.brew;

		if(!this.props.brew.shareId && typeof window !== 'undefined') { //Load from localStorage if in client browser
			const brewStorage  = localStorage.getItem(BREWKEY);
			const styleStorage = localStorage.getItem(STYLEKEY);
			const metaStorage = JSON.parse(localStorage.getItem(METAKEY));

			brew.text  = brewStorage  ?? brew.text;
			brew.style = styleStorage ?? brew.style;
			// brew.title = metaStorage?.title || this.state.brew.title;
			// brew.description = metaStorage?.description || this.state.brew.description;
			brew.renderer = metaStorage?.renderer ?? brew.renderer;
			brew.theme    = metaStorage?.theme    ?? brew.theme;
			brew.lang     = metaStorage?.lang     ?? brew.lang;

			this.setState({
				brew : brew
			});
		}

		localStorage.setItem(BREWKEY, brew.text);
		if(brew.style)
			localStorage.setItem(STYLEKEY, brew.style);
		localStorage.setItem(METAKEY, JSON.stringify({ 'renderer': brew.renderer, 'theme': brew.theme, 'lang': brew.lang }));
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.handleControlKeys);
	}

	handleControlKeys = (e)=>{
		if(!(e.ctrlKey || e.metaKey)) return;
		const S_KEY = 83;
		const P_KEY = 80;
		if(e.keyCode == S_KEY) this.save();
		if(e.keyCode == P_KEY) this.print();
		if(e.keyCode == P_KEY || e.keyCode == S_KEY){
			e.stopPropagation();
			e.preventDefault();
		}
	}

	handleSplitMove = ()=>{
		this.refs.editor.update();
	}

	handleTextChange = (text)=>{
		//If there are errors, run the validator on every change to give quick feedback
		let htmlErrors = this.state.htmlErrors;
		if(htmlErrors.length) htmlErrors = Markdown.validate(text);

		this.setState((prevState)=>({
			brew       : { ...prevState.brew, text: text },
			htmlErrors : htmlErrors
		}));
		localStorage.setItem(BREWKEY, text);
	}

	handleStyleChange = (style)=>{
		this.setState((prevState)=>({
			brew : { ...prevState.brew, style: style },
		}));
		localStorage.setItem(STYLEKEY, style);
	}

	handleMetaChange = (metadata)=>{
		this.setState((prevState)=>({
			brew : { ...prevState.brew, ...metadata },
		}), ()=>{
			localStorage.setItem(METAKEY, JSON.stringify({
				// 'title'       : this.state.brew.title,
				// 'description' : this.state.brew.description,
				'renderer' : this.state.brew.renderer,
				'theme'    : this.state.brew.theme,
				'lang'     : this.state.brew.lang
			}));
		});
		;
	}

	save = async function(){
		this.setState({
			isSaving : true
		});

		console.log('saving new brew');

		let brew = this.state.brew;
		// Split out CSS to Style if CSS codefence exists
		if(brew.text.startsWith('```css') && brew.text.indexOf('```\n\n') > 0) {
			const index = brew.text.indexOf('```\n\n');
			brew.style = `${brew.style ? `${brew.style}\n` : ''}${brew.text.slice(7, index - 1)}`;
			brew.text = brew.text.slice(index + 5);
		}

		brew.pageCount=((brew.renderer=='legacy' ? brew.text.match(/\\page/g) : brew.text.match(/^\\page$/gm)) || []).length + 1;

		const res = await request
			.post(`/api${this.state.saveGoogle ? '?saveToGoogle=true' : ''}`)
			.send(brew)
			.catch((err)=>{
				console.log(err);
				this.setState({ isSaving: false, error: err });
			});
		if(!res) return;

		brew = res.body;
		localStorage.removeItem(BREWKEY);
		localStorage.removeItem(STYLEKEY);
		localStorage.removeItem(METAKEY);
		window.location = `/edit/${brew.editId}`;
	}

	// renderSaveButton : function(){
	// 	if(this.state.isSaving){
	// 		return <Nav.item icon='fas fa-spinner fa-spin' className='save'>
	// 			save...
	// 		</Nav.item>;
	// 	} else {
	// 		return <Nav.item icon='fas fa-save' className='save' onClick={this.save}>
	// 			save
	// 		</Nav.item>;
	// 	}
	// },

	print = ()=>{
		window.open('/print?dialog=true&local=print', '_blank');
	}

	// renderLocalPrintButton : function(){
	// 	return <Nav.item color='purple' icon='far fa-file-pdf' onClick={this.print}>
	// 		get PDF
	// 	</Nav.item>;
	// },



	renderSaveButton = ()=>{
		return <ButtonItem onClick={this.save} hotkeys={{ mac: ['⌘', 'S'], pc: ['Ctrl', 'S'] }}>Save</ButtonItem>;
	}

	handleAutoSave = ()=>{
		if(this.warningTimer) clearTimeout(this.warningTimer);
		this.setState((prevState)=>({
			autoSave        : !prevState.autoSave,
			autoSaveWarning : prevState.autoSave
		}), ()=>{
			localStorage.setItem('AUTOSAVE_ON', JSON.stringify(this.state.autoSave));
			this.state.autoSave == true ? console.log('Autosave turned %cON', 'background: green; color: white; border-radius: 3px; padding: 0 5px') : console.log('Autosave turned %cOFF', 'background: red; color: white; border-radius: 3px; padding: 0 5px');
		});
	}

	setAutosaveWarning = ()=>{
		setTimeout(()=>this.setState({ autoSaveWarning: false }), 4000);                           // 4 seconds to display
		this.warningTimer = setTimeout(()=>{this.setState({ autoSaveWarning: true });}, 900000);   // 15 minutes between warnings
		this.warningTimer;
	}

	renderAutoSaveButton = ()=>{
		return <Menubar.CheckboxItem
			className='autosave-toggle switch'
			checked={this.state.autoSave}
			onCheckedChange={this.handleAutoSave}
			onSelect={(e)=>{e.preventDefault();}}>
			Autosave <span className='right-slot'><Menubar.ItemIndicator className='switch' forceMount={true}><span className='switch-thumb'></span></Menubar.ItemIndicator></span>
		</Menubar.CheckboxItem>;
	}

	processShareId = ()=>{
		return this.state.brew.googleId && !this.state.brew.stubbed ?
					 this.state.brew.googleId + this.state.brew.shareId :
					 this.state.brew.shareId;
	}

	renderNavbar = (menubar)=>{
		// If the screen is 'full size'...
		if(this.props.isNarrow == false){

			if(menubar.location === 'bottom') return;

			return <Navbar.Top>
				<Menu trigger='Brew'>
					<NewBrew />
					<SubMenu trigger='Save'>
						{this.renderSaveButton()}
						{this.renderAutoSaveButton()}
					</SubMenu>
					<Menubar.Separator />
					<SubMenu trigger='Recently Edited'>
						<RecentItems brew={this.state.brew} storageKey='edit' />
					</SubMenu>
					<SubMenu trigger='Recently Viewed'>
						<RecentItems brew={this.state.brew} storageKey='view' />
					</SubMenu>
					{global.account ? <LinkItem href={`/user/${encodeURI(global.account.username)}`}>Library</LinkItem> : ''}
					<Menubar.Separator />
					<SubMenu trigger='Share'>
						<LinkItem href={`/share/${this.processShareId()}`}
							target='_blank'
							rel='noopener noreferrer'>Go To Share Page</LinkItem>
						<LinkItem href={getRedditLink(this.state.brew)}
							target='_blank'
							rel='noopener noreferrer'>Share On Reddit</LinkItem>
						<ButtonItem onClick={()=>{navigator.clipboard.writeText(`${global.config.publicUrl}/share/${this.processShareId()}`);}}>Copy Share URL</ButtonItem>
					</SubMenu>
					<PrintLink shareId={this.processShareId()}>Print</PrintLink>
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
						<NewBrew />
						<SubMenu trigger='Save'>
							{this.renderSaveButton()}
							{this.renderAutoSaveButton()}
						</SubMenu>
						<Menubar.Separator />
						<SubMenu trigger='Recently Edited'>
							<RecentItems brew={this.state.brew} storageKey='edit' />
						</SubMenu>
						<SubMenu trigger='Recently Viewed'>
							<RecentItems brew={this.state.brew} storageKey='view' />
						</SubMenu>
						{global.account ? <LinkItem href={`/user/${encodeURI(global.account.username)}`}>Library</LinkItem> : ''}
						<Menubar.Separator />
						<PrintLink shareId={this.processShareId()}>Print</PrintLink>
					</Menu>
					<Account />
				</Navbar.Bottom>;
			}
		}

	}

	render(){
		return <div className='newPage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
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
			{this.renderNavbar({ location: 'bottom' })}
		</div>;
	}
};

module.exports = NewPage;
