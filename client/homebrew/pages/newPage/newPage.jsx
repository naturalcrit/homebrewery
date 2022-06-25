/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./newPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const request = require('superagent');

const Markdown = require('naturalcrit/markdown.js');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const AccountNavItem = require('../../navbar/account.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const HelpNavItem = require('../../navbar/help.navitem.jsx');

const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const BREWKEY = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY = 'homebrewery-new-meta';


const NewPage = createClass({
	displayName     : 'NewPage',
	getDefaultProps : function() {
		return {
			brew : {
				text      : '',
				style     : undefined,
				shareId   : null,
				editId    : null,
				createdAt : null,
				updatedAt : null,
				gDrive    : false,

				title       : '',
				description : '',
				tags        : '',
				published   : false,
				authors     : [],
				systems     : []
			}
		};
	},

	getInitialState : function() {
		const brew = this.props.brew;

		if(typeof window !== 'undefined') { //Load from localStorage if in client browser
			const brewStorage  = localStorage.getItem(BREWKEY);
			const styleStorage = localStorage.getItem(STYLEKEY);
			const metaStorage = JSON.parse(localStorage.getItem(METAKEY));

			if(!brew.text || !brew.style){
				brew.text = brew.text  || (brewStorage  ?? '');
				brew.style = brew.style || (styleStorage ?? undefined);
				// brew.title = metaStorage?.title || this.state.brew.title;
				// brew.description = metaStorage?.description || this.state.brew.description;
				brew.renderer = metaStorage?.renderer || brew.renderer;
			}
		}

		return {
			brew : {
				text        : brew.text || '',
				style       : brew.style || undefined,
				gDrive      : false,
				title       : brew.title || '',
				description : brew.description || '',
				tags        : brew.tags || '',
				published   : false,
				authors     : [],
				systems     : brew.systems || [],
				renderer    : brew.renderer || 'legacy'
			},

			isSaving   : false,
			saveGoogle : (global.account && global.account.googleId ? true : false),
			errors     : null,
			htmlErrors : Markdown.validate(brew.text)
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

	handleTextChange : function(text){
		//If there are errors, run the validator on every change to give quick feedback
		let htmlErrors = this.state.htmlErrors;
		if(htmlErrors.length) htmlErrors = Markdown.validate(text);

		this.setState((prevState)=>({
			brew       : _.merge({}, prevState.brew, { text: text }),
			htmlErrors : htmlErrors
		}));
		localStorage.setItem(BREWKEY, text);
	},

	handleStyleChange : function(style){
		this.setState((prevState)=>({
			brew : _.merge({}, prevState.brew, { style: style }),
		}));
		localStorage.setItem(STYLEKEY, style);
	},

	handleMetaChange : function(metadata){
		this.setState((prevState)=>({
			brew : _.merge({}, prevState.brew, metadata),
		}));
		localStorage.setItem(METAKEY, JSON.stringify({
			// 'title'       : this.state.brew.title,
			// 'description' : this.state.brew.description,
			'renderer' : this.state.brew.renderer
		}));
	},

	clearErrors : function(){
		this.setState({
			errors   : null,
			isSaving : false

		});
	},

	save : async function(){
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
				this.setState({ isSaving: false, errors: err });
			});
		if(!res) return;

		brew = res.body;
		localStorage.removeItem(BREWKEY);
		localStorage.removeItem(STYLEKEY);
		localStorage.removeItem(METAKEY);
		window.location = `/edit/${brew.editId}`;
	},

	renderSaveButton : function(){
		if(this.state.errors){
			let errMsg = '';
			try {
				errMsg += `${this.state.errors.toString()}\n\n`;
				errMsg += `\`\`\`\n${this.state.errors.stack}\n`;
				errMsg += `${JSON.stringify(this.state.errors.response.error, null, '  ')}\n\`\`\``;
				console.log(errMsg);
			} catch (e){}

			// if(this.state.errors.status == '401'){
			// 	return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
			// 		Oops!
			// 		<div className='errorContainer' onClick={this.clearErrors}>
			// 		You must be signed in to a Google account
			// 			to save this to<br />Google Drive!<br />
			// 			<a target='_blank' rel='noopener noreferrer'
			// 				href={`https://www.naturalcrit.com/login?redirect=${this.state.url}`}>
			// 				<div className='confirm'>
			// 					Sign In
			// 				</div>
			// 			</a>
			// 			<div className='deny'>
			// 				Not Now
			// 			</div>
			// 		</div>
			// 	</Nav.item>;
			// }

			if(this.state.errors.response.req.url.match(/^\/api.*Google.*$/m)){
				return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
					Oops!
					<div className='errorContainer' onClick={this.clearErrors}>
					Looks like your Google credentials have
					expired! Visit our log in page to sign out
					and sign back in with Google,
					then try saving again!
						<a target='_blank' rel='noopener noreferrer'
							href={`https://www.naturalcrit.com/login?redirect=${this.state.url}`}>
							<div className='confirm'>
								Sign In
							</div>
						</a>
						<div className='deny'>
							Not Now
						</div>
					</div>
				</Nav.item>;
			}

			return <Nav.item className='save error' icon='fas fa-exclamation-triangle'>
				Oops!
				<div className='errorContainer'>
					Looks like there was a problem saving. <br />
					Report the issue <a target='_blank' rel='noopener noreferrer'
						href={`https://github.com/naturalcrit/homebrewery/issues/new?body=${encodeURIComponent(errMsg)}`}>
						here
					</a>.
				</div>
			</Nav.item>;
		}

		if(this.state.isSaving){
			return <Nav.item icon='fas fa-spinner fa-spin' className='save'>
				save...
			</Nav.item>;
		} else {
			return <Nav.item icon='fas fa-save' className='save' onClick={this.save}>
				save
			</Nav.item>;
		}
	},

	print : function(){
		window.open('/print?dialog=true&local=print', '_blank');
	},

	renderLocalPrintButton : function(){
		return <Nav.item color='purple' icon='far fa-file-pdf' onClick={this.print}>
			get PDF
		</Nav.item>;
	},

	renderNavbar : function(){
		return <Navbar>

			<Nav.section>
				<Nav.item className='brewTitle'>{this.state.brew.title}</Nav.item>
			</Nav.section>

			<Nav.section>
				{this.renderSaveButton()}
				{this.renderLocalPrintButton()}
				<HelpNavItem />
				<RecentNavItem />
				<AccountNavItem />
			</Nav.section>
		</Navbar>;
	},

	render : function(){
		return <div className='newPage sitePage'>
			{this.renderNavbar()}
			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
					<Editor
						ref='editor'
						brew={this.state.brew}
						onTextChange={this.handleTextChange}
						onStyleChange={this.handleStyleChange}
						onMetaChange={this.handleMetaChange}
						renderer={this.state.brew.renderer}
					/>
					<BrewRenderer text={this.state.brew.text} style={this.state.brew.style} renderer={this.state.brew.renderer} errors={this.state.htmlErrors}/>
				</SplitPane>
			</div>
		</div>;
	}
});

module.exports = NewPage;
