const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
	return <Nav.dropdown>
		<Nav.item color='grey' icon='fas fa-question-circle'
		className="helpNavButton">
			Hilfe
		</Nav.item>
		<Nav.item color='red' icon='fas fa-fw fa-bug'
			href={'https://discord.gg/tffY7ssZuB'}
			newTab={true}
			rel='noopener noreferrer'>
			Bug melden
		</Nav.item>
		<Nav.item color='green' icon='fas fa-question-circle'
			href='/faq'
			newTab={true}
			rel='noopener noreferrer'>
			FAQ
		</Nav.item>
		<Nav.item color='orange' icon='fas fa-question-circle'
			href='https://brauerei.ilaris-online.de/new/thZtbIr1lFHh'
			rel='noopener noreferrer'>
			Beispiel
		</Nav.item>
	</Nav.dropdown>;
};
