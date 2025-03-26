const React = require('react');
const createClass = require('create-react-class');
// const Nav = require('naturalcrit/nav/nav.jsx');
const {Dropdown, NavItem} = require('./navbar.jsx');
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
			let domain = '';
			if(window.location?.hostname) {
				let domainArray = window.location.hostname.split('.');
				if(domainArray.length > 2){
					domainArray = [''].concat(domainArray.slice(-2));
				}
				domain = domainArray.join('.');
			}
			document.cookie = `nc_session=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;samesite=lax;${domain ? `domain=${domain}` : ''}`;
			window.location = '/';
		}
	},

	localLogin : async function(){
		const username = prompt('Enter username:');
		if(!username) {return;}

		const expiry = new Date;
		expiry.setFullYear(expiry.getFullYear() + 1);

		const token = await request.post('/local/login')
				.send({ username })
				.then((response)=>{
					return response.body;
				})
				.catch((err)=>{
					console.warn(err);
				});
		if(!token) return;

		document.cookie = `nc_session=${token};expires=${expiry};path=/;samesite=lax;${window.domain ? `domain=${window.domain}` : ''}`;
		window.location.reload(true);
	},

	render : function(){
		//  Logged in
		if(global.account){
			return <Dropdown id='accountMenu' trigger='click'>
				<NavItem
					className='account username'
					color='orange'
					icon='fas fa-user'
				>
					{global.account.username}
				</NavItem>
				<NavItem
					className='account'
					color='orange'
					icon='fas fa-user'
					href='/account'
				>
					account
				</NavItem>
				<NavItem
					className='logout'
					color='red'
					icon='fas fa-power-off'
					onClick={this.handleLogout}
				>
					logout
				</NavItem>
			</Dropdown>;
		}

		//  Logged out
		//  LOCAL ONLY
		if(global.config.local) {
			return <NavItem color='teal' icon='fas fa-sign-in-alt' onClick={this.localLogin}>
				login
			</NavItem>;
		};

		// Logged out
		// Production site
		return <NavItem href={`https://www.naturalcrit.com/login?redirect=${this.state.url}`} color='teal' icon='fas fa-sign-in-alt'>
			login
		</NavItem>;
	}
});

module.exports = Account;
