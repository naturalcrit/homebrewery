import React from 'react';

import Nav from './nav.jsx';

export default function (props) {
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
