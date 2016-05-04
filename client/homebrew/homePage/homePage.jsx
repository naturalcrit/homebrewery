var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

//var Statusbar = require('../statusbar/statusbar.jsx');
var PageContainer = require('../pageContainer/pageContainer.jsx');
//var Editor = require('../editor/editor.jsx');



var Nav = require('naturalCrit/nav/nav.jsx');
var Navbar = require('../navbar/navbar.jsx');

var RedditShare = require('../navbar/redditShare.navitem.jsx');

var SplitPane = require('../splitPane/splitPane.jsx');



var CodeEditor = require('naturalcrit/codeEditor/codeEditor.jsx');




//var KEY = 'naturalCrit-homebrew';

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
			<div className='homePage page'>
				<Navbar>
					<RedditShare brew={{text : this.state.text}}/>

					<Nav.item
						newTab={true}
						href='https://github.com/stolksdorf/naturalcrit/issues'
						color='red'
						icon='fa-bug'>
						issue?
					</Nav.item>
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

				<div className='content'>
					<SplitPane>
						<CodeEditor wrap={true} language='gfm' value={this.state.text} onChange={this.handleTextChange} />
						<div>{this.state.text}</div>
					</SplitPane>


				</div>

				{/*
				<a href='/homebrew/new' className='floatingNewButton'>
					Create your own <i className='fa fa-magic' />
				</a>
				*/}
			</div>
		);
	}
});

module.exports = HomePage;

/*
<SplitPane>


	<PageContainer text={this.state.text} />
	<Editor text={this.state.text} onChange={this.handleTextChange} />
</SplitPane>

*/



/* Test code
<div className='content'>
	<SplitPane>
		<div className='woo'>
			one
		</div>
		<div className='temp'>
			yo
			<div className='tooBig' />
		</div>
	</SplitPane>
</div>
*/