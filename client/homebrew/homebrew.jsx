const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

const CreateRouter = require('pico-router').createRouter;
const Actions = require('homebrewery/brew.actions.js');

const HomePage = require('./pages/homePage/homePage.jsx');
const EditPage = require('./pages/editPage/editPage.jsx');
//const UserPage = require('./pages/userPage/userPage.jsx');
const SharePage = require('./pages/sharePage/sharePage.jsx');
const NewPage   = require('./pages/newPage/newPage.jsx');
//const ErrorPage = require('./pages/errorPage/errorPage.jsx');
const PrintPage = require('./pages/printPage/printPage.jsx');

let Router;
const Homebrew = React.createClass({
	getDefaultProps: function() {
		return {
			url : '',
			version : '0.0.0',
			user : undefined,

			brew : {},
			brews : []
		};
	},
	componentWillMount: function() {
		//TODO: remove
		global.account = this.props.account;
		global.version = this.props.version;

		Actions.init({
			version : this.props.version,
			brew : this.props.brew,
			account : this.props.account
		});


		Router = CreateRouter({
			'/edit/:id' : <EditPage />,
			'/share/:id' : <SharePage />,
			/*
			'/user/:username' : (args) => {
				return <UserPage
					username={args.username}
					brews={this.props.brews}
				/>
			},*/
			'/print/:id' : (args, query) => {
				return <PrintPage brew={this.props.brew} query={query}/>;
			},
			'/print' : (args, query) => {
				return <PrintPage query={query}/>;
			},
			'/new' : <NewPage />,
			'/changelog' : <SharePage />,
			'*' : <HomePage />,
		});
	},
	render : function(){
		return <div className='homebrew'>
			<Router initialUrl={this.props.url}/>
		</div>
	}
});

module.exports = Homebrew;
