const React = require('react');
const _     = require('lodash');

const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../brewEditor/brewEditor.smart.jsx');
const BrewRenderer = require('../brewRenderer/brewRenderer.smart.jsx');


const BrewInterface = React.createClass({

	handleSplitMove : function(){
		console.log('split move!');
	},
	render: function(){
		return <SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
			<Editor ref='editor'/>
			<BrewRenderer />
		</SplitPane>
	}
});

module.exports = BrewInterface;
