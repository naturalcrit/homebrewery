const React = require('react');
const dedent = require('dedent-tabs').default;
import { LinkItem } from './menubarExtensions.jsx';


module.exports = {
	faq : function(){
		return <LinkItem
			href={`/faq`}
			target='_blank'
			rel='noopener noreferrer'>FAQ</LinkItem>;
	},

	migrate : function(){
		return <LinkItem
			href={`/migrate`}
			target='_blank'
			rel='noopener noreferrer'>Legacy to v3</LinkItem>;
	},

	issueToReddit : function(){
		return <LinkItem
			href={`https://www.reddit.com/r/homebrewery/submit?selftext=true&text=${encodeURIComponent(dedent`
			- **Browser(s)** :
			- **Operating System** :  
			- **Legacy or v3 Renderer** :
			- **Issue** :  `)}`}
			target='_blank'
			rel='noopener noreferrer'>to Reddit</LinkItem>;
	},

	issueToGithub : function(){
		return <LinkItem
			href={`https://github.com/naturalcrit/homebrewery/issues/new/choose`}
			target='_blank'
			rel='noopener noreferrer'>to Github</LinkItem>;
	},

	DoMT : function(){
		return <LinkItem
			href={`https://discord.gg/domt`}
			target='_blank'
			rel='noopener noreferrer'>Discord of Many Things</LinkItem>;
	},

	rHomebrewery : function(){
		return <LinkItem
			href={`https://www.reddit.com/r/homebrewery`}
			target='_blank'
			rel='noopener noreferrer'>/r/Homebrewery</LinkItem>;
	}

};