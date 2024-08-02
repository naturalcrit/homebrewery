const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');
const { printCurrentBrew, createBrewCBZ } = require('../../../shared/helpers.js');

module.exports = function(){
	return <Nav.dropdown>
		<Nav.item
			className='export'
			color='purple'
			icon='fa-solid fa-file-export'>
			export
		</Nav.item>
		<Nav.item onClick={printCurrentBrew} color='purple' icon='far fa-file-pdf'>
			PDF
		</Nav.item>
		<Nav.item onClick={createBrewCBZ} color='purple' icon='far fa-file-archive'>
			CBZ
		</Nav.item>
	</Nav.dropdown>;
};
