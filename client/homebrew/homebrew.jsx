var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var CreateRouter = require('pico-router').createRouter;

var HomePage = require('./homePage/homePage.jsx');
var EditPage = require('./editPage/editPage.jsx');
var SharePage = require('./sharePage/sharePage.jsx');

var Router;
var Homebrew = React.createClass({
	getDefaultProps: function() {
		return {
			url : "",
			welcomeText : "",
			changelog : "",
			brew : {
				text : "",
				shareId : null,
				editId : null,
				createdAt : null,
				updatedAt : null,
			}
		};
	},
	componentWillMount: function() {
		Router = CreateRouter({
			'/homebrew/edit/:id' : (args) => {
				return <EditPage id={args.id} entry={this.props.brew} />
			},

			'/homebrew/share/:id' : (args) => {
				return <SharePage id={args.id} entry={this.props.brew} />
			},
			'/homebrew/changelog' : (args) => {
				return <SharePage entry={{text : this.props.changelog}} />
			},
			'/homebrew*' : <HomePage welcomeText={this.props.welcomeText} />,
		});
	},
	render : function(){
		return(
			<div className='homebrew'>
				<Router initialUrl={this.props.url}/>
			</div>
		);
	}
});

module.exports = Homebrew;
