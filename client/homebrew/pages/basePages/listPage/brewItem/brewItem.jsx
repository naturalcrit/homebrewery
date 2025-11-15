require('./brewItem.less');
const React = require('react');
const { useCallback } = React;
const moment = require('moment');
import request from '../../../../utils/request-middleware.js';

const googleDriveIcon = require('../../../../googleDrive.svg');
const homebreweryIcon = require('../../../../thumbnail.svg');
const dedent = require('dedent-tabs').default;

const BrewItem = ({
	brew = {
		title       : '',
		description : '',
		authors     : [],
		stubbed     : true,
	},
	updateListFilter = ()=>{},
	reportError = ()=>{},
	renderStorage = true,
})=>{

	const deleteBrew = useCallback(()=>{
		if(brew.authors.length <= 1) {
			if(!window.confirm('Are you sure you want to delete this brew? Because you are the only owner of this brew, the document will be deleted permanently.')) return;
			if(!window.confirm('Are you REALLY sure? You will not be able to recover the document.')) return;
		} else {
			if(!window.confirm('Are you sure you want to remove this brew from your collection? This will remove you as an editor, but other owners will still be able to access the document.')) return;
			if(!window.confirm('Are you REALLY sure? You will lose editor access to this document.')) return;
		}

		request.delete(`/api/${brew.googleId ?? ''}${brew.editId}`).send().end((err, res)=>{
			if(err) reportError(err); else window.location.reload();
		});
	}, [brew, reportError]);

	const updateFilter = useCallback((type, term)=>updateListFilter(type, term), [updateListFilter]);

	const renderDeleteBrewLink = ()=>{
		if(!brew.editId) return null;

		return (
			<a className='deleteLink' onClick={deleteBrew}>
				<i className='fas fa-trash-alt' title='Delete' />
			</a>
		);
	};

	const renderEditLink = ()=>{
		if(!brew.editId) return null;

		let editLink = brew.editId;
		if(brew.googleId && !brew.stubbed) editLink = brew.googleId + editLink;

		return (
			<a className='editLink' href={`/edit/${editLink}`} target='_blank' rel='noopener noreferrer'>
				<i className='fas fa-pencil-alt' title='Edit' />
			</a>
		);
	};

	const renderShareLink = ()=>{
		if(!brew.shareId) return null;

		let shareLink = brew.shareId;
		if(brew.googleId && !brew.stubbed) {
			shareLink = brew.googleId + shareLink;
		}

		return (
			<a className='shareLink' href={`/share/${shareLink}`} target='_blank' rel='noopener noreferrer'>
				<i className='fas fa-share-alt' title='Share' />
			</a>
		);
	};

	const renderDownloadLink = ()=>{
		if(!brew.shareId) return null;

		let shareLink = brew.shareId;
		if(brew.googleId && !brew.stubbed) {
			shareLink = brew.googleId + shareLink;
		}

		return (
			<a className='downloadLink' href={`/download/${shareLink}`}>
				<i className='fas fa-download' title='Download' />
			</a>
		);
	};

	const renderStorageIcon = ()=>{
		if(!renderStorage) return null;
		if(brew.googleId) {
			return (
				<span title={brew.webViewLink ? 'Your Google Drive Storage' : 'Another User\'s Google Drive Storage'}>
					<a href={brew.webViewLink} target='_blank'>
						<img className='googleDriveIcon' src={googleDriveIcon} alt='googleDriveIcon' />
					</a>
				</span>
			);
		}

		return (
			<span title='Homebrewery Storage'>
				<img className='homebreweryIcon' src={homebreweryIcon} alt='homebreweryIcon' />
			</span>
		);
	};

	if(Array.isArray(brew.tags)) {
		brew.tags = brew.tags?.filter((tag)=>tag); // remove tags that are empty strings
		brew.tags.sort((a, b)=>{
			return a.indexOf(':') - b.indexOf(':') !== 0 ? a.indexOf(':') - b.indexOf(':') : a.toLowerCase().localeCompare(b.toLowerCase());
		});
	}

	const dateFormatString = 'YYYY-MM-DD HH:mm:ss';

	return (
		<div className='brewItem'>
			{brew.thumbnail && <div className='thumbnail' style={{ backgroundImage: `url(${brew.thumbnail})` }}></div>}
			<div className='text'>
				<h2>{brew.title}</h2>
				<p className='description'>{brew.description}</p>
			</div>
			<hr />
			<div className='info'>
				{brew.tags?.length ? (
					<div className='brewTags' title={`${brew.tags.length} tags:\n${brew.tags.join('\n')}`}>
						<i className='fas fa-tags' />
						{brew.tags.map((tag, idx)=>{
							const matches = tag.match(/^(?:([^:]+):)?([^:]+)$/);
							return <span key={idx} className={matches[1]} onClick={()=>updateFilter(tag)}>{matches[2]}</span>;
						})}
					</div>
				) : null}
				<span title={`Authors:\n${brew.authors?.join('\n')}`}>
					<i className='fas fa-user' />{' '}
					{brew.authors?.map((author, index)=>(
						<React.Fragment key={index}>
							{author === 'hidden' ? (
								<span title="Username contained an email address; hidden to protect user's privacy">
									{author}
								</span>
							) : (<a href={`/user/${encodeURIComponent(author)}`}>{author}</a>)}
							{index < brew.authors.length - 1 && ', '}
						</React.Fragment>
					))}
				</span>
				<br />
				<span title={`Last viewed: ${moment(brew.lastViewed).local().format(dateFormatString)}`}>
					<i className='fas fa-eye' /> {brew.views}
				</span>
				{brew.pageCount && (
					<span title={`Page count: ${brew.pageCount}`}>
						<i className='far fa-file' /> {brew.pageCount}
					</span>
				)}
				<span
					title={dedent` Created: ${moment(brew.createdAt).local().format(dateFormatString)}
                        Last updated: ${moment(brew.updatedAt).local().format(dateFormatString)}`}
				>
					<i className='fas fa-sync-alt' /> {moment(brew.updatedAt).fromNow()}
				</span>
				{renderStorageIcon()}
			</div>

			<div className='links'>
				{renderShareLink()}
				{renderEditLink()}
				{renderDownloadLink()}
				{renderDeleteBrewLink()}
			</div>
		</div>
	);
};

module.exports = BrewItem;
