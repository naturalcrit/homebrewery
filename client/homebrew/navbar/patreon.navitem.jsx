const React = require('react');
const createClass = require('create-react-class');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.link
		className='patreon'
		newTab={true}
		href='https://www.patreon.com/stolksdorf'
		color='green'
		icon='fa-heart'>
		help out
	</Nav.link>;
};