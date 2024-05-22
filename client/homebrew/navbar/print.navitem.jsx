const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	const printPage = () => {
		if (window.typeof !== 'undefined')
			window.frames['BrewRenderer'].contentWindow.print();
	};

	return <Nav.item onClick={printPage} color='purple' icon='far fa-file-pdf'>
		get PDF
	</Nav.item>;
};
