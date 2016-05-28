var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var HomebrewAdmin = require('./homebrewAdmin/homebrewAdmin.jsx');

var Admin = React.createClass({
	getDefaultProps: function() {
		return {
			url : "",
			admin_key : "",
			homebrews : [],
		};
	},

	render : function(){
		var self = this;
		return(
			<div className='admin'>

				<header>
					<div className='container'>
						<i className='fa fa-rocket' />
						naturalcrit admin
					</div>
				</header>

				<div className='container'>

					<a target="_blank" href='https://www.google.com/analytics/web/?hl=en#report/defaultid/a72212009w109843310p114529111/'>Link to Google Analytics</a>

					<HomebrewAdmin homebrews={this.props.homebrews} admin_key={this.props.admin_key} />
				</div>


			</div>
		);
	}
});

module.exports = Admin;
