import './navbar.less';
import React from 'react';
import createReactClass from 'create-react-class';

import Nav from './nav.jsx';
import PatreonNavItem from './patreon.navitem.jsx';

const Navbar = createReactClass({
	displayName     : 'Navbar',
	getInitialState : function() {
  		return {
    		ver : global.version || '0.0.0'
  		};
	},

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
