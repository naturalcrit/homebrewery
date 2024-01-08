const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

const translateOpts = ['nav'];

module.exports = function(props){
	''.setTranslationDefaults(translateOpts);
	return <Nav.item
		className='patreon'
		newTab={true}
		href='https://www.patreon.com/NaturalCrit'
		color='green'
		icon='fas fa-heart'>
		{'helpOut'.translate()}
	</Nav.item>;
};
