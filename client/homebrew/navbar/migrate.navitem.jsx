const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.item
		className='migrate'
		newTab={false}
		href='/migrate'
		color='blue'
		icon='fas fa-route'>
		migrate
	</Nav.item>;
};
