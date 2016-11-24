const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const BrewItem = require('./brewItem/brewItem.jsx');

const UserPage = React.createClass({
	getDefaultProps: function() {
		return {
			username : '',
			brews : []
		};
	},

	renderBrews : function(){
		return _.map(this.props.brews, (brew) => {
			return <BrewItem brew={brew} />
		});
	},

	render : function(){
		console.log(this.props.brews);

		return <div className='userPage page'>
			<Navbar>
				<Nav.section>
					holla
				</Nav.section>
			</Navbar>

			<div className='content'>
				<div className='phb'>
					<h1>{this.props.username}</h1>
					{this.renderBrews()}
				</div>
			</div>
		</div>
	}
});

module.exports = UserPage;
