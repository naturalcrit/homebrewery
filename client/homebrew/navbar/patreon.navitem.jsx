const React = require('react');
const { NavItem } = require('./navbar.jsx');

const PatreonNavItem = ({...props})=>{
	return <NavItem
		className='patreon'
		newTab={true}
		href='https://www.patreon.com/NaturalCrit'
		color='green'
		icon='fas fa-heart'>
		Patreon
	</NavItem>;
};

module.exports = PatreonNavItem;