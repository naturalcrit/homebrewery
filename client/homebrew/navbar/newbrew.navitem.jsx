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
			color='red'
			href='/new/T12ZtZptD5p-'
			icon='fas fa-plus-square'>
			Abenteuer
		</Nav.item>
		<Nav.item
		href='/new/8J58qMYgARSj' 
		color='orange'
		icon='fas fa-plus-square'>
			Spielhilfe
		</Nav.item>
		<Nav.item
		href='/new/4s58mLt3Tkeg'
		color='orange'
		icon='fas fa-plus-square'>
			Kartendeck
		</Nav.item>
	</Nav.dropdown>;
};


