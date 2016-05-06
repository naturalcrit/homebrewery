var React = require('react');
var Icon = require('naturalcrit/icon.svg.jsx');

var Logo = React.createClass({
	getDefaultProps: function() {
		return {
			hoverSlide : false
		};
	},

	render : function(){
		return <a className='logo' {... this.props} href='/'>
			<Icon />
			<span className='name'>
				Natural<span className='crit'>Crit</span>
			</span>
		</a>
	}
});

module.exports = Logo;
