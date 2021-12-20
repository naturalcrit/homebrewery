const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.item
		className='discord'
		newTab={true}
		href='https://discord.gg/by3deKx'
		color='blurple'
		icon='fab fa-discord'>
        discord
	</Nav.item>;
};