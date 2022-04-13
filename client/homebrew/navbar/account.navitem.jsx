const React = require('react');
const createClass = require('create-react-class');
const Nav = require('naturalcrit/nav/nav.jsx');
const request = require('superagent');

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
			// Reset divider position
			window.localStorage.removeItem('naturalcrit-pane-split');
			// Clear login cookie
			document.cookie = `nc_session=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;samesite=lax;${window.domain ? `domain=${window.domain}` : ''}`;
			window.location = '/';
		};
	},

	localLogin : async function(){
		const username = prompt('Enter username:');
		if(!username) {return;}

		const expiry = new Date;
		expiry.setFullYear(expiry.getFullYear() + 1);

		const token = await request.post('/login')
				.send({ username })
				.then((response)=>{
					return response.body;
				})
				.catch((err)=>{
					return null;
				});
		if(!token) return;

		document.cookie = `nc_session=${token};expires=${expiry};path=/;samesite=lax;${window.domain ? `domain=${window.domain}` : ''}`;
		window.location.reload(true);
	},

	render : function(){
		//  Logged in
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

		//  Logged out
		//  LOCAL ONLY
		if(global.config.local) {
			return <Nav.item color='teal' icon='fas fa-sign-in-alt' onClick={this.localLogin}>
				login
			</Nav.item>;
		};

		// Logged out
		// Production site
		return <Nav.item href={`https://www.naturalcrit.com/login?redirect=${this.state.url}`} color='teal' icon='fas fa-sign-in-alt'>
			login
		</Nav.item>;
	}
});

module.exports = Account;
