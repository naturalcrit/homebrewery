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
					<HomebrewAdmin homebrews={this.props.homebrews} admin_key={this.props.admin_key} />
				</div>


			</div>
		);
	}
});

module.exports = Admin;
