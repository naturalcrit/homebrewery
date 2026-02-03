import './navbar.less';
import React from 'react';
import createReactClass from 'create-react-class';

import Nav from './nav.jsx';
import PatreonNavItem from './patreon.navitem.jsx';

const Navbar = createReactClass({
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

export default Navbar;
