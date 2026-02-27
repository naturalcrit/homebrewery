import React from 'react';
import Nav from './nav.jsx';

export default function(props){
	return <Nav.item
		className='patreon'
		newTab={true}
		href='https://www.patreon.com/NaturalCrit'
		color='green'
		icon='fas fa-heart'>
		help out
	</Nav.item>;
};
