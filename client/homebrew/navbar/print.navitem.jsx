const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');
const { printCurrentBrew } = require('../../../shared/helpers.js');

module.exports = function(){
	return <Nav.item onClick={printCurrentBrew} color='purple' icon='far fa-file-pdf'>
		get PDF
	</Nav.item>;
};
