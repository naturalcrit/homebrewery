var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Nav = require('naturalcrit/nav/nav.jsx');
var Navbar = require('./navbar/navbar.jsx');

var SplitPane = require('naturalcrit/splitPane/splitPane.jsx');

var SpellSort = React.createClass({

	handleSplitMove : function(){

	},

	render : function(){
		return <div className='spellsort page'>
			<Navbar>

			</Navbar>
			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>

					<div>pane 1</div>
					<div>pane 2</div>

				</SplitPane>
			</div>
		</div>
	}
});

module.exports = SpellSort;
