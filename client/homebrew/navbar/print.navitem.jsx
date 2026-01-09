const React = require('react');
const Nav = require('client/homebrew/navbar/nav.jsx');
const { printCurrentBrew } = require('../../../shared/helpers.js');

module.exports = function(props){
	return <Nav.dropdown>
		<Nav.item color='grey' icon='fas fa-question-circle'>
			export
		</Nav.item>
		<Nav.item onClick={printCurrentBrew} color='purple' icon='far fa-file-pdf'>
			get PDF
		</Nav.item>
		<Nav.item color='orange' icon='fas fa-file-code' href={`/export/slimHTML/${props?.brew?.editId || props?.brew?.shareId}`}>
			get HTML (Slim)
		</Nav.item>
		<Nav.item color='orange' icon='fas fa-file-archive' href={`/export/zipHTML/${props?.brew?.editId || props?.brew?.shareId}`}>
			get HTML (Zip)
		</Nav.item>
		<Nav.item color='orange' icon='far fa-file-code'  href={`/export/inlineHTML/${props?.brew?.editId || props?.brew?.shareId}`}>
			get HTML (Inline)
		</Nav.item>
	</Nav.dropdown>;
};
