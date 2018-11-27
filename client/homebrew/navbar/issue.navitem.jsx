const React = require('react');
const createClass = require('create-react-class');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.item
		newTab={true}
		color='red'
		icon='fa-bug'
		href={`https://www.reddit.com/r/homebrewery/submit?selftext=true&title=${encodeURIComponent('[Issue] Describe Your Issue Here')}`} >
		report issue
	</Nav.item>;
};