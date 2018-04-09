const React = require('react');
const createClass = require('create-react-class');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.item newTab={true} href='https://www.reddit.com/r/homebrewery/submit?selftext=true&title=[Issue]' color='red' icon='fa-bug'>
		report issue
	</Nav.item>;
};