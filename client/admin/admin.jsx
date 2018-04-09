const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

const HomebrewAdmin = require('./homebrewAdmin/homebrewAdmin.jsx');

const Admin = createClass({
	getDefaultProps : function() {
		return {
			url       : '',
			admin_key : '',
			homebrews : [],
		};
	},

	render : function(){
		return (
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
