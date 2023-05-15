const React = require('react');
import * as Menubar from '@radix-ui/react-menubar';

const BrewTitle = function(props) {
	return <div role='menuitem' className='brew-title' data-radix-collection-item>
		{props.title}
	</div>;
};

module.exports = BrewTitle;