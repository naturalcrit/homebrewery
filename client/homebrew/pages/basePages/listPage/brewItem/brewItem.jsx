require('./brewItem.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const moment = require('moment');
const request = require('../../../../utils/request-middleware.js');

const googleDriveIcon = require('../../../../googleDrive.svg');
const homebreweryIcon = require('../../../../thumbnail.png');
const dedent = require('dedent-tabs').default;

const translateOpts = ['userPage','brewInfo'];

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
			reportError : ()=>{}
		};
	},

	deleteBrew : function(){

		if(this.props.brew.authors.length <= 1){
			if(!confirm('onlyAuthorDelete'.translate(['editPage', 'propertiesTab']))) return;
			if(!confirm('confirm1'.translate(['editPage', 'propertiesTab']))) return;
		} else {
			if(!confirm('multipleAuthorDelete'.translate(['editPage', 'propertiesTab']))) return;
			if(!confirm('confirm2'.translate(['editPage', 'propertiesTab']))) return;
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

	renderDeleteBrewLink : function(){
		if(!this.props.brew.editId) return;

		return <a className='deleteLink' onClick={this.deleteBrew}>
			<i className='fas fa-trash-alt' title={'Delete'.translate()} />
		</a>;
	},

	renderEditLink : function(){
		if(!this.props.brew.editId) return;

		let editLink = this.props.brew.editId;
		if(this.props.brew.googleId && !this.props.brew.stubbed) {
			editLink = this.props.brew.googleId + editLink;
		}

		return <a className='editLink' href={`/edit/${editLink}`} target='_blank' rel='noopener noreferrer'>
			<i className='fas fa-pencil-alt' title={'Edit'.translate()} />
		</a>;
	},

	renderShareLink : function(){
		if(!this.props.brew.shareId) return;

		let shareLink = this.props.brew.shareId;
		if(this.props.brew.googleId && !this.props.brew.stubbed) {
			shareLink = this.props.brew.googleId + shareLink;
		}

		return <a className='shareLink' href={`/share/${shareLink}`} target='_blank' rel='noopener noreferrer'>
			<i className='fas fa-share-alt' title={'Share'.translate()} />
		</a>;
	},

	renderDownloadLink : function(){
		if(!this.props.brew.shareId) return;

		let shareLink = this.props.brew.shareId;
		if(this.props.brew.googleId && !this.props.brew.stubbed) {
			shareLink = this.props.brew.googleId + shareLink;
		}

		return <a className='downloadLink' href={`/download/${shareLink}`}>
			<i className='fas fa-download' title={'Download'.translate()} />
		</a>;
	},

	renderStorageIcon : function(){
		if(this.props.brew.googleId) {
			return <span title={this.props.brew.webViewLink ? 'gdTitle'.translate(): 'gdTitle2'.translate()}>
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
		''.setTranslationDefaults(translateOpts);
		const brew = this.props.brew;
		if(Array.isArray(brew.tags)) {               // temporary fix until dud tags are cleaned
			brew.tags = brew.tags?.filter((tag)=>tag); //remove tags that are empty strings
		}
		const dateFormatString = 'dateFormat'.translate();

		return <div className='brewItem'>
			{brew.thumbnail &&
				<div className='thumbnail' style={{ backgroundImage: `url(${brew.thumbnail})` }} >
				</div>
			}y
			<div className='text'>
				<h2>{brew.title}</h2>
				<p className='description'>{brew.description}</p>
			</div>
			<hr />
			<div className='info'>

				{brew.tags?.length ? <>
					<div className='brewTags' title={`Tags:\n${brew.tags.join('\n')}`}>
						<i className='fas fa-tags'/>
						{brew.tags.map((tag, idx)=>{
							const matches = tag.match(/^(?:([^:]+):)?([^:]+)$/);
							return <span key={idx} className={matches[1]}>{matches[2]}</span>;
						})}
					</div>
				</> : <></>
				}
				<span title={`${'Authors'.translate()}\n${brew.authors?.join('\n')}`}>
					<i className='fas fa-user'/> {brew.authors?.join(', ')}
				</span>
				<br />
				<span title={`${'lastViewed'.translate()} ${moment(brew.lastViewed).local().format(dateFormatString)}`}>
					<i className='fas fa-eye'/> {brew.views}
				</span>
				{brew.pageCount &&
					<span title={`${'pageCount'.translate()}} ${brew.pageCount}`}>
						<i className='far fa-file' /> {brew.pageCount}
					</span>
				}
				<span title={dedent`
					${'created'.translate()} ${moment(brew.createdAt).local().format(dateFormatString)}
					${'lastUpdated'.translate()} ${moment(brew.updatedAt).local().format(dateFormatString)}`}>
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
