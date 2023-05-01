const React = require('react');
import * as Toolbar from '@radix-ui/react-toolbar';

const BrewTitle = function(props) {
	return <Toolbar.Link asChild>
		<div>{props.title}</div>
	</Toolbar.Link>;
};

module.exports = BrewTitle;