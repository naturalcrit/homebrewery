var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var CreateRouter = require('pico-router').createRouter;

var HomePage = require('./pages/homePage/homePage.jsx');
var EditPage = require('./pages/editPage/editPage.jsx');
var SharePage = require('./pages/sharePage/sharePage.jsx');
var NewPage = require('./pages/newPage/newPage.jsx');
var ErrorPage = require('./pages/errorPage/errorPage.jsx');
var PrintPage = require('./pages/printPage/printPage.jsx');

var Router;
var Homebrew = React.createClass({
	getDefaultProps: function() {
		return {
			url : '',
			welcomeText : '',
			changelog : '',
			version : '0.0.0',
			brew : {
				title : '',
				text : '',
				shareId : null,
				editId : null,
				createdAt : null,
				updatedAt : null,
			}
		};
	},
	componentWillMount: function() {
		Router = CreateRouter({
			'/edit/:id' : (args) => {
				if(!this.props.brew.editId){
					return <ErrorPage errorId={args.id}/>
				}

				return <EditPage
					id={args.id}
					brew={this.props.brew} />
			},

			'/share/:id' : (args) => {
				if(!this.props.brew.shareId){
					return <ErrorPage errorId={args.id}/>
				}

				return <SharePage
					id={args.id}
					brew={this.props.brew} />
			},
			'/changelog' : (args) => {
				return <SharePage
					brew={{title : 'Changelog', text : this.props.changelog}} />
			},
			'/print/:id' : (args, query) => {
				return <PrintPage brew={this.props.brew} query={query}/>;
			},
			'/print' : (args, query) => {
				return <PrintPage query={query}/>;
			},
			'/new' : (args) => {
				return <NewPage />
			},
			'*' : <HomePage
					welcomeText={this.props.welcomeText} />,
		});
	},
	render : function(){
		return <div className='homebrew'>
			<Router initialUrl={this.props.url}/>
		</div>
	}
});

module.exports = Homebrew;
