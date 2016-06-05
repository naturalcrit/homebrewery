var React = require('react');
var _ = require('lodash');

var Nav = require('naturalcrit/nav/nav.jsx');

var Navbar = React.createClass({
	render : function(){
		return <Nav.base>
			<Nav.section>
				<Nav.logo />
				<Nav.item href='/' className='homebrewLogo'>
					<div>The Homebrewery</div>
				</Nav.item>
				<Nav.item>v2.2.1</Nav.item>
			</Nav.section>
			{this.props.children}
		</Nav.base>
	}
});

module.exports = Navbar;
