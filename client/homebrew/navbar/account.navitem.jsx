const React = require('react');
const createClass = require('create-react-class');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	if(global.account){
		return <Nav.item href={`/user/${global.account.username}`} color='yellow' icon='fa-user'>
			{global.account.username}
		</Nav.item>;
	}
	let url = '';
	if(typeof window !== 'undefined'){
		url = window.location.href;
	}
	return <Nav.item href={`http://naturalcrit.com/login?redirect=${url}`} color='teal' icon='fa-sign-in'>
		login
	</Nav.item>;
};