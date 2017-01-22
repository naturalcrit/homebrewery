const React = require('react');
const _ = require('lodash');

const Nav = require('naturalcrit/nav/nav.jsx');
const Store = require('homebrewery/brew.store.js');

const Navbar = React.createClass({
	render : function(){
		return <Nav.base>
			<Nav.section>
				<Nav.logo />
				<Nav.item href='/' className='homebrewLogo'>
					<div>The Homebrewery</div>
				</Nav.item>
				<Nav.item>{`v${Store.getVersion()}`}</Nav.item>
			</Nav.section>
			{this.props.children}
		</Nav.base>
	}
});

module.exports = Navbar;
