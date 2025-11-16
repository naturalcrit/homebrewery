require('./navbar.less');
const React = require('react');
const createClass = require('create-react-class');

const Nav = require('client/homebrew/navbar/nav.jsx');
const PatreonNavItem = require('./patreon.navitem.jsx');

const Navbar = createClass({
	displayName     : 'Navbar',
	getInitialState : function() {
		return {
			//showNonChromeWarning : false,
			ver : '0.0.0'
		};
	},

	getInitialState : function() {
		return {
			ver : global.version
		};
	},

	/*
	renderChromeWarning : function(){
		if(!this.state.showNonChromeWarning) return;
		return <Nav.item className='warning' icon='fa-exclamation-triangle'>
			Optimized for Chrome
			<div className='dropdown'>
				If you are experiencing rendering issues, use Chrome instead
			</div>
		</Nav.item>
	},
*/
	render : function(){
		return <Nav.base>
			<Nav.section>
				<Nav.logo />
				<Nav.item href='/' className='homebrewLogo'>
					<div>The Homebrewery</div>
				</Nav.item>
				<Nav.item newTab={true} href='/changelog' color='purple' icon='far fa-file-alt'>
					{`v${this.state.ver}`}
				</Nav.item>
				<PatreonNavItem />
				{/*this.renderChromeWarning()*/}
			</Nav.section>
			{this.props.children}
		</Nav.base>;
	}
});

module.exports = Navbar;
