var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var CreateRouter = require('pico-router').createRouter;

var CombatManager = require('./combatManager/combatManager.jsx');
//var Homebrew = require('./homebrew/homebrew.jsx');


var Router = CreateRouter({
	'/' : <CombatManager />,
	'/combat' : <CombatManager />,
});


var NaturalCrit = React.createClass({
	getDefaultProps: function() {
		return {
			url : '/'
		};
	},

	render : function(){
		return <div className='naturalCrit'>
			<Router initialUrl={this.props.url} />
		</div>
	},
});

module.exports = NaturalCrit;




