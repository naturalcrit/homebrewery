const React = require('react');

const Nav = require('client/homebrew/navbar/nav.jsx');

module.exports = function (props) {
	return (
		<Nav.item
			color='purple'
			icon='fas fa-dungeon'
			href='/vault'
			newTab={false}
			rel='noopener noreferrer'
		>
			Vault
		</Nav.item>
	);
};
