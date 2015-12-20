var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var CreateRouter = require('pico-router').createRouter;

var PHB = require('./phb/phb.jsx');
var Editor = require('./editor/editor.jsx');


//var Snippets = require('./editor/snippets');

var KEY = 'naturalCrit-homebrew';



var Router = CreateRouter({
	'/homebrew' : 'home',
	'/homebrew/edit/:id' : function(args){

	},
	'/homebrew/share/:id' : function(args){

	}
});


var Homebrew = React.createClass({
	getDefaultProps: function() {
		return {
			text : ""
		};
	},

	getInitialState: function() {
		return {
			text : "# Holla"
		};
	},

	componentDidMount: function() {
		var storage = localStorage.getItem(KEY);
		if(storage){
			this.setState({
				text : storage
			})
		}
	},

	handleTextChange : function(text){
		this.setState({
			text : text
		});

		localStorage.setItem(KEY, text);
	},

	render : function(){
		var self = this;
		return(
			<div className='homebrew'>
				<Editor text={this.state.text} onChange={this.handleTextChange} />
				<PHB text={this.state.text} />
			</div>
		);
	}
});

module.exports = Homebrew;
