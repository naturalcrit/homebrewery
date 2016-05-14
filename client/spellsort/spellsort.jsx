var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Nav = require('naturalcrit/nav/nav.jsx');
var Navbar = require('./navbar/navbar.jsx');

var SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
var SpellRenderer = require('./spellRenderer/spellRenderer.jsx');
var Sorter = require('./sorter/sorter.jsx');

var SpellSort = React.createClass({

	getDefaultProps: function() {
		return {
			spells : []
		};
	},

	handleSplitMove : function(){

	},

	render : function(){
		console.log(this.props.spells);

		return <div className='spellsort page'>
			<Navbar>
				<Nav.section>
					yo
				</Nav.section>
			</Navbar>
			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove} ref='pane'>

					<Sorter spells={this.props.spells} />
					<SpellRenderer spells={this.props.spells} />

				</SplitPane>
			</div>
		</div>
	}
});

module.exports = SpellSort;
