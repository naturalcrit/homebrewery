var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Logo = require('naturalCrit/logo/logo.jsx');

var Statusbar = React.createClass({
	getDefaultProps: function() {
		return {
		};
	},

	render : function(){
		return <div className='statusbar'>
			<Logo
				hoverSlide={true}
			/>
			<div className='left'>
				<a href='/splatsheet' className='toolName'>
					The SplatSheet
				</a>
			</div>
			<div className='controls right'>

			</div>
		</div>
	}
});

module.exports = Statusbar;
