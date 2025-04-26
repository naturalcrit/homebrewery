const React = require('react');

const { MenuItem } = require('../../components/menubar/Menubar.jsx');


const VaultNavItem = () => {
	return (
		<MenuItem
			color='purple'
			icon='fas fa-dungeon'
			href='/vault'
			newTab={false}
			rel='noopener noreferrer'
		>
			Vault
		</MenuItem>
	);
};

VaultNavItem.displayName = 'VaultNavItem';

module.exports = VaultNavItem;
