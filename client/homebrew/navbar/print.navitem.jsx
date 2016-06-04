var React = require('react');
var Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.item newTab={true} href={'/print/' + props.shareId +'?dialog=true'} color='purple' icon='fa-print'>
		print
	</Nav.item>
};