const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function({printFunction}){
	return <Nav.item onClick={printFunction} color='purple' icon='far fa-file-pdf'>
		get PDF
	</Nav.item>;
};
