/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./newPage.less');
const React = require('react');
const createClass = require('create-react-class');
import request from '../../utils/request-middleware.js';

const Nav = require('naturalcrit/nav/nav.jsx');

const BaseEditPage = require('../basePages/editPage/editPage.jsx');

const { DEFAULT_BREW } = require('../../../../server/brewDefaults.js');

const BREWKEY  = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY  = 'homebrewery-new-meta';
const SAVEKEY  = `HOMEBREWERY-DEFAULT-SAVE-LOCATION-${global.account?.username || ''}`;

const NewPage = createClass({
	displayName     : 'NewPage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW
		};
	},

	loadBrew : function(brew, setBrew, setSaveGoogle) {
		if(!brew.shareId && typeof window !== 'undefined') { //Load from localStorage if in client browser
			//TODO: Move localstorage handling to BaseEditPage?
			const brewStorage  = localStorage.getItem(BREWKEY);
			const styleStorage = localStorage.getItem(STYLEKEY);
			const metaStorage  = JSON.parse(localStorage.getItem(METAKEY));

			brew.text     = brewStorage           ?? brew.text;
			brew.style    = styleStorage          ?? brew.style;
			brew.renderer = metaStorage?.renderer ?? brew.renderer;
			brew.theme    = metaStorage?.theme    ?? brew.theme;
			brew.lang     = metaStorage?.lang     ?? brew.lang;
		}

		const saveStorage = localStorage.getItem(SAVEKEY) || 'HOMEBREWERY';

		setBrew(brew);
		setSaveGoogle(saveStorage == 'GOOGLE-DRIVE' && this.state.saveGoogle);

		localStorage.setItem(BREWKEY, brew.text);
		if(brew.style)
			localStorage.setItem(STYLEKEY, brew.style);
		localStorage.setItem(METAKEY, JSON.stringify({ 'renderer': brew.renderer, 'theme': brew.theme, 'lang': brew.lang }));
		if(window.location.pathname != '/new') {
			window.history.replaceState({}, window.location.title, '/new/');
		}
	},

	save : async function(brew, saveGoogle){
		brew.pageCount=((brew.renderer=='legacy' ? brew.text.match(/\\page/g) : brew.text.match(/^\\page$/gm)) || []).length + 1;
		return request
			.post(`/api${saveGoogle ? '?saveToGoogle=true' : ''}`)
			.send(brew)
			.then((res) => {
				//TODO: Move localstorage handling to BaseEditPage?
				localStorage.removeItem(BREWKEY);
				localStorage.removeItem(STYLEKEY);
				localStorage.removeItem(METAKEY);
				const saved = res.body;
				window.location = `/edit/${saved.editId}`;
			});
	},

	renderSaveButton : function(save, isSaving){
		if(isSaving){
			return <Nav.item icon='fas fa-spinner fa-spin' className='save'>
				save...
			</Nav.item>;
		} else {
			return <Nav.item icon='fas fa-save' className='save' onClick={save}>
				save
			</Nav.item>;
		}
	},

	render : function(){
		return <BaseEditPage
							{...this.props}
							className="newPage"
							parent={this}
							saveButton={this.renderSaveButton}
							performSave={this.save}
							loadBrew={this.loadBrew}>
					</BaseEditPage>;
	}
});

module.exports = NewPage;
