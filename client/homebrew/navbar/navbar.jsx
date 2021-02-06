require('./navbar.less');
const React = require('react');
const createClass = require('create-react-class');

const Nav = require('naturalcrit/nav/nav.jsx');
const PatreonNavItem = require('./patreon.navitem.jsx');

const Navbar = createClass({
	getInitialState : function() {
		return {
			ver : '0.0.0'
		};
	},

	componentDidMount : function() {
		this.setState({
			ver : window.version
		});
	},

	render : function(){
		return <Nav.base>
			<Nav.section>
				<Nav.logo />
				<Nav.item href='/' className='homebrewLogo'>
					<div>The Homebrewery</div>
				</Nav.item>
				<Nav.item>{`v${this.state.ver}`}</Nav.item>
				<PatreonNavItem />
			</Nav.section>
			{this.props.children}
		</Nav.base>;
	}
});

module.exports = Navbar;
