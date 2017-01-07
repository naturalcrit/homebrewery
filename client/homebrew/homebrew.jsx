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

const mapObject = (names, obj) => {
	return _.reduce(names, (r, name) => {
		if(obj[name]) r[name] = obj[name];
		return r;
	}, {});
};

let Router;
const Homebrew = React.createClass({
	getDefaultProps: function() {
		return {
			url : '',
			version : '0.0.0',
			loginPath : '',

			user : undefined,
			brew : undefined,
			brews : []
		};
	},
	componentWillMount: function() {
		console.log('user', this.props.user);
		console.log('loginpath', this.props.loginPath);

		//console.log(mapObject(['version', 'brew', 'account'], this.props));

		Actions.init(mapObject(['version', 'brew', 'account'], this.props));


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
