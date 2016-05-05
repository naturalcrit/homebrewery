var React = require('react');
var _ = require('lodash');
var cx = require('classnames');


var Nav = require('naturalCrit/nav/nav.jsx');



var Navbar = React.createClass({

	render : function(){
		return <Nav.base>
			<Nav.section>
				<Nav.logo />
				<Nav.item href='/homebrew' className='homebrewLogo'>
					<div>The Homebrewery</div>
				</Nav.item>
				<Nav.item>v1.5.0</Nav.item>
			</Nav.section>





				{this.props.children}
		</Nav.base>
	}
});

module.exports = Navbar;
