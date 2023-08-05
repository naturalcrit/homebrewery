const React = require('react');
import { LinkItem } from './menubarExtensions.jsx';


const SourceItems = {
	view : function(props){
		return <LinkItem
			href={`/source/${props.shareId}`}
			target='_blank'
			rel='noopener noreferrer'>view</LinkItem>;
	},

    download : function(props){
		return <LinkItem
			href={`/download/${props.shareId}`}
			target='_blank'
			rel='noopener noreferrer'>Download</LinkItem>;
	},

    clone : function(props){
		return <LinkItem
			href={`/new/${props.shareId}`}
			target='_blank'
			rel='noopener noreferrer'>Clone to New</LinkItem>;
	}

};

module.exports = { SourceItems };