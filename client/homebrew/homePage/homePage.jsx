var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Statusbar = require('../statusbar/statusbar.jsx');
var PageContainer = require('../pageContainer/pageContainer.jsx');
var Editor = require('../editor/editor.jsx');

var WelcomeText = require('./welcomeMessage.js');



var KEY = 'naturalCrit-homebrew';

var HomePage = React.createClass({

	getInitialState: function() {
		return {
			text: WelcomeText
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
		var self = this;
		return(
			<div className='homePage'>
				<Statusbar />
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
