import React from 'react';
import dedent from 'dedent';
import Nav from './nav.jsx';

const getShareId = (brew)=>{
	if(!brew) return null;
	return brew.googleId && !brew.stubbed
		? brew.googleId + brew.shareId
		: brew.shareId;
};
const getEditId = (brew)=>{
	if(!brew) return null;
	return brew.googleId && !brew.stubbed ? brew.googleId + brew.editId : brew.editId;
};

const getRedditLink = (brew)=>{
	const text = dedent`
			Hey guys! I've been working on this homebrew. I'd love your feedback. Check it out.

			**[Homebrewery Link](${global.config.baseUrl}/share/${getShareId(brew)})**`;

	return `https://www.reddit.com/r/UnearthedArcana/submit?title=${encodeURIComponent(brew.title.toWellFormed())}&text=${encodeURIComponent(text)}`;
};

export default ({ brew, disabled, currentPage, pageName })=>{
	return (
		<div className='nav-section'>
			<Nav.item icon='fas fa-code' href={`/source/${getShareId(brew)}`} disabled={disabled}>
				View Raw Text
			</Nav.item>
			<Nav.item icon={'fas fa-pencil'} href={`/edit/${getEditId(brew)}`} disabled={disabled || !brew?.editId || pageName === 'editPage'}>
				edit this brew
			</Nav.item>
			<Nav.item icon={'fas fa-share-alt'} href={`/share/${getShareId(brew)}`} disabled={disabled}>
				view share page
			</Nav.item>
			<Nav.item icon={'far fa-copy'} onClick={()=>{navigator.clipboard.writeText(`${global.config.baseUrl}/share/${getShareId(brew)}`);}} disabled={disabled}>
				copy share url
			</Nav.item>
			{currentPage > 1 &&
			<Nav.item
				onClick={()=>{navigator.clipboard.writeText(`${global.config.baseUrl}/share/${getShareId(brew)}#p${currentPage}`);}}>
				copy url (page {currentPage})
			</Nav.item>}
			<Nav.item icon={'fab fa-reddit-alien'} href={!disabled && getRedditLink(brew)} newTab rel='noopener noreferrer' disabled={disabled}>
				post to reddit
			</Nav.item>
		</div>
	);
};
