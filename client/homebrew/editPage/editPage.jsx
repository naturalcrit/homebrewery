var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var EditPage = React.createClass({
	getDefaultProps: function() {
		return {
			text : "",
			id : null
		};
	},

	render : function(){
		var self = this;
		return(
			<div className='editPage'>
				{this.props.id}
				EditPage Ready!
				{this.props.text}
			</div>
		);
	}
});

module.exports = EditPage;
