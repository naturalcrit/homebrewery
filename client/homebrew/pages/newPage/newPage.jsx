/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./newPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');

const EditorPage = require('../basePages/editorPage/editorPage.jsx');

const Markdown = require('naturalcrit/markdown.js');

const BREWKEY = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY = 'homebrewery-new-meta';


const NewPage = createClass({
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

	render : function(){
		const googleDriveOptions = [
			'Set save location to the Homebrewery?',
			'Set save location to your personal Google Drive storage?'
		];

		return <EditorPage
			pageType='new'
			googleDriveOptions={googleDriveOptions}
			brew={this.props.brew}
			printLink='/print?dialog=true&local=print'
		></EditorPage>;
	}
});

module.exports = NewPage;
