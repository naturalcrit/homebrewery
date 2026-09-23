import './navbar.less';
import React from 'react';

import Nav from './nav.jsx';
import PatreonNavItem from './patreon.navitem.jsx';

const Navbar = ({ children })=>{
	const version = global.version || '0.0.0';

	return (
		<Nav.base>
			<Nav.section>
				<Nav.logo />
				<Nav.item href='/' className='homebrewLogo'>
					<div>The Homebrewery</div>
				</Nav.item>
				<Nav.item newTab={true} href='/changelog' color='purple' icon='far fa-file-alt'>
					{`v${version}`}
				</Nav.item>
				<PatreonNavItem />
				{/* this.renderChromeWarning() */}
			</Nav.section>
			{children}
		</Nav.base>
	);
};

export default Navbar;