const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

const Store = require('homebrewery/account.store.js');
const Actions = require('homebrewery/account.actions.js');


module.exports = function(props){
	const user = Store.getUser();
	if(user && user == props.userPage){
		return <Nav.item onClick={Actions.logout} color='yellow' icon='fa-user-times'>
			logout
		</Nav.item>
	}
	if(user){
		return <Nav.item href={`/user/${user}`} color='yellow' icon='fa-user'>
			{user}
		</Nav.item>
	}
	return <Nav.item onClick={Actions.login} color='teal' icon='fa-sign-in'>
		login
	</Nav.item>
};