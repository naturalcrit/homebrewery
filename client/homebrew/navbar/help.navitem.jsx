const React = require('react');
const dedent = require('dedent-tabs').default;

const {NavItem} = require('./navbar.jsx');

module.exports = function(){
	return <>
		<NavItem color='red' icon='fas fa-fw fa-bug'
			href={`https://www.reddit.com/r/homebrewery/submit?selftext=true&text=${encodeURIComponent(dedent`
			- **Browser(s)** :
			- **Operating System** :  
			- **Legacy or v3 Renderer** :
			- **Issue** :  `)}`}
			newTab={true}
			rel='noopener noreferrer'>
			report to reddit
		</NavItem>
		<NavItem color='green'
			href='/faq'
			newTab={true}
			rel='noopener noreferrer'>
			FAQ
		</NavItem>
		<NavItem color='blue'
			href='/migrate'
			newTab={true}
			rel='noopener noreferrer'>
			migrate
		</NavItem>
	</>;
};
