/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./newPage.less');
const React = require('react');
const createClass = require('create-react-class');
const request = require('../../utils/request-middleware.js');

const Markdown = require('naturalcrit/markdown.js');

const Nav = require('naturalcrit/nav/nav.jsx');
const PrintNavItem = require('../../navbar/print.navitem.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const AccountNavItem = require('../../navbar/account.navitem.jsx');
const ErrorNavItem = require('../../navbar/error-navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const HelpNavItem = require('../../navbar/help.navitem.jsx');

const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../../editor/editor.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const { DEFAULT_BREW } = require('../../../../server/brewDefaults.js');
const { printCurrentBrew, fetchThemeBundle } = require('../../../../shared/helpers.js');

const BREWKEY  = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY  = 'homebrewery-new-meta';
let SAVEKEY;


const NewPage = createClass({
	displayName     : 'NewPage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW
		};
	},

	getInitialState : function() {
		const brew = this.props.brew;

		return {
			brew                       : brew,
			isSaving                   : false,
			saveGoogle                 : (global.account && global.account.googleId ? true : false),
			error                      : null,
			htmlErrors                 : Markdown.validate(brew.text),
			currentEditorViewPageNum   : 1,
			currentEditorCursorPageNum : 1,
			currentBrewRendererPageNum : 1,
			themeBundle                : {}
		};
	},

	editor : React.createRef(null),

	componentDidMount : function() {
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
		}

		SAVEKEY = `HOMEBREWERY-DEFAULT-SAVE-LOCATION-${global.account?.username || ''}`;
		const saveStorage = localStorage.getItem(SAVEKEY) || 'HOMEBREWERY';

		this.setState({
			brew       : brew,
			saveGoogle : (saveStorage == 'GOOGLE-DRIVE' && this.state.saveGoogle)
		});

		fetchThemeBundle(this, this.props.brew.renderer, this.props.brew.theme);

		localStorage.setItem(BREWKEY, brew.text);
		if(brew.style)
			localStorage.setItem(STYLEKEY, brew.style);
		localStorage.setItem(METAKEY, JSON.stringify({ 'renderer': brew.renderer, 'theme': brew.theme, 'lang': brew.lang }));
		if(window.location.pathname != '/new') {
			window.history.replaceState({}, window.location.title, '/new/');
		}
	},
	componentWillUnmount : function() {
		document.removeEventListener('keydown', this.handleControlKeys);
	},

	handleControlKeys : function(e){
		if(!(e.ctrlKey || e.metaKey)) return;
		const S_KEY = 83;
		const P_KEY = 80;
		if(e.keyCode == S_KEY) this.save();
		if(e.keyCode == P_KEY) printCurrentBrew();
		if(e.keyCode == P_KEY || e.keyCode == S_KEY){
			e.stopPropagation();
			e.preventDefault();
		}
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
		//If there are errors, run the validator on every change to give quick feedback
		let htmlErrors = this.state.htmlErrors;
		if(htmlErrors.length) htmlErrors = Markdown.validate(text);

		this.setState((prevState)=>({
			brew       : { ...prevState.brew, text: text },
			htmlErrors : htmlErrors,
		}));
		localStorage.setItem(BREWKEY, text);
	},

	handleStyleChange : function(style){
		this.setState((prevState)=>({
			brew : { ...prevState.brew, style: style },
		}));
		localStorage.setItem(STYLEKEY, style);
	},

	handleMetaChange : function(metadata, field=undefined){
		if(field == 'theme' || field == 'renderer')	// Fetch theme bundle only if theme or renderer was changed
			fetchThemeBundle(this, metadata.renderer, metadata.theme);

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
	},

	save : async function(){
		this.setState({
			isSaving : true
		});

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
				this.setState({ isSaving: false, error: err });
			});
		if(!res) return;

		brew = res.body;
		localStorage.removeItem(BREWKEY);
		localStorage.removeItem(STYLEKEY);
		localStorage.removeItem(METAKEY);
		window.location = `/edit/${brew.editId}`;
	},

	renderSaveButton : function(){
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

	renderNavbar : function(){
		return <Navbar>

			<Nav.section>
				<Nav.item className='brewTitle'>{this.state.brew.title}</Nav.item>
			</Nav.section>

			<Nav.section>
				{this.state.error ?
					<ErrorNavItem error={this.state.error} parent={this}></ErrorNavItem> :
					this.renderSaveButton()
				}
				<PrintNavItem />
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
				<SplitPane onDragFinish={this.handleSplitMove}>
					<Editor
						ref={this.editor}
						brew={this.state.brew}
						onTextChange={this.handleTextChange}
						onStyleChange={this.handleStyleChange}
						onMetaChange={this.handleMetaChange}
						renderer={this.state.brew.renderer}
						userThemes={this.props.userThemes}
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
						theme={this.state.brew.theme}
						themeBundle={this.state.themeBundle}
						errors={this.state.htmlErrors}
						lang={this.state.brew.lang}
						onPageChange={this.handleBrewRendererPageChange}
						currentEditorViewPageNum={this.state.currentEditorViewPageNum}
						currentEditorCursorPageNum={this.state.currentEditorCursorPageNum}
						currentBrewRendererPageNum={this.state.currentBrewRendererPageNum}
						allowPrint={true}
					/>
				</SplitPane>
			</div>
		</div>;
	}
});

module.exports = NewPage;
