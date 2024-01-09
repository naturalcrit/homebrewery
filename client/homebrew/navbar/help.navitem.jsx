const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const Nav = require('naturalcrit/nav/nav.jsx');

const translateOpts = ['nav', 'helpDropdown'];

module.exports = function(props){
	''.setTranslationDefaults(translateOpts);
	return <Nav.dropdown>
		<Nav.item color='grey' icon='fas fa-question-circle'>
			{'needHelp'.translate()}
		</Nav.item>
		<Nav.item color='red' icon='fas fa-fw fa-bug'
			href={`https://www.reddit.com/r/homebrewery/submit?selftext=true&text=${encodeURIComponent(dedent`
			- **Browser(s)** :
			- **Operating System** :  
			- **Legacy or v3 Renderer** :
			- **Issue** :  `)}`}
			newTab={true}
			rel='noopener noreferrer'>
			{'report issue'.translate()}
		</Nav.item>
		<Nav.item color='green' icon='fas fa-question-circle'
			href='/faq'
			newTab={true}
			rel='noopener noreferrer'>
			{'faq'.translate()}
		</Nav.item>
		<Nav.item color='blue' icon='fas fa-fw fa-file-import'
			href='/migrate'
			newTab={true}
			rel='noopener noreferrer'>
			{'migrate'.translate()}
		</Nav.item>
	</Nav.dropdown>;
};
