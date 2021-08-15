require('./brewItem.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const moment = require('moment');
const request = require('superagent');

const googleDriveIcon = require('../../../googleDrive.png');

const BrewItem = createClass({
	getDefaultProps : function() {
		return {
			brew : {
				title       : '',
				description : '',

				authors : []
			}
		};
	},

	deleteBrew : function(){
		if(this.props.brew.authors.length <= 1){
			if(!confirm('Are you sure you want to delete this brew? Because you are the only owner of this brew, the document will be deleted permanently.')) return;
			if(!confirm('Are you REALLY sure? You will not be able to recover the document.')) return;
		} else {
			if(!confirm('Are you sure you want to remove this brew from your collection? This will remove you as an editor, but other owners will still be able to access the document.')) return;
			if(!confirm('Are you REALLY sure? You will lose editor access to this document.')) return;
		}

		if(this.props.brew.googleId) {
			request.get(`/api/removeGoogle/${this.props.brew.googleId}${this.props.brew.editId}`)
				.send()
				.end(function(err, res){
					location.reload();
				});
		} else {
			request.delete(`/api/${this.props.brew.editId}`)
				.send()
				.end(function(err, res){
					location.reload();
				});
		}
	},

	renderDeleteBrewLink : function(){
		if(!this.props.brew.editId) return;

		return <a onClick={this.deleteBrew}>
			<i className='fas fa-trash-alt' />
		</a>;
	},

	renderEditLink : function(){
		if(!this.props.brew.editId) return;

		let editLink = this.props.brew.editId;
		if(this.props.brew.googleId) {
			editLink = this.props.brew.googleId + editLink;
		}

		return <a href={`/edit/${editLink}`} target='_blank' rel='noopener noreferrer'>
			<i className='fas fa-pencil-alt' />
		</a>;
	},

	renderShareLink : function(){
		if(!this.props.brew.shareId) return;

		let shareLink = this.props.brew.shareId;
		if(this.props.brew.googleId) {
			shareLink = this.props.brew.googleId + shareLink;
		}

		return <a href={`/share/${shareLink}`} target='_blank' rel='noopener noreferrer'>
			<i className='fas fa-share-alt' />
		</a>;
	},

	renderDownloadLink : function(){
		if(!this.props.brew.shareId) return;

		let shareLink = this.props.brew.shareId;
		if(this.props.brew.googleId) {
			shareLink = this.props.brew.googleId + shareLink;
		}

		return <a href={`/download/${shareLink}`}>
			<i className='fas fa-download' />
		</a>;
	},

	renderGoogleDriveIcon : function(){
		if(!this.props.brew.gDrive) return;

		return <span>
			<img className='googleDriveIcon' src={googleDriveIcon} alt='googleDriveIcon' />
		</span>;
	},

	render : function(){
		const brew = this.props.brew;
		return <div className='brewItem'>
			<h2>{brew.title}</h2>
			<p className='description' >{brew.description}</p>
			<hr />
			<div className='spacer'></div>

			<div className='info'>
				<span>
					<i className='fas fa-user' /> {brew.authors.join(', ')}
				</span>
				<span>
					<i className='fas fa-eye' /> {brew.views}
				</span>
				{(brew?.pageCount>1) &&
					<span>
						<i className='far fa-file' /> {brew.pageCount}
					</span>
				}
				<span>
					<i className='fas fa-sync-alt' /> {moment(brew.updatedAt).fromNow()}
				</span>
				{this.renderGoogleDriveIcon()}
			</div>

			<div className='links'>
				{this.renderShareLink()}
				{this.renderEditLink()}
				{this.renderDownloadLink()}
				{this.renderDeleteBrewLink()}
			</div>
		</div>;
	}
});

module.exports = BrewItem;
