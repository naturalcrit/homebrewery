require('./admin.less');
const React = require('react');
const createClass = require('create-react-class');

const BrewUtils = require('./brewUtils/brewUtils.jsx');

const Admin = createClass({
	getDefaultProps : function() {
		return {};
	},

	render : function(){
		return <div className='admin'>

			<header>
				<div className='container'>
					<i className='fas fa-rocket' />
					homebrewery admin
				</div>
			</header>
			<div className='container'>
				<BrewUtils />
			</div>
		</div>;
	}
});

module.exports = Admin;
