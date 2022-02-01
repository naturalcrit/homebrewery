const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');

const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.dropdown>
		<Nav.item color='grey' icon='fas fa-question-circle'>
			need help?
		</Nav.item>
		<Nav.item color='red' icon='fas fa-fw fa-bug'
			href={`https://www.reddit.com/r/homebrewery/submit?selftext=true&title=${encodeURIComponent('[Issue] Describe Your Issue Here')}`}
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
