var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var PHB = require('./phb/phb.jsx');
var Editor = require('./editor/editor.jsx');


var Snippets = require('./editor/snippets');

var KEY = 'naturalCrit-homebrew';





var Homebrew = React.createClass({

	getInitialState: function() {
		return {
			text : Snippets.intro
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
