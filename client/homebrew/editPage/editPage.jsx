var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var PHB = require('../phb/phb.jsx');
var Editor = require('../editor/editor.jsx');

var request = require("superagent");

var EditPage = React.createClass({
	getDefaultProps: function() {
		return {
			text : "",
			id : null
		};
	},

	getInitialState: function() {
		return {
			text: this.props.text
		};
	},

	handleTextChange : function(text){
		this.setState({
			text : text
		});

		//Ajax time
	},

	render : function(){
		var self = this;
		return(
			<div className='editPage'>
				<Editor text={this.state.text} onChange={this.handleTextChange} />
				<PHB text={this.state.text} />
			</div>
		);
	}
});

module.exports = EditPage;
