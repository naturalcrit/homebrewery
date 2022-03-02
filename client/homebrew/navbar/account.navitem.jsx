const React = require('react');
const createClass = require('create-react-class');
const Nav = require('naturalcrit/nav/nav.jsx');

const Account = createClass({
	displayName     : 'AccountNavItem',
	getInitialState : function() {
		return {
			url : ''
		};
	},

	componentDidMount : function(){
		if(typeof window !== 'undefined'){
			this.setState({
				url : window.location.href
			});
		}
	},

	handleLogout : function(){
		if(confirm('Are you sure you want to log out?')) {
			document.cookie = `nc_session=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;samesite=lax;${window.domain ? `domain=${window.domain}` : ''}`;
			window.location = '/';
		};
	},

	render : function(){
		if(global.account){
			return <Nav.dropdown>
				<Nav.item
					className='account'
					color='orange'
					icon='fas fa-user'
				>
					{global.account.username}
				</Nav.item>
				<Nav.item
					href='/account'
					className='account'
					color='blue'
					icon='fas fa-user'
				>
					account
				</Nav.item>
				<Nav.item
					href={`/user/${global.account.username}`}
					color='yellow'
					icon='fas fa-beer'
				>
					brews
				</Nav.item>
				<Nav.item
					className='logout'
					color='red'
					icon='fas fa-power-off'
					onClick={this.handleLogout}
				>
					logout
				</Nav.item>
			</Nav.dropdown>;
		}

		return <Nav.item href={`https://www.naturalcrit.com/login?redirect=${this.state.url}`} color='teal' icon='fas fa-sign-in-alt'>
			login
		</Nav.item>;
	}
});

module.exports = Account;
