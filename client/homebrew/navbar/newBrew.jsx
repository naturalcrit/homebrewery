const React = require('react');
import * as Toolbar from '@radix-ui/react-toolbar';




module.exports = function(props){
	return <Toolbar.Link
		href='/new'
		color='purple'
		icon='fas fa-plus-square'>
		new
	</Toolbar.Link>;
};
