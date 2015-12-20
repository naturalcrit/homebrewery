var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Statusbar = React.createClass({

	render : function(){
		var self = this;
		return(
			<div className='statusbar'>
				Statusbar Ready!
			</div>
		);
	}
});

module.exports = Statusbar;
