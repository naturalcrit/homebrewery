const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.item
		className='patreon'
		newTab={true}
		href='https://www.patreon.com/NaturalCrit'
		color='green'
		icon='fa-heart'>
		help out
	</Nav.item>;
};
