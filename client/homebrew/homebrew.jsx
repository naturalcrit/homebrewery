var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var CreateRouter = require('pico-router').createRouter;

var HomePage = require('./pages/homePage/homePage.jsx');
var EditPage = require('./pages/editPage/editPage.jsx');
var SharePage = require('./pages/sharePage/sharePage.jsx');
var NewPage = require('./pages/newPage/newPage.jsx');

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
				return <EditPage
					ver={this.props.version}
					id={args.id}
					brew={this.props.brew} />
			},

			'/share/:id' : (args) => {
				return <SharePage
					ver={this.props.version}
					id={args.id}
					brew={this.props.brew} />
			},
			'/changelog' : (args) => {
				return <SharePage
					ver={this.props.version}
					brew={{title : 'Changelog', text : this.props.changelog}} />
			},
			'/new' : (args) => {
				return <NewPage ver={this.props.version} />
			},
			'*' : <HomePage
					ver={this.props.version}
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
