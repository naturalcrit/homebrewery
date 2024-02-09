const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.item
		href='/new'
		newTab={true}
		color='purple'
		icon='fas fa-plus-square'>
		new
	</Nav.item>;
};
