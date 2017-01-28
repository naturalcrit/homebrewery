const React = require('react');
const _ = require('lodash');

const Nav = require('naturalcrit/nav/nav.jsx');

const BrewLookup = require('./brewLookup/brewLookup.jsx');
const AdminSearch = require('./adminSearch/adminSearch.jsx');
const InvalidBrew = require('./invalidBrew/invalidBrew.jsx');

const Admin = React.createClass({
	getDefaultProps: function() {
		return {
			admin_key : '',
		};
	},

	renderNavbar : function(){
		return <Nav.base>
			<Nav.section>
				<Nav.item icon='fa-magic' className='homebreweryLogo'>
					Homebrewery Admin
				</Nav.item>
			</Nav.section>
		</Nav.base>
	},

	render : function(){
		return <div className='admin'>
			{this.renderNavbar()}
			<main className='content'>
				<BrewLookup adminKey={this.props.admin_key} />
				<AdminSearch adminKey={this.props.admin_key} />

				<div className='dangerZone'>Danger Zone</div>

				<InvalidBrew adminKey={this.props.admin_key} />
			</main>
		</div>
	}
});

module.exports = Admin;
