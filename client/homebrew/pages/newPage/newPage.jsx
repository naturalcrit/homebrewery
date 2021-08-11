/* eslint-disable max-lines */
require('./newPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const request = require('superagent');

const Markdown = require('naturalcrit/markdown.js');

const BasePage = require('../basePage/basePage.jsx');

const BREWKEY = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY = 'homebrewery-new-meta';

const SAVE_TIMEOUT = 3000;


const NewPage = createClass({
	getDefaultProps : function() {
		return {
			brew : {
				text      : '',
				style     : '',
				shareId   : null,
				editId    : null,
				createdAt : null,
				updatedAt : null,
				gDrive    : false,
				trashed   : false,

				title       : '',
				description : '',
				tags        : '',
				published   : false,
				authors     : [],
				systems     : [],
				renderer    : 'legacy'
			}
		};
	},

	getInitialState : function() {
		return {
			brew : this.props.brew
		};
	},

	componentDidMount : function(){

		this.savedBrew = JSON.parse(JSON.stringify(this.props.brew)); //Deep copy

		const brew = this.props.brew;
		const metaOpts = JSON.parse(localStorage.getItem(METAKEY));

		if((!brew.text && localStorage.getItem(BREWKEY)) && (!brew.style && localStorage.getItem(STYLEKEY))){
			brew.text = brew.text || (localStorage.getItem(BREWKEY) ?? '');
			brew.style = brew.style || (localStorage.getItem(STYLEKEY) ?? undefined);
			brew.renderer = metaOpts?.renderer || brew.renderer;
		}
	},

	autoSave : function(brew){
		if(!this.debounceSave) this.debounceSave = _.debounce(this.save, SAVE_TIMEOUT);
		localStorage.setItem(BREWKEY, brew.text);
		localStorage.setItem(STYLEKEY, brew.style);
		localStorage.setItem(METAKEY, JSON.stringify({ 'renderer': brew.renderer }));
		this.debounceSave.cancel();
	},

	save : async function(brew, saveGoogle){
		console.log(`saveGoogle: ${saveGoogle}`);
		if(this.debounceSave && this.debounceSave.cancel) this.debounceSave.cancel();

		this.setState((prevState)=>({
			isSaving   : true,
			errors     : null,
			htmlErrors : Markdown.validate(prevState.brew.text)
		}));

		const savingBrew = brew;

		// Split out CSS to Style if CSS codefence exists
		if(savingBrew.text.startsWith('```css') && savingBrew.text.indexOf('```\n\n') > 0) {
			const index = savingBrew.text.indexOf('```\n\n');
			savingBrew.style = `${savingBrew.style ? `${savingBrew.style}\n` : ''}${savingBrew.text.slice(7, index - 1)}`;
			savingBrew.text = savingBrew.text.slice(index + 5);
		};

		if(saveGoogle) {
			console.log('Google save');
			const res = await request
					.post('/api/newGoogle/')
					.send(savingBrew)
					.catch((err)=>{
						alert(err.status === 401
							? 'Not signed in!'
							: 'Error Creating New Google Brew!');
						this.setState({ isSaving: false });
						return;
					});

			const savedBrew = res.body;
			window.location.href = `/edit/${savedBrew.googleId}${savedBrew.editId}`;
		} else {
			console.log('HB saving');
			request.post('/api')
				.send(savingBrew)
				.end((err, res)=>{
					if(err){
						this.setState({
							isSaving : false
						});
						alert('Error while saving!');
						return;
					}
					window.onbeforeunload = function(){};
					const savedBrew = res.body;
					window.location.href = `/edit/${savedBrew.editId}`;
				});
		}

		localStorage.removeItem(BREWKEY);
		localStorage.removeItem(STYLEKEY);
		localStorage.removeItem(METAKEY);

		this.setState((prevState)=>({
			brew : _.merge({}, prevState.brew, {
				googleId : this.savedBrew.googleId ? this.savedBrew.googleId : null,
				editId 	 : this.savedBrew.editId,
				shareId  : this.savedBrew.shareId
			}),
			isPending : false,
			isSaving  : false,
		}));
	},

	render : function(){
		const saveMessages = ['Use Homebrewery storage when you save this brew?', 'Use Google Drive storage when you save this brew?'];

		return <BasePage
			id={this.id}
			brew={this.props.brew}
			callbackSave={this.save}
			callbackTrySave={this.autoSave}
			saveMessages={saveMessages}
			pageType='new'
		/>;
	}
});

module.exports = NewPage;
