const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.dropdown>
		<Nav.item
			color='purple'
			className="newNavButton"
			icon='fas fa-plus-square'>
			Neu
		</Nav.item>
		<Nav.item
			href='/new'
			color='green'
			icon='fas fa-plus-square'>
			Leer
		</Nav.item>
		<Nav.item
			color='purple'
			href='/new/EGy1wlD7TRl7'
			icon='fas fa-plus-square'>
			Abenteuer
		</Nav.item>
		<Nav.item
		href='/new/GiL_1PHMlYZ5'
		color='blue'
		icon='fas fa-plus-square'>
			Spielhilfe
		</Nav.item>
		<Nav.item
		href='/new/GiL_1PHMlYZ5'
		color='orange'
		icon='fas fa-plus-square'>
			Kartendeck
		</Nav.item>
	</Nav.dropdown>;
};


