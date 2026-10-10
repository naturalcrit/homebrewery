import React from 'react';
import dedent from 'dedent';
import Nav from './nav.jsx';

const getShareId = (brew)=>{
	if(!brew) return null;
	return brew.googleId && !brew.stubbed
		? brew.googleId + brew.shareId
		: brew.shareId;
};

const getRedditLink = (brew)=>{
	const text = dedent`
			Hey guys! I've been working on this homebrew. I'd love your feedback. Check it out.

			**[Homebrewery Link](${global.config.baseUrl}/share/${getShareId(brew)})**`;

	return `https://www.reddit.com/r/UnearthedArcana/submit?title=${encodeURIComponent(brew.title.toWellFormed())}&text=${encodeURIComponent(text)}`;
};

export default ({ brew, disabled, currentPage })=>{
	return (
		<div className='nav-section'>
			<Nav.item color='blue' href={`/share/${getShareId(brew)}`} disabled={disabled}>
			view share page
			</Nav.item>
			<Nav.item color='blue' onClick={()=>{navigator.clipboard.writeText(`${global.config.baseUrl}/share/${getShareId(brew)}`);}} disabled={disabled}>
			copy share url
			</Nav.item>
			{currentPage > 1 &&
			<Nav.item
				color='blue'
				onClick={()=>{navigator.clipboard.writeText(`${global.config.baseUrl}/share/${getShareId(brew)}#p${currentPage}`);}}>
				copy url (page {currentPage})
			</Nav.item>}
			<Nav.item color='blue' href={!disabled && getRedditLink(brew)} newTab rel='noopener noreferrer' disabled={disabled}>
			post to reddit
			</Nav.item>
		</div>
	);
};
