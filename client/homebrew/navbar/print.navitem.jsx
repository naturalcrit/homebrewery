const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

const PrintNavItem = function(props){
	return <Nav.item
		onClick={()=>{ return window.frames['BrewRenderer'].contentWindow.print(); }}
		color='purple'
		icon='far fa-file-pdf'
	>
		print
	</Nav.item>;
};

module.exports = PrintNavItem;