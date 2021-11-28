/* eslint-disable max-lines */
require('./editPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');

const EditorPage = require('../basePages/editorPage/editorPage.jsx');

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

	render : function(){
		const googleDriveOptions = [
			'Would you like to transfer this brew from your Google Drive storage back to the Homebrewery?',
			'Would you like to transfer this brew from the Homebrewery to your personal Google Drive storage?'
		];

		return <EditorPage
			pageType='edit'
			brew={this.props.brew}
			googleDriveOptions = {googleDriveOptions}
			printLink={`/print/${this.processShareId()}?dialog=true`}
		></EditorPage>;
	}
});

module.exports = EditPage;
