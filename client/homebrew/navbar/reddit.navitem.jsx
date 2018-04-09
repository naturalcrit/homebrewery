const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

//var striptags = require('striptags');

const Nav = require('naturalcrit/nav/nav.jsx');

const MAX_URL_SIZE = 2083;
const MAIN_URL = 'https://www.reddit.com/r/UnearthedArcana/submit?selftext=true';


const RedditShare = createClass({
	getDefaultProps : function() {
		return {
			brew : {
				title    : '',
				sharedId : '',
				text     : ''
			}
		};
	},

	getText : function(){

	},


	handleClick : function(){
		const url = [
			MAIN_URL,
			`title=${encodeURIComponent(this.props.brew.title ? this.props.brew.title : 'Check out my brew!')}`,

			`text=${encodeURIComponent(this.props.brew.text)}`


		].join('&');

		window.open(url, '_blank');
	},


	render : function(){
		return <Nav.item icon='fa-reddit-alien' color='red' onClick={this.handleClick}>
			share on reddit
		</Nav.item>;
	},

});

module.exports = RedditShare;