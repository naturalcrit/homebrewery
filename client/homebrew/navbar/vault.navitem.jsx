const React = require('react');

const { NavItem } = require('./navbar.jsx');


const VaultNavItem = () => {
	return (
		<NavItem
			color='purple'
			icon='fas fa-dungeon'
			href='/vault'
			newTab={false}
			rel='noopener noreferrer'
		>
			Vault
		</NavItem>
	);
};

VaultNavItem.displayName = 'VaultNavItem';

module.exports = VaultNavItem;
