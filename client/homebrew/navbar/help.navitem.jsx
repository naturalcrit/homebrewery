const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.dropdown>
		<Nav.item color='grey' icon='fas fa-question-circle'>
			need help?
		</Nav.item>
		<Nav.item color='red' icon='fas fa-fw fa-bug'
			href={`https://www.reddit.com/r/homebrewery/submit?selftext=true&text=${encodeURIComponent(dedent`
			**Browser(s)** :
			**Operating System** :  
			**Legacy or v3 Renderer** :
			**Issue** :  `)}`}
			newTab={true}
			rel='noopener noreferrer'>
			report issue
		</Nav.item>
		<Nav.item color='blue' icon='fas fa-fw fa-file-import'
			href='/migrate'
			newTab={true}
			rel='noopener noreferrer'>
			migrate
		</Nav.item>
	</Nav.dropdown>;
};
