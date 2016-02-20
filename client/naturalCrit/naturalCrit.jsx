var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var CreateRouter = require('pico-router').createRouter;

var Home = require('./home/home.jsx');
//var CombatManager = require('./combatManager/combatManager.jsx');
//var Homebrew = require('./homebrew/homebrew.jsx');


var Router = CreateRouter({
	'/' : <Home />,
	//'/combat' : <CombatManager />,
	//'/homebrew' : <Homebrew />,
});


var NaturalCrit = React.createClass({
	getDefaultProps: function() {
		return {
			url : '/',
			changelog : ''
		};
	},

	render : function(){
		return <div className='naturalCrit'>
			<Router initialUrl={this.props.url} scope={this}/>
		</div>
	},
});

module.exports = NaturalCrit;




