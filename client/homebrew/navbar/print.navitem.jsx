const React = require('react');
const {NavItem} = require('./navbar.jsx');
const { printCurrentBrew } = require('../../../shared/helpers.js');


const PrintNavItem = () => {
	return <NavItem onClick={printCurrentBrew} color='yellow' icon='far fa-file-pdf'>
		get PDF
	</NavItem>;
};
PrintNavItem.displayName = 'PrintNavItem';

module.exports = PrintNavItem;

