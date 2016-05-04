var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Statusbar = require('../statusbar/statusbar.jsx');
var PageContainer = require('../pageContainer/pageContainer.jsx');
var Editor = require('../editor/editor.jsx');

//var WelcomeText = require('./welcomeMessage.js');




var Nav = require('naturalCrit/nav/nav.jsx');

var Navbar = require('../navbar/navbar.jsx');







var KEY = 'naturalCrit-homebrew';

var HomePage = React.createClass({

	getDefaultProps: function() {
		return {
			welcomeText : ""
		};
	},

	getInitialState: function() {
		return {
			text: this.props.welcomeText
		};
	},

	componentDidMount: function() {
		/*
		var storage = localStorage.getItem(KEY);
		if(storage){
			this.setState({
				text : storage
			})
		}
		*/
	},

	handleTextChange : function(text){
		this.setState({
			text : text
		});

		//localStorage.setItem(KEY, text);
	},

	render : function(){
		return(
			<div className='homePage'>

				<Navbar>
					<Nav.item
						href='/homebrew/changelog'
						color='purple'
						icon='fa-file-text-o'>
						Changelog
					</Nav.item>
					<Nav.item
						href='/homebrew/new'
						color='green'
						icon='fa-external-link'>
						New Brew
					</Nav.item>
				</Navbar>


				<div className='paneSplit'>
					<div className='leftPane'>
						<Editor text={this.state.text} onChange={this.handleTextChange} />
					</div>
					<div className='rightPane'>
						<PageContainer text={this.state.text} />
					</div>
				</div>

				<a href='/homebrew/new' className='floatingNewButton'>
					Create your own <i className='fa fa-magic' />
				</a>
			</div>
		);
	}
});

module.exports = HomePage;
