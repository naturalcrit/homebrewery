require('./brewItem.less');
const React = require('react');
const createClass = require('create-react-class');
const moment = require('moment');
const request = require('../../../../utils/request-middleware.js');

const googleDriveIcon = require('../../../../googleDrive.svg');
const homebreweryIcon = require('../../../../thumbnail.png');
const dedent = require('dedent-tabs').default;

const BrewItem = createClass({
	displayName     : 'BrewItem',
	getDefaultProps : function() {
		return {
			brew : {
				title       : '',
				description : '',
				authors     : [],
				stubbed     : true
			},
			updateListFilter : ()=>{},
			reportError      : ()=>{}
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

		request.delete(`/api/${this.props.brew.googleId ?? ''}${this.props.brew.editId}`)
			.send()
			.end((err, res)=>{
				if(err) {
					this.props.reportError(err);
				} else {
					location.reload();
				}
			});
	},

	updateFilter : function(type, term){
		this.props.updateListFilter(type, term);
	},

	renderDeleteBrewLink : function(){
		if(!this.props.brew.editId) return;

		return <a className='deleteLink' onClick={this.deleteBrew}>
			<i className='fas fa-trash-alt' title='Delete' />
		</a>;
	},

	renderEditLink : function(){
		if(!this.props.brew.editId) return;

		let editLink = this.props.brew.editId;
		if(this.props.brew.googleId && !this.props.brew.stubbed) {
			editLink = this.props.brew.googleId + editLink;
		}

		return <a className='editLink' href={`/edit/${editLink}`} target='_blank' rel='noopener noreferrer'>
			<i className='fas fa-pencil-alt' title='Edit' />
		</a>;
	},

	renderShareLink : function(){
		if(!this.props.brew.shareId) return;

		let shareLink = this.props.brew.shareId;
		if(this.props.brew.googleId && !this.props.brew.stubbed) {
			shareLink = this.props.brew.googleId + shareLink;
		}

		return <a className='shareLink' href={`/share/${shareLink}`} target='_blank' rel='noopener noreferrer'>
			<i className='fas fa-share-alt' title='Share' />
		</a>;
	},

	renderDownloadLink : function(){
		if(!this.props.brew.shareId) return;

		let shareLink = this.props.brew.shareId;
		if(this.props.brew.googleId && !this.props.brew.stubbed) {
			shareLink = this.props.brew.googleId + shareLink;
		}

		return <a className='downloadLink' href={`/download/${shareLink}`}>
			<i className='fas fa-download' title='Download' />
		</a>;
	},

	renderStorageIcon : function(){
		if(this.props.brew.googleId) {
			return <span title={this.props.brew.webViewLink ? 'Your Google Drive Storage': 'Another User\'s Google Drive Storage'}>
				<a href={this.props.brew.webViewLink} target='_blank'>
					<img className='googleDriveIcon' src={googleDriveIcon} alt='googleDriveIcon' />
				</a>
			</span>;
		}

		return <span title='Homebrewery Storage'>
			<img className='homebreweryIcon' src={homebreweryIcon} alt='homebreweryIcon' />
		</span>;
	},

	render : function(){
		const brew = this.props.brew;
		if(Array.isArray(brew.tags)) {               // temporary fix until dud tags are cleaned
			brew.tags = brew.tags?.filter((tag)=>tag); //remove tags that are empty strings
			brew.tags.sort((a, b)=>{
				return a.indexOf(':') - b.indexOf(':') != 0 ? a.indexOf(':') - b.indexOf(':') : a.toLowerCase().localeCompare(b.toLowerCase());
			});
		}
		const dateFormatString = 'YYYY-MM-DD HH:mm:ss';

		return <div className='brewItem'>
			{brew.thumbnail &&
				<div className='thumbnail' style={{ backgroundImage: `url(${brew.thumbnail})` }} >
				</div>
			}
			<div className='text'>
				<h2>{brew.title}</h2>
				<p className='description'>{brew.description}</p>
			</div>
			<hr />
			<div className='info'>

				{brew.tags?.length ? <>
					<div className='brewTags' title={`${brew.tags.length} tags:\n${brew.tags.join('\n')}`}>
						<i className='fas fa-tags'/>
						{brew.tags.map((tag, idx)=>{
							const matches = tag.match(/^(?:([^:]+):)?([^:]+)$/);
							return <span key={idx} className={matches[1]} onClick={()=>{this.updateFilter(tag);}}>{matches[2]}</span>;
						})}
					</div>
				</> : <></>
				}
				<span title={`Authors:\n${brew.authors?.join('\n')}`}>
				<i className='fas fa-user'/> 
				{brew.authors?.map((author, index) => (
					<React.Fragment key={index}>
						{author === 'hidden'
							? <span title="Username contained an email address; hidden to protect user's privacy">{author}</span>
							: <a href={`/user/${author}`}>{author}</a>
						}
					</React.Fragment>
				))}
				</span>
				<br />
				<span title={`Last viewed: ${moment(brew.lastViewed).local().format(dateFormatString)}`}>
					<i className='fas fa-eye'/> {brew.views}
				</span>
				{brew.pageCount &&
					<span title={`Page count: ${brew.pageCount}`}>
						<i className='far fa-file' /> {brew.pageCount}
					</span>
				}
				<span title={dedent`
					Created: ${moment(brew.createdAt).local().format(dateFormatString)}
					Last updated: ${moment(brew.updatedAt).local().format(dateFormatString)}`}>
					<i className='fas fa-sync-alt' /> {moment(brew.updatedAt).fromNow()}
				</span>
				{this.renderStorageIcon()}
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
