/* eslint-disable max-lines */
require('./editPage.less');
const React = require('react');
const createClass = require('create-react-class');

const _ = require('lodash');
const request = require('superagent');

const EditorPage = require('../basePages/editorPage/editorPage.jsx');

const Nav = require('naturalcrit/nav/nav.jsx');
const NewBrew = require('../../navbar/newbrew.navitem.jsx');
const PrintLink = require('../../navbar/print.navitem.jsx');

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

	processShareId : function() {
		return this.props.brew.googleId ?
					 this.props.brew.googleId + this.props.brew.shareId :
					 this.props.brew.shareId;
	},

	renderNavElements : function(googleId, shareId) {
		const shareLink = googleId ? googleId + shareId : shareId;
		return <>
			<NewBrew />
			<Nav.dropdown>
				<Nav.item color='teal' icon='fas fa-share-alt'>
					share
				</Nav.item>
				<Nav.item color='blue' href={`/share/${shareLink}`}>
					view
				</Nav.item>
				<Nav.item color='blue' onClick={()=>{navigator.clipboard.writeText(`https://homebrewery.naturalcrit.com/share/${shareLink}`);}}>
					copy url
				</Nav.item>
				<Nav.item color='blue' href={this.getRedditLink(shareLink)} newTab={true} rel='noopener noreferrer'>
					post to reddit
				</Nav.item>
			</Nav.dropdown>
			<PrintLink url={`/print/${shareLink}?dialog=true`}/>
		</>;
	},

	getRedditLink : function(shareLink){

		shareLink = shareLink || this.processShareId();
		const systems = this.props.brew.systems.length > 0 ? ` [${this.props.brew.systems.join(' - ')}]` : '';
		const title = `${this.props.brew.title} ${systems}`;
		const text = `Hey guys! I've been working on this homebrew. I'd love your feedback. Check it out.

**[Homebrewery Link](https://homebrewery.naturalcrit.com/share/${shareLink})**`;

		return `https://www.reddit.com/r/UnearthedArcana/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
	},

	autoSave : async function(brew, saveGoogle){
		return await this.save(brew, saveGoogle);
	},

	save : async function(brew, saveGoogle){
		// console.log(brew);

		brew.pageCount = ((brew.renderer=='legacy' ? brew.text.match(/\\page/g) : brew.text.match(/^\\page$/gm)) || []).length + 1;

		if(saveGoogle) {
			const res = await request
				.put(`/api/updateGoogle/${brew.editId}`)
				.send(brew)
				.catch((err)=>{
					console.log(err.status === 401
						? 'Not signed in!'
						: 'Error Saving to Google!');
					// this.setState({ errors: err });
					return;
				});

			brew = res.body;
		} else {
			const res = await request
			.put(`/api/update/${brew.editId}`)
			.send(brew)
			.catch((err)=>{
				console.log('Error Updating Local Brew');
				// this.setState({ errors: err });
				return;
			});

			brew = res.body;
		}

		return brew;
	},

	transfer : async function(brew, saveGoogle){
		let outputUrl = '';
		if(saveGoogle) {
			const res = await request
			.post('/api/newGoogle/')
			.send(brew)
			.catch((err)=>{
				console.log(err.status === 401
					? 'Not signed in!'
					: 'Error Transferring to Google!');
				this.setState({ errors: err, saveGoogle: false });
			});

			if(!res) { return; }

			console.log('Deleting Local Copy');
			await request.delete(`/api/${brew.editId}`)
			.send()
			.catch((err)=>{
				console.log('Error deleting Local Copy');
			});

			brew = res.body;
			outputUrl = `/edit/${brew.googleId}${brew.editId}`;
		} else {
			const res = await request.post('/api')
			.send(brew)
			.catch((err)=>{
				console.log('Error creating Local Copy');
				this.setState({ errors: err });
				return;
			});

			await request.get(`/api/removeGoogle/${brew.googleId}${brew.editId}`)
			.send()
			.catch((err)=>{
				console.log('Error Deleting Google Brew');
			});

			brew = res.body;
			outputUrl = `/edit/${brew.editId}`; //update URL to match doc ID
		}
		if(outputUrl){ history.replaceState(null, null, outputUrl); }

		return brew;
	},

	render : function(){
		const googleDriveOptions = [
			'Would you like to transfer this brew from your Google Drive storage back to the Homebrewery?',
			'Would you like to transfer this brew from the Homebrewery to your personal Google Drive storage?'
		];

		return <EditorPage
			pageType='edit'
			brew={this.props.brew}
			googleDriveOptions={googleDriveOptions}
			renderNavElements={this.renderNavElements}
			autoSave={this.autoSave}
			save={this.save}
			transfer={this.transfer}
		></EditorPage>;
	}
});

module.exports = EditPage;
