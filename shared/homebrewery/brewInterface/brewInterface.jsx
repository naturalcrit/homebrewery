const React = require('react');
const _     = require('lodash');

const SplitPane = require('naturalcrit/splitPane/splitPane.jsx');
const Editor = require('../brewEditor/brewEditor.smart.jsx');
const BrewRenderer = require('../brewRenderer/brewRenderer.smart.jsx');


const BrewInterface = React.createClass({
	handleSplitMove : function(){
		const BrewEditor = this.refs.editor.refs.wrappedComponent;
		BrewEditor.updateEditorSize();
	},
	render: function(){
		return <SplitPane onDragFinish={this.handleSplitMove} ref='pane'>
			<Editor ref='editor'/>
			<BrewRenderer />
		</SplitPane>
	}
});

module.exports = BrewInterface;
