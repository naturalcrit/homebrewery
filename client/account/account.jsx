const React = require('react');
const createClass = require('create-react-class');
const CreateRouter = require('pico-router').createRouter;

const LoginPage = require('./pages/LoginPage/loginPage.jsx');
const RegisterPage = require('./pages/RegisterPage/registerPage.jsx');
const AccountPage = require('./pages/AccountPage/accountPage.jsx');

let Router;
const Account = createClass({
	getDefaultProps : function() {
		return {
			url          : '',
			version      : '0.0.0',
			user         : null,
			errorMessage : null
		};
	},
	componentWillMount : function() {
		global.account = this.props.user;
		global.version = this.props.version;

		Router = CreateRouter({
			'/login' : ()=>{
				return <LoginPage errorMessage={this.props.errorMessage}
					redirect={this.props.url} />;
			},
			'/register' : ()=>{
				return <RegisterPage errorMessage={this.props.errorMessage} />;
			},
			'/account/' : ()=>{
				return <AccountPage />;
			}
		});
	},
	render : function(){
		return <div className='account'>
			<Router defaultUrl={this.props.url}/>
		</div>;
	}
});

module.exports = Account;
