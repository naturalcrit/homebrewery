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
			},
			saveGoogle : false
		};
	},

	getInitialState : function() {
		return {
			brew       : this.props.brew,
			saveGoogle : global.account?.googleId || false
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
		try {
			localStorage.setItem(BREWKEY, brew.text);
			localStorage.setItem(STYLEKEY, brew.style);
			localStorage.setItem(METAKEY, JSON.stringify({ 'renderer': brew.renderer }));
			return true;
		} catch {
			return false;
		}
	},

	save : async function(brew, saveGoogle){
		if(this.debounceSave && this.debounceSave.cancel) this.debounceSave.cancel();

		this.setState((prevState)=>({
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
						return;
					});
			window.onbeforeunload = function(){};
			const savedBrew = res.body;
			window.location.href = `/edit/${savedBrew.googleId}${savedBrew.editId}`;
		} else {
			console.log('HB save');
			request.post('/api')
				.send(savingBrew)
				.end((err, res)=>{
					if(err){
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
	},

	render : function(){
		const saveMessages = ['Use Homebrewery storage when you save this brew?', 'Use Google Drive storage when you save this brew?'];

		return <BasePage
			id={this.id}
			brew={this.props.brew}
			callbackSave={this.save}
			callbackTrySave={this.autoSave}
			saveMessages={saveMessages}
			saveGoogle={this.state.saveGoogle}
			pageType='new'
		/>;
	}
});

module.exports = NewPage;
