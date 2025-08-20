/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./newPage.less');
const React = require('react');
const createClass = require('create-react-class');
import request from '../../utils/request-middleware.js';

import Markdown from 'naturalcrit/markdown.js';

const Nav = require('naturalcrit/nav/nav.jsx');
const ErrorNavItem = require('../../navbar/error-navitem.jsx');

const BaseEditPage = require('../basePages/editPage/editPage.jsx');
const SplitPane = require('client/components/splitPane/splitPane.jsx');
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
		return <>
			<Nav.section>
				{this.state.error ?
					<ErrorNavItem error={this.state.error} parent={this}></ErrorNavItem> :
					this.renderSaveButton()
				}
			</Nav.section>
		</>;
	},

	render : function(){
		return <BaseEditPage
							className="newPage"
							errorState={this.state.error}
							parent={this}
							saveButton={this.renderSaveButton}
							performSave={this.save}
							loadBrew={this.loadBrew}>
					</BaseEditPage>;
	}
});

module.exports = NewPage;
