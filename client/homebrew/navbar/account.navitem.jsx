const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	const items = [];
	let logged = false;
	let username = null;

	if(global.account){
		logged = true;
		username = global.account.username;
	} else if(global.oldAccount) {
		logged = true;
		username = global.oldAccount.username;
	}

	if(logged) {
		items.push({
			href : `/account`,
			text : 'My account'
		});
		items.push({
			href : '/logout',
			text : 'Log out'
		});

		return <Nav.dropdown items={items} color='yellow'>
			<a href={`/user/${username}`}>{username}</a>
			<Nav.icon icon='fa-user' />
		</Nav.dropdown>;
	}

	let url = '';
	if(typeof window !== 'undefined'){
		url = window.location.href;
	}

	items.push({
		href : '/register',
		text : 'Register'
	});

	return <Nav.dropdown items={items} color='teal'>
		<a href={`/login?redirect=${url}`}>Login</a>
		<Nav.icon icon='fa-sign-in' />
	</Nav.dropdown>;
};