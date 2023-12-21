const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

const translateOpts = ['nav', 'newDoc'];

module.exports = function(props){
	return <Nav.item
		href='/new'
		color='purple'
		icon='fas fa-plus-square'>
		{'new'.translate(translateOpts)}
	</Nav.item>;
};
