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
			href={`https://www.reddit.com/r/homebrewery/submit?selftext=true&text=Browser%28s%29%3A++%0D%0AOperating+System%3A++%0D%0ALegacy+or+v3+renderer%3F%3A++%0D%0AIssue%3A++`}
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
