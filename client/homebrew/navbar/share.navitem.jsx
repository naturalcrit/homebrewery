import React from 'react';
import dedent from 'dedent-tabs';
import Nav from 'client/homebrew/navbar/nav.jsx';

const getShareId = (brew)=>(
	brew.googleId && !brew.stubbed
		? brew.googleId + brew.shareId
		: brew.shareId
);

const getRedditLink = (brew)=>{
	const text = dedent`
			Hey guys! I've been working on this homebrew. I'd love your feedback. Check it out.

			**[Homebrewery Link](${global.config.baseUrl}/share/${getShareId(brew)})**`;

	return `https://www.reddit.com/r/UnearthedArcana/submit?title=${encodeURIComponent(brew.title.toWellFormed())}&text=${encodeURIComponent(text)}`;
};

export default ({ brew })=>(
	<Nav.dropdown>
		<Nav.item color='teal' icon='fas fa-share-alt'>
			share
		</Nav.item>
		<Nav.item color='blue' href={`/share/${getShareId(brew)}`}>
			view
		</Nav.item>
		<Nav.item color='blue' onClick={()=>{navigator.clipboard.writeText(`${global.config.baseUrl}/share/${getShareId(brew)}`);}}>
			copy url
		</Nav.item>
		<Nav.item color='blue' href={getRedditLink(brew)} newTab rel='noopener noreferrer'>
			post to reddit
		</Nav.item>
	</Nav.dropdown>
);
