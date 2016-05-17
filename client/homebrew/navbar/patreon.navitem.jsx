var React = require('react');
var Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.item newTab={true} href='https://www.patreon.com/stolksdorf' color='green' icon='fa-gift'>
		help out
	</Nav.item>
};