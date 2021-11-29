/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./newPage.less');
const React = require('react');
const createClass = require('create-react-class');

const _ = require('lodash');
const request = require('superagent');

const EditorPage = require('../basePages/editorPage/editorPage.jsx');

const PrintLink = require('../../navbar/print.navitem.jsx');

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

	autoSave : function(brew){
		if(brew.text) localStorage.setItem(BREWKEY, brew.text);
		if(brew.style) localStorage.setItem(STYLEKEY, brew.style);
		localStorage.setItem(METAKEY, JSON.stringify({
			renderer : (brew.renderer || 'legacy')
		}));
	},

	save : async function(brew, saveGoogle){
		console.log('saving new brew');

		// Split out CSS to Style if CSS codefence exists
		if(brew.text.startsWith('```css') && brew.text.indexOf('```\n\n') > 0) {
			const index = brew.text.indexOf('```\n\n');
			brew.style = `${brew.style ? `${brew.style}\n` : ''}${brew.text.slice(7, index - 1)}`;
			brew.text = brew.text.slice(index + 5);
		};

		brew.pageCount=((brew.renderer=='legacy' ? brew.text.match(/\\page/g) : brew.text.match(/^\\page$/gm)) || []).length + 1;

		if(saveGoogle) {
			const res = await request
			.post('/api/newGoogle/')
			.send(brew)
			.catch((err)=>{
				console.log(err.status === 401
					? 'Not signed in!'
					: 'Error Creating New Google Brew!');
				this.setState({ isSaving: false, errors: err });
				return;
			});
			window.onbeforeunload = function(){};
			brew = res.body;
			localStorage.removeItem(BREWKEY);
			localStorage.removeItem(STYLEKEY);
			localStorage.removeItem(METAKEY);
			window.location = `/edit/${brew.googleId}${brew.editId}`;
		} else {
			request.post('/api')
			.send(brew)
			.end((err, res)=>{
				if(err){
					this.setState({
						isSaving : false
					});
					return;
				}
				window.onbeforeunload = function(){};
				brew = res.body;
				localStorage.removeItem(BREWKEY);
				localStorage.removeItem(STYLEKEY);
				localStorage.removeItem(METAKEY);
				window.location = `/edit/${brew.editId}`;
			});
		}
	},

	renderNavElements : function(){
		return <PrintLink url='/print?dialog=true&local=print'></PrintLink>;
	},

	render : function(){
		const googleDriveOptions = [
			'Set save location to the Homebrewery?',
			'Set save location to your personal Google Drive storage?'
		];

		return <EditorPage
			pageType='new'
			brew={this.props.brew}
			googleDriveOptions={googleDriveOptions}
			navElements={this.renderNavElements()}
			autoSave={this.autoSave}
			save={this.save}
		></EditorPage>;
	}
});

module.exports = NewPage;
