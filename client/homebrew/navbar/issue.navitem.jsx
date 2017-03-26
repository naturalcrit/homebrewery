var React = require('react');
var Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.item
		{...props}
		newTab={true}
		href='https://github.com/stolksdorf/homebrewery/issues'
		color='red'
		icon='fa-bug'>
		report issue
	</Nav.item>
};