export function getRedditLink(brew) {
	const systems = brew.systems.length > 0 ? ` [${brew.systems.join(' - ')}]` : '';
	const title = `${brew.title} ${systems}`;
	const description = ()=>{
		if(brew.description.length > 0){
			return `
-----

"${brew.description}"

-----
`;
		} else return '';
	};
	const text = `Hey folks! I've been working on this homebrew. I'd love your feedback. Check it out.
${description()}
**[Homebrewery Link](${global.config.publicUrl}/share/${brew.shareId})**`;

	return `https://www.reddit.com/r/UnearthedArcana/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`
}