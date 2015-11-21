var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var DmDice = React.createClass({

	render : function(){
		var self = this;
		return(
			<div className='dmDice'>
				DmDice Ready!
			</div>
		);
	}
});

module.exports = DmDice;
