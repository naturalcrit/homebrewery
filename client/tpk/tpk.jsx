var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Nav = require('naturalcrit/nav/nav.jsx');
var Navbar = require('./navbar/navbar.jsx');

var SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
var SheetEditor = require('./sheetEditor/sheetEditor.jsx');


var TPK = React.createClass({


	getInitialState: function() {
		return {
			sheetCode: ''
		};
	},

	//remove later
	componentDidMount: function() {
		this.setState({
			sheetCode : localStorage.getItem('temp')
		})
	},

	handleSplitMove : function(){
		this.refs.editor.update();
	},

	handleCodeChange : function(code){
		this.setState({
			sheetCode : code
		});

		localStorage.setItem('temp', code);
	},

	render : function(){
		return <div className='tpk page'>
			<Navbar>
				<Nav.section>
					<Nav.item>
						yo dawg
					</Nav.item>
				</Nav.section>
			</Navbar>
			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
					<SheetEditor value={this.state.sheetCode} onChange={this.handleCodeChange} ref='editor' />
					<div>
						{this.state.sheetCode}
					</div>
				</SplitPane>
			</div>
		</div>
	}
});

module.exports = TPK;
