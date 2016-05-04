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
			</Nav.section>

			<Nav.section>
				{this.props.children}
			</Nav.section>
		</Nav.base>
	}
});

module.exports = Navbar;
