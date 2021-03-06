const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.item
		href='/new'
		color='purple'
		icon='fa-plus-square'>
		new
	</Nav.item>;
};
