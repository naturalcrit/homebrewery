var React = require('react');
var _ = require('lodash');

var Nav = require('naturalcrit/nav/nav.jsx');

var Navbar = React.createClass({
	getInitialState: function() {
		return {
			showNonChromeWarning : false
		};
	},

	componentDidMount: function() {
		var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
		this.setState({
			showNonChromeWarning : !isChrome
		})
	},

	renderChromeWarning : function(){
		if(!this.state.showNonChromeWarning) return;
		return <Nav.item className='warning' icon='fa-exclamation-triangle'>
			Optimized for Chrome
			<div className='dropdown'>
				If you are experiencing rendering issues, use Chrome instead
			</div>
		</Nav.item>
	},

	render : function(){
		return <Nav.base>
			<Nav.section>
				<Nav.logo />
				<Nav.item href='/' className='homebrewLogo'>
					<div>The Homebrewery</div>
				</Nav.item>
				<Nav.item>v2.2.6</Nav.item>

				{this.renderChromeWarning()}
			</Nav.section>
			{this.props.children}
		</Nav.base>
	}
});

module.exports = Navbar;
