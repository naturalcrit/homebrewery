var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Encounters = React.createClass({

	render : function(){
		var self = this;
		return(
			<div className='encounters'>
				Encounters Ready!
			</div>
		);
	}
});

module.exports = Encounters;
