const React = require('react');
const { MenuItem } = require('../../components/menubar/Menubar.jsx');

const PatreonNavItem = ({...props})=>{
	return <MenuItem
		className='patreon'
		newTab={true}
		href='https://www.patreon.com/NaturalCrit'
		color='green'
		icon='fas fa-heart'>
		Patreon
	</MenuItem>;
};

module.exports = PatreonNavItem;