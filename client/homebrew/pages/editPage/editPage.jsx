/* eslint-disable max-lines */
require('./editPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');

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

	renderNavElements : function() {
		return <>
			<NewBrew />
			<Nav.dropdown>
				<Nav.item color='teal' icon='fas fa-share-alt'>
					share
				</Nav.item>
				<Nav.item color='blue' href={`/share/${this.processShareId()}`}>
					view
				</Nav.item>
				<Nav.item color='blue' onClick={()=>{navigator.clipboard.writeText(`https://homebrewery.naturalcrit.com/share/${shareLink}`);}}>
					copy url
				</Nav.item>
				<Nav.item color='blue' href={this.getRedditLink()} newTab={true} rel='noopener noreferrer'>
					post to reddit
				</Nav.item>
			</Nav.dropdown>
			<PrintLink url={`/print/${this.processShareId()}?dialog=true`}/>
		</>;
	},

	getRedditLink : function(){

		const shareLink = this.processShareId();
		const systems = this.props.brew.systems.length > 0 ? ` [${this.props.brew.systems.join(' - ')}]` : '';
		const title = `${this.props.brew.title} ${systems}`;
		const text = `Hey guys! I've been working on this homebrew. I'd love your feedback. Check it out.

**[Homebrewery Link](https://homebrewery.naturalcrit.com/share/${shareLink})**`;

		return `https://www.reddit.com/r/UnearthedArcana/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
	},

	render : function(){
		const googleDriveOptions = [
			'Would you like to transfer this brew from your Google Drive storage back to the Homebrewery?',
			'Would you like to transfer this brew from the Homebrewery to your personal Google Drive storage?'
		];

		return <EditorPage
			pageType='edit'
			brew={this.props.brew}
			googleDriveOptions = {googleDriveOptions}
			navElements={this.renderNavElements()}
		></EditorPage>;
	}
});

module.exports = EditPage;
