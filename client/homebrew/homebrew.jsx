const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

const CreateRouter = require('pico-router').createRouter;

const HomePage = require('./pages/homePage/homePage.jsx');
const EditPage = require('./pages/editPage/editPage.jsx');
const UserPage = require('./pages/userPage/userPage.jsx');
const SharePage = require('./pages/sharePage/sharePage.jsx');
const NewPage = require('./pages/newPage/newPage.jsx');
const ErrorPage = require('./pages/errorPage/errorPage.jsx');
const PrintPage = require('./pages/printPage/printPage.jsx');

let Router;
const Homebrew = createClass({
	getDefaultProps : function() {
		return {
			url         : '',
			welcomeText : '',
			changelog   : '',
			version     : '0.0.0',
			account     : null,
			brew        : {
				title     : '',
				text      : '',
				shareId   : null,
				editId    : null,
				createdAt : null,
				updatedAt : null,
			}
		};
	},
	componentWillMount : function() {
		global.account = this.props.account;
		global.version = this.props.version;


		Router = CreateRouter({
			'/edit/:id' : (args)=>{
				if(!this.props.brew.editId){
					return <ErrorPage errorId={args.id}/>;
				}

				return <EditPage
					id={args.id}
					brew={this.props.brew} />;
			},

			'/share/:id' : (args)=>{
				if(!this.props.brew.shareId){
					return <ErrorPage errorId={args.id}/>;
				}

				return <SharePage
					id={args.id}
					brew={this.props.brew} />;
			},
			'/user/:username' : (args)=>{
				return <UserPage
					username={args.username}
					brews={this.props.brews}
				/>;
			},
			'/print/:id' : (args, query)=>{
				return <PrintPage brew={this.props.brew} query={query}/>;
			},
			'/print' : (args, query)=>{
				return <PrintPage query={query}/>;
			},
			'/new' : (args)=>{
				return <NewPage />;
			},
			'/changelog' : (args)=>{
				return <SharePage
					brew={{ title: 'Changelog', text: this.props.changelog }} />;
			},
			'*' : <HomePage
				welcomeText={this.props.welcomeText} />,
		});
	},
	render : function(){
		return <div className='homebrew'>
			<Router defaultUrl={this.props.url}/>
		</div>;
	}
});

module.exports = Homebrew;
