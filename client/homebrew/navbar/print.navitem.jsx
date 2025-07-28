const React = require('react');
const { MenuItem } = require('../../components/menubar/Menubar.jsx');
const { printCurrentBrew } = require('../../../shared/helpers.js');


const PrintNavItem = () => {
	return <MenuItem onClick={printCurrentBrew} color='yellow' icon='far fa-file-pdf'>
		get PDF
	</MenuItem>;
};
PrintNavItem.displayName = 'PrintNavItem';

module.exports = PrintNavItem;

