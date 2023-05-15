const React = require('react');
import { LinkItem } from './menubarExtensions.jsx';


module.exports = function(props){
	return <LinkItem href={`/print/${props.shareId}?dialog=true`} hotkeys={{ mac: ['⌘', 'P'], pc: ['Ctrl', 'P'] }}>Print</LinkItem>;
};
