require('./brewItem.less');
import React from 'react';
const { useState, useCallback } = React;
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
	layout = 'card',
	...props
})=>{

	// this controls the button/display of the 'additional options' menu on each card.
	// it could be made simpler & better with Popover + Anchor Positioning, but until
	// Anchor Positioning is available in all browsers, this is probably fine.
	// Benefits would include easy 'light dismiss'.
	const [itemExpanded, setItemExpanded] = useState(false);

	const getShareLink = ()=>{
		if(!brew.shareId) return null;

		let shareLink = brew.shareId;
		if(brew.googleId && !brew.stubbed) {
			shareLink = brew.googleId + shareLink;
		}

		return shareLink;
	};

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
		if(!brew.authors.includes(global.account?.username)) return null;

		return (
			<a className='deleteLink' title='Delete brew' onClick={deleteBrew}>
				<i className='fas fa-trash-alt' title='Delete' />
			</a>
		);
	};

	const renderEditLink = ()=>{
		console.log(brew);
		if(!brew.authors.includes(global.account?.username)) return null;

		console.log('editId?');

		let editLink = brew.editId;
		if(brew.googleId && !brew.stubbed) editLink = brew.googleId + editLink;

		return (
			<a className='editLink' title='Open Edit page' href={`/edit/${editLink}`} target='_blank' rel='noopener noreferrer'>
				<i className='fas fa-pencil-alt' title='Edit' />
			</a>
		);
	};

	const renderShareLink = ()=>{
		return (
			<a className='shareLink' title='Open Share page' href={`/share/${getShareLink()}`} target='_blank' rel='noopener noreferrer'>
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
			<a className='downloadLink' title='Download brew as .txt file' href={`/download/${shareLink}`}>
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
			return b.indexOf(':') - a.indexOf(':') !== 0 ? b.indexOf(':') - a.indexOf(':') : a.toLowerCase().localeCompare(b.toLowerCase());
		});
	}

	const dateFormatString = 'YYYY-MM-DD HH:mm:ss';


	return (
		<article id={props.id} 
			className={`brewItem ${layout}-layout${itemExpanded ? ' expanded' : ''}`}
			aria-label={brew.title}
			tabIndex='0'
		>
			<img className='thumbnail' src={brew.thumbnail} role='presentation' />
			<div className='header'>
				<button onClick={()=>{setItemExpanded(!itemExpanded)}}><i className='fas fa-ellipsis'></i><span className='sr-only'>Open options menu</span></button>
				<div className='title'>
					<h2><a href={`/share/${getShareLink()}`} rel='noopener noreferrer'>{brew.title}</a></h2>
				</div>
				<div className='info'>
					<span title={`Authors:\n${brew.authors?.join('\n')}`}>
						<i className='fas fa-user' />{' '}
						{brew.authors?.map((author, index)=>(
							<React.Fragment key={index}>
								{author === 'hidden' ? (
									<span title="Username contained an email address; hidden to protect user's privacy">
										{author}
									</span>
								) : (<a href={`/user/${author}`}>{author}</a>)}
								{index < brew.authors.length - 1 && ', '}
							</React.Fragment>
						))}
					</span>
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
			</div>
			


			<div className='text'>
				{brew.description?.length ?
					<div className='description'>{brew.description}</div>
					: null}
				{brew.tags?.length ? (
					<div className='brew-tags' title={`${brew.tags.length} tags:\n${brew.tags.join('\n')}`}>
						<i className='fas fa-tags' />
						{brew.tags.map((tag, idx)=>{
							const matches = tag.match(/^(?:([^:]+):)?([^:]+)$/);
							return <span key={idx} className={matches[1]} onClick={()=>updateFilter(tag)}>{matches[2]}</span>;
						})}
					</div>
				) : null}
				{itemExpanded ? <div className='links'>
					{renderShareLink()}
					{renderEditLink()}
					{renderDownloadLink()}
					{renderDeleteBrewLink()}
				</div>
					: ''}
			</div>
			<div className='badges'>
				{brew.authors.includes(global.account.username) && <i className='fas fa-user'></i>}
				{brew.invitedAuthors?.includes(global.account.username) && <i className='fas fa-envelope'></i>}
				{/* non-working examples of future badges */}
				{/* {brew.pinned && <i className='fas fa-thumbtack'></i>} */}
				{/* {brew.locked && <i className='fas fa-lock'></i>} */}
			</div>
		</article>
	);
};

module.exports = BrewItem;
