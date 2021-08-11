/* eslint-disable max-lines */
require('./editPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const request = require('superagent');

const Markdown = require('naturalcrit/markdown.js');

const BasePage = require('../basePage/basePage.jsx');


const EditPage = createClass({
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
			brew                   : this.props.brew,
			alertTrashedGoogleBrew : this.props.brew.trashed,
			alertLoginToTransfer   : false,
			saveGoogle             : (this.props.brew.googleId ? true : false),
			confirmGoogleTransfer  : false,
			errors                 : null,
			htmlErrors             : Markdown.validate(this.props.brew.text),
			url                    : ''
		};
	},
	savedBrew : null,

	componentDidMount : function(){
		this.savedBrew = JSON.parse(JSON.stringify(this.props.brew)); //Deep copy

		const brew = this.props.brew;
		this.setState((prevState)=>({
			brew       : _.merge({}, prevState.brew, brew),
			url        : window.location.href,
			htmlErrors : Markdown.validate(prevState.brew.text)
		}));

		document.addEventListener('keydown', this.handleControlKeys);
	},

	componentWillUnmount : function() {
		window.onbeforeunload = function(){};
		document.removeEventListener('keydown', this.handleControlKeys);
	},

	isEdit : function() {
		return (true);
	},

	save : async function(brew, saveGoogle){
		this.setState((prevState)=>({
			errors     : null,
			htmlErrors : Markdown.validate(prevState.brew.text)
		}));

		const savingBrew = brew;

		const transfer = saveGoogle == _.isNil(savingBrew.googleId);

		if(saveGoogle) {
			if(transfer) {
				const res = await request
					.post('/api/newGoogle/')
					.send(savingBrew)
					.catch((err)=>{
						console.log(err.status === 401
							? 'Not signed in!'
							: 'Error Transferring to Google!');
						this.setState({ errors: err, saveGoogle: false });
					});

				if(!res) { return; }

				console.log('Deleting Local Copy');
				await request.delete(`/api/${savingBrew.editId}`)
					.send()
					.catch((err)=>{
						console.log('Error deleting Local Copy');
					});

				this.savedBrew = res.body;
				history.replaceState(null, null, `/edit/${this.savedBrew.googleId}${this.savedBrew.editId}`); //update URL to match doc ID
			} else {
				const res = await request
					.put(`/api/updateGoogle/${savingBrew.editId}`)
					.send(savingBrew)
					.catch((err)=>{
						console.log(err.status === 401
							? 'Not signed in!'
							: 'Error Saving to Google!');
						this.setState({ errors: err });
						return;
					});

				this.savedBrew = res.body;
			}
		} else {
			if(transfer) {
				const res = await request.post('/api')
					.send(savingBrew)
					.catch((err)=>{
						console.log('Error creating Local Copy');
						this.setState({ errors: err });
						return;
					});

				await request.get(`/api/removeGoogle/${savingBrew.googleId}${savingBrew.editId}`)
					.send()
					.catch((err)=>{
						console.log('Error Deleting Google Brew');
					});

				this.savedBrew = res.body;
				history.replaceState(null, null, `/edit/${this.savedBrew.editId}`); //update URL to match doc ID
			} else {
				const res = await request
					.put(`/api/update/${savingBrew.editId}`)
					.send(savingBrew)
					.catch((err)=>{
						console.log('Error Updating Local Brew');
						this.setState({ errors: err });
						return;
					});

				this.savedBrew = res.body;
			}
		}

		this.setState((prevState)=>({
			brew : _.merge({}, prevState.brew, {
				googleId : this.savedBrew.googleId ? this.savedBrew.googleId : null,
				editId 	 : this.savedBrew.editId,
				shareId  : this.savedBrew.shareId
			}),
		}));
	},

	render : function(){
		const saveMessages = ['Would you like to transfer this brew from your Google Drive storage back to the Homebrewery?', 'Would you like to transfer this brew from the Homebrewery to your personal Google Drive storage?'];

		return <BasePage
			id={this.id}
			brew={this.props.brew}
			callbackSave={this.save}
			callbackTrySave={this.save}
			saveMessages={saveMessages}
			saveGoogle={this.state.saveGoogle}
			pageType='edit'
		/>;
	}
});

module.exports = EditPage;
