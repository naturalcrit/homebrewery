const React = require('react');
import { LinkItem } from './menubarExtensions.jsx';

module.exports = function(){
	return <LinkItem hotkeys={{ mac: ['⌘', 'N'], pc: ['Ctrl', 'N'] }} href='/new'>New</LinkItem>;
};
