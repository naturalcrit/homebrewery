const React = require('react');
const createClass = require('create-react-class');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.item newTab={true} href={`/print/${props.shareId}?dialog=true`} color='purple' icon='fa-file-pdf-o'>
		get PDF
	</Nav.item>;
};