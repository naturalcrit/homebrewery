const React = require('react');
const createClass = require('create-react-class');
const Nav = require('naturalcrit/nav/nav.jsx');

const translateOpts = ['nav'];

module.exports = function(props){
	''.setTranslationDefaults(translateOpts);
	return <Nav.item newTab={true} href={`/print/${props.shareId}?dialog=true`} color='purple' icon='far fa-file-pdf'>
		{'get pdf'.translate()}
	</Nav.item>;
};
