const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');
const { printPage } = require('../../../shared/helpers.js');

module.exports = function(){
	return <Nav.item onClick={printPage} color='purple' icon='far fa-file-pdf'>
		get PDF
	</Nav.item>;
};
