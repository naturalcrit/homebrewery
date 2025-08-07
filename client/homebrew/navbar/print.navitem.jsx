const React = require('react');
import { MenuItem } from '../../components/menubar/Menubar.jsx';
const { printCurrentBrew } = require('../../../shared/helpers.js');


const PrintNavItem = () => {
	return <MenuItem onClick={printCurrentBrew} color='yellow' icon='far fa-file-pdf'>
		get PDF
	</MenuItem>;
};
PrintNavItem.displayName = 'PrintNavItem';

module.exports = PrintNavItem;

