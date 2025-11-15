const React = require('react');
const Nav = require('client/homebrew/navbar/nav.jsx');

module.exports = function(props){
	return <Nav.item
		className='patreon'
		newTab={true}
		href='https://www.patreon.com/NaturalCrit'
		color='green'
		icon='fas fa-heart'>
		help out
	</Nav.item>;
};
